import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { config } from "../../config";
import { createOrder, verifySignature } from "../../services/razorpay";
import { getTrialConfig } from "../../services/trial.service";
import { recordAffiliateCommission } from "../../services/affiliate.service";
import { mobileSuccess, mobileError } from "../utils/response";

// Feature list per plan type (same as webapp)
const featureMap: Record<string, string[]> = {
  SINGLE_CLASS: ["Access any 1 class (9-12)", "3D animated videos", "Notes & NCERT solutions", "PYQs / Important questions", "Quizzes", "Mobile & desktop access"],
  DUAL_CLASS: ["Access any 2 classes (9-12)", "3D animated videos", "Notes & NCERT solutions", "PYQs / Important questions", "Quizzes", "Mobile & desktop access"],
  FULL_ACCESS: ["All 4 classes (9, 10, 11, 12)", "3D animated videos", "Notes & NCERT solutions", "PYQs / Important questions", "Quizzes", "Priority support"],
};

// Canonical class-count plans (same as the webapp). Admin price edits stored in
// the plans_config setting override these per key.
const CLASS_PLANS: Record<string, any> = {
  SINGLE_CLASS: { monthlyAmount: 19900, quarterlyAmount: 219900, yearlyAmount: 149900, label: "Single Class", durationMonthly: 30, durationQuarterly: 90, durationYearly: 365, enabled: true, classSelection: 1 },
  DUAL_CLASS: { monthlyAmount: 34900, quarterlyAmount: 279900, yearlyAmount: 249900, label: "Dual Class", durationMonthly: 30, durationQuarterly: 90, durationYearly: 365, enabled: true, classSelection: 2 },
  FULL_ACCESS: { monthlyAmount: 49900, quarterlyAmount: 399900, yearlyAmount: 349900, label: "Full Access", durationMonthly: 30, durationQuarterly: 90, durationYearly: 365, enabled: true, classSelection: 0 },
};
const CLASS_PLAN_ORDER = ["SINGLE_CLASS", "DUAL_CLASS", "FULL_ACCESS"];

// Pick the amount/duration for the requested billing cycle (quarterly falls back to ~3x monthly / 90d).
function amountForCycle(pc: any, cycle: string): number {
  if (cycle === "monthly") return pc.monthlyAmount ?? (pc.amount ? Math.round(pc.amount / 10) : 0);
  if (cycle === "quarterly") return pc.quarterlyAmount ?? (pc.monthlyAmount ? pc.monthlyAmount * 3 : 0);
  return pc.yearlyAmount ?? pc.amount ?? 0;
}
function durationForCycle(pc: any, cycle: string): number {
  if (cycle === "monthly") return pc.durationMonthly ?? 30;
  if (cycle === "quarterly") return pc.durationQuarterly ?? 90;
  return pc.durationYearly ?? pc.duration ?? 365;
}

// Document downloads are included with every subscription — the paid add-on
// has been removed.

async function resolveClassPlans(): Promise<Record<string, any>> {
  const setting = await prisma.setting.findUnique({ where: { key: "plans_config" } });
  let saved: Record<string, any> = {};
  try { saved = setting ? JSON.parse(setting.value) : {}; } catch { saved = {}; }
  const merged: Record<string, any> = {};
  for (const key of CLASS_PLAN_ORDER) {
    merged[key] = { ...CLASS_PLANS[key], ...(saved[key] || {}) };
  }
  return merged;
}

// One trial per account, ever (matches the webapp guard).
async function hasUsedTrial(userId?: string): Promise<boolean> {
  if (!userId) return false;
  const prior = await prisma.subscription.findFirst({ where: { userId, plan: "TRIAL" }, select: { id: true } });
  return !!prior;
}

// Helper: validate coupon code, optionally checking if it applies to a specific plan
async function validateCoupon(code: string, planKey?: string): Promise<{ valid: boolean; discountPercent: number; message: string; applicablePlans: string[] }> {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (!coupon) return { valid: false, discountPercent: 0, message: "Invalid coupon code", applicablePlans: [] };
  if (!coupon.active) return { valid: false, discountPercent: 0, message: "This coupon is no longer active", applicablePlans: [] };
  const now = new Date();
  if (now < coupon.validFrom) return { valid: false, discountPercent: 0, message: "This coupon is not yet valid", applicablePlans: [] };
  if (now > coupon.validUntil) return { valid: false, discountPercent: 0, message: "This coupon has expired", applicablePlans: [] };
  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) return { valid: false, discountPercent: 0, message: "This coupon has reached its usage limit", applicablePlans: [] };
  // Check if coupon is restricted to specific plans
  const plans = (coupon.applicablePlans as string[]) || [];
  if (planKey && plans.length > 0 && !plans.includes(planKey)) {
    return { valid: false, discountPercent: 0, message: "This coupon is not valid for the selected plan", applicablePlans: plans };
  }
  return { valid: true, discountPercent: coupon.discountPercent, message: "Coupon applied", applicablePlans: plans };
}

// Helper: get plan config from settings DB, fallback to hardcoded config
async function getPlanConfig(planKey: string): Promise<{ monthlyAmount: number; yearlyAmount: number; durationMonthly: number; durationYearly: number; label: string; classSelection: number; amount?: number; duration?: number }> {
  // Free trial: admin-controlled price/duration, all classes, every billing cycle
  // resolves to the same short window so it can never be sold as a yearly plan.
  if (planKey === "TRIAL") {
    const t = await getTrialConfig();
    return {
      monthlyAmount: 0, quarterlyAmount: 0, yearlyAmount: 0,
      durationMonthly: t.durationDays, durationQuarterly: t.durationDays, durationYearly: t.durationDays,
      label: t.label, classSelection: 0,
    } as any;
  }
  // Class-count plans (Single/Dual/Full) resolve first, with admin overrides.
  const classPlans = await resolveClassPlans();
  if (classPlans[planKey]) return classPlans[planKey];
  const setting = await prisma.setting.findUnique({ where: { key: "plans_config" } });
  if (setting) {
    const plans = JSON.parse(setting.value);
    if (plans[planKey]) return plans[planKey];
  }
  const fallback = config.plans[planKey as keyof typeof config.plans];
  if (!fallback) return { monthlyAmount: 0, yearlyAmount: 0, durationMonthly: 30, durationYearly: 365, label: planKey, classSelection: 0 };
  return { 
    monthlyAmount: fallback.monthlyAmount, 
    yearlyAmount: fallback.yearlyAmount, 
    durationMonthly: fallback.durationMonthly, 
    durationYearly: fallback.durationYearly, 
    label: fallback.label, 
    classSelection: 0 
  };
}

// GET /api/subscription-plan — list plans with features, classSelection, classes (matches webapp)
export async function getSubscriptionPlans(req: Request, res: Response) {
  try {
    const classes = await prisma.class.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } });

    // Only the three class-count plans (Single / Dual / Full), matching the webapp.
    const classPlans = await resolveClassPlans();
    const plans = CLASS_PLAN_ORDER
      .filter((key) => classPlans[key].enabled !== false)
      .map((key) => {
        const v = classPlans[key];
        return {
          id: key,
          name: v.label,
          price: (v.yearlyAmount ?? 0) / 100,
          monthlyPrice: (v.monthlyAmount ?? 0) / 100,
          quarterlyPrice: (v.quarterlyAmount ?? (v.monthlyAmount ? v.monthlyAmount * 3 : 0)) / 100,
          yearlyPrice: (v.yearlyAmount ?? 0) / 100,
          duration: v.durationYearly ?? 365,
          durationQuarterly: v.durationQuarterly ?? 90,
          billingCycle: "yearly",
          features: featureMap[key] || [],
          classSelection: v.classSelection || 0,
          popular: key === "DUAL_CLASS",
          downloadAddonPrice: 0, // downloads included; add-on removed
        };
      });

    // Free trial goes first, but only while it's enabled and this user hasn't used it.
    const trial = await getTrialConfig();
    if (trial.enabled && !(await hasUsedTrial(req.user?.id))) {
      plans.unshift({
        id: "TRIAL",
        name: trial.label,
        price: 0, monthlyPrice: 0, quarterlyPrice: 0, yearlyPrice: 0,
        duration: trial.durationDays,
        durationQuarterly: trial.durationDays,
        billingCycle: "yearly",
        features: [
          `Full access for ${trial.durationDays} days`,
          "All 4 classes (9, 10, 11, 12)",
          "3D animated & lecture videos",
          "Notes, NCERT solutions & PYQs",
        ],
        classSelection: 0,
        popular: false,
        isTrial: true,
        downloadAddonPrice: 0,
      } as any);
    }

    return mobileSuccess(res, { plans, classes, downloadAddonPercent: 0 });
  } catch (e) {
    console.error("Mobile getSubscriptionPlans error:", e);
    return mobileError(res, "Failed to fetch plans");
  }
}

// POST /api/subscription-plan/start-trial — activate the free trial, no payment.
export async function startTrial(req: Request, res: Response) {
  try {
    if (!req.user) return mobileError(res, "Authentication required", 401);

    const trial = await getTrialConfig();
    if (!trial.enabled) return mobileError(res, "The free trial is not available right now", 400);
    if (await hasUsedTrial(req.user.id)) return mobileError(res, "You have already used your free trial", 400);

    const active = await prisma.subscription.findFirst({
      where: { userId: req.user.id, status: "ACTIVE", expiryDate: { gt: new Date() } },
      select: { id: true },
    });
    if (active) return mobileError(res, "You already have an active subscription", 400);

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + trial.durationDays);

    const allClasses = await prisma.class.findMany({ select: { id: true } });

    const subscription = await prisma.subscription.create({
      data: {
        userId: req.user.id,
        plan: "TRIAL",
        classesAccess: allClasses.map((c) => c.id),
        expiryDate,
        status: "ACTIVE",
        amount: 0,
        discountAmount: 0,
        downloadAddon: false,
      },
    });

    return mobileSuccess(res, {
      subscription_id: subscription.id,
      status: 1,
      expiry_date: subscription.expiryDate.toISOString(),
      plan: "TRIAL",
      download_addon: 0,
    }, `Your ${trial.durationDays}-day free trial is active`);
  } catch (e) {
    console.error("Mobile start trial error:", e);
    return mobileError(res, "Could not start your free trial");
  }
}

// GET /api/subscription-plan/validate-coupon?code=XXX&plan=PLAN_KEY — validate coupon
export async function validateCouponCode(req: Request, res: Response) {
  try {
    const { code, plan } = req.query;
    if (!code || typeof code !== "string") return mobileError(res, "Coupon code is required", 400);
    const planKey = typeof plan === "string" ? plan : undefined;
    const result = await validateCoupon(code, planKey);
    return mobileSuccess(res, result);
  } catch (e) {
    console.error("Mobile validateCoupon error:", e);
    return mobileError(res, "Failed to validate coupon");
  }
}

// GET /api/subscription-plan/user-subcription/:userId — user's subscription
export async function getUserSubscription(req: Request, res: Response) {
  try {
    // Use authenticated user, ignore param userId for security
    const userId = req.user?.id;
    if (!userId) return mobileError(res, "Authentication required", 401);

    const sub = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!sub) return mobileSuccess(res, null, "No subscription found");

    // Auto-expire
    if (sub.status === "ACTIVE" && sub.expiryDate < new Date()) {
      await prisma.subscription.update({ where: { id: sub.id }, data: { status: "EXPIRED" } });
      sub.status = "EXPIRED";
    }

    const data = {
      subscription_id: sub.id,
      user_id: sub.userId,
      plan_name: sub.plan,
      amount: sub.amount / 100,
      status: sub.status === "ACTIVE" ? 1 : 0,
      start_date: sub.startDate.toISOString(),
      expiry_date: sub.expiryDate.toISOString(),
      payment_id: sub.paymentId,
      created_at: sub.createdAt.toISOString(),
      classesAccess: sub.classesAccess || [],
      // 1 if the offline-downloads add-on is active (and the sub itself is active).
      download_addon: sub.downloadAddon && sub.status === "ACTIVE" ? 1 : 0,
    };

    return mobileSuccess(res, data);
  } catch (e) {
    console.error("Mobile getUserSubscription error:", e);
    return mobileError(res, "Failed to fetch subscription");
  }
}

// POST /api/subscription-plan/generate-order-id — create Razorpay order
export async function generateOrderId(req: Request, res: Response) {
  try {
    if (!req.user) return mobileError(res, "Authentication required", 401);

    const { plan_id, plan_key, plan, classesAccess, couponCode } = req.body;
    const planKey = plan_key || plan_id || plan;
    if (!planKey) return mobileError(res, "Plan is required", 400);

    const planConfig = await getPlanConfig(planKey);
    if (!planConfig) return mobileError(res, "Invalid plan", 400);

    // The trial is free — it never goes through Razorpay. See startTrial().
    if (planKey === "TRIAL") return mobileError(res, "The free trial does not require payment", 400);

    // Validate classesAccess based on plan's classSelection
    if (planConfig.classSelection > 0) {
      if (!classesAccess || classesAccess.length !== planConfig.classSelection) {
        return mobileError(res, `This plan requires exactly ${planConfig.classSelection} class(es)`, 400);
      }
    }

    const cycle = req.body.billingCycle || "yearly";
    let amount = amountForCycle(planConfig, cycle);

    let couponDiscount = 0;

    // Apply coupon if provided
    if (couponCode) {
      const couponResult = await validateCoupon(couponCode, planKey);
      if (!couponResult.valid) return mobileError(res, couponResult.message, 400);
      couponDiscount = Math.round(amount * couponResult.discountPercent / 100);
      amount -= couponDiscount;
    }

    // Downloads are included with every subscription — add-on removed.
    // Ensure minimum amount (Razorpay requires at least 100 paise = Rs 1)
    if (amount < 100) amount = 100;

    const receipt = `vl_${req.user.id.slice(-8)}_${Date.now()}`;
    const order = await createOrder(amount, "INR", receipt);

    return mobileSuccess(res, {
      id: order.id,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      plan_key: planKey,
      classesAccess,
      originalAmount: amount + couponDiscount,
      couponDiscount,
      couponCode,
      downloadAddon: true,
      addOnAmount: 0,
    });
  } catch (e: any) {
    console.error("Mobile generateOrderId error:", e);
    return mobileError(res, "Failed to create order");
  }
}

// POST /api/subscription-plan/purchase-plan — verify payment & activate subscription
export async function purchasePlan(req: Request, res: Response) {
  try {
    if (!req.user) return mobileError(res, "Authentication required", 401);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan_key, plan, classesAccess: reqClassesAccess, couponCode } = req.body;
    const planKey = plan_key || plan;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return mobileError(res, "Payment details required", 400);
    }

    const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) return mobileError(res, "Payment verification failed", 400);

    // The trial is free — it never goes through Razorpay. See startTrial().
    if (planKey === "TRIAL") return mobileError(res, "The free trial does not require payment", 400);

    const planConfig = await getPlanConfig(planKey);
    const cycle = req.body.billingCycle || "yearly";
    let amount = amountForCycle(planConfig, cycle);

    let discountAmount = 0;

    // Apply coupon discount
    if (couponCode) {
      const couponResult = await validateCoupon(couponCode, planKey);
      if (couponResult.valid) {
        const couponDisc = Math.round(amount * couponResult.discountPercent / 100);
        discountAmount += couponDisc;
        amount -= couponDisc;

        // Increment coupon usage
        await prisma.coupon.update({
          where: { code: couponCode.toUpperCase() },
          data: { usedCount: { increment: 1 } },
        });
      }
    }

    if (amount < 100) amount = 100;

    const duration = durationForCycle(planConfig, cycle);

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + duration);

    // Resolve classesAccess: if plan has classSelection > 0, use provided; otherwise grant all
    let resolvedClassesAccess: string[] = [];
    if (planConfig.classSelection > 0) {
      resolvedClassesAccess = reqClassesAccess || [];
    } else {
      const allClasses = await prisma.class.findMany({ select: { id: true } });
      resolvedClassesAccess = allClasses.map((c) => c.id);
    }

    // Expire existing subscriptions
    await prisma.subscription.updateMany({
      where: { userId: req.user.id, status: "ACTIVE" },
      data: { status: "EXPIRED" },
    });

    const subscription = await prisma.subscription.create({
      data: {
        userId: req.user.id,
        plan: planKey,
        classesAccess: resolvedClassesAccess,
        expiryDate,
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpaySignature: razorpay_signature,
        status: "ACTIVE",
        amount,
        couponCode: couponCode ? couponCode.toUpperCase() : null,
        discountAmount,
        downloadAddon: true,
      },
    });

    // Credit the affiliate if this sale used their referral code.
    await recordAffiliateCommission(subscription);

    return mobileSuccess(res, {
      subscription_id: subscription.id,
      status: 1,
      expiry_date: subscription.expiryDate.toISOString(),
      plan: planKey,
      classesAccess: resolvedClassesAccess,
      download_addon: 1,
    }, "Payment verified and subscription activated");
  } catch (e) {
    console.error("Mobile purchasePlan error:", e);
    return mobileError(res, "Payment verification failed");
  }
}

// GET /api/subscription-plan/cancel-plan/:id
export async function cancelPlan(req: Request, res: Response) {
  try {
    if (!req.user) return mobileError(res, "Authentication required", 401);

    const sub = await prisma.subscription.findFirst({
      where: { userId: req.user.id, status: "ACTIVE" },
    });
    if (!sub) return mobileError(res, "No active subscription found", 404);

    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "CANCELLED" },
    });

    return mobileSuccess(res, null, "Subscription cancelled");
  } catch (e) {
    console.error("Mobile cancelPlan error:", e);
    return mobileError(res, "Failed to cancel subscription");
  }
}
