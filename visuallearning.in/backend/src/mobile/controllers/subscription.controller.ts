import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { config } from "../../config";
import { createOrder, verifySignature } from "../../services/razorpay";
import { mobileSuccess, mobileError } from "../utils/response";

// Feature list per plan type (same as webapp)
const featureMap: Record<string, string[]> = {
  SINGLE_CLASS: ["3D Animated Videos", "Any 1 class of your choice", "All subjects in that class", "Video lectures in all languages", "Notes & PDFs", "Quiz", "Solved Board Question Papers"],
  MULTI_CLASS: ["3D Animated Videos", "Any 2 classes of your choice", "All subjects in selected classes", "Video lectures in all languages", "Notes & PDFs", "Quiz", "Solved Board Question Papers"],
  FULL_ACCESS: ["3D Animated Videos", "All classes (9-12)", "All subjects", "Video lectures in all languages", "Notes & PDFs", "Best value", "Quiz", "Solved Board Question Papers"],
  MONTHLY: ["3D Animated Videos", "All classes (9-12)", "All subjects", "Video lectures in all languages", "Notes & PDFs", "Quiz", "Solved Board Question Papers"],
  YEARLY: ["3D Animated Videos", "All classes (9-12)", "All subjects", "Video lectures in all languages", "Notes & PDFs", "Save 33%", "Quiz", "Solved Board Question Papers"],
  LIVE_CLASS: ["3D Animated Videos", "1 class of your choice (9-12)", "Small group of 10-15 students", "Live doubt clearing with expert teachers", "Weekly interactive sessions", "Session recordings access", "Quiz", "Solved Board Question Papers"],
};

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
async function getPlanConfig(planKey: string): Promise<{ amount: number; duration: number; label: string; classSelection: number }> {
  const setting = await prisma.setting.findUnique({ where: { key: "plans_config" } });
  if (setting) {
    const plans = JSON.parse(setting.value);
    if (plans[planKey]) return plans[planKey];
  }
  const fallback = config.plans[planKey as keyof typeof config.plans];
  return { amount: fallback.amount, duration: fallback.duration, label: fallback.label, classSelection: 0 };
}

// GET /api/subscription-plan — list plans with features, classSelection, classes (matches webapp)
export async function getSubscriptionPlans(_req: Request, res: Response) {
  try {
    const classes = await prisma.class.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } });

    const setting = await prisma.setting.findUnique({ where: { key: "plans_config" } });
    let plansConfig: Record<string, any> = {};

    if (setting) {
      plansConfig = JSON.parse(setting.value);
    } else {
      plansConfig = {
        SINGLE_CLASS: { amount: config.plans.SINGLE_CLASS.amount, label: "Single Class Plan", duration: 365, enabled: true, classSelection: 1, billingCycle: "yearly" },
        MULTI_CLASS: { amount: config.plans.MULTI_CLASS.amount, label: "Multi Class Pack", duration: 365, enabled: true, classSelection: 2, billingCycle: "yearly" },
        FULL_ACCESS: { amount: config.plans.FULL_ACCESS.amount, label: "Full Access Plan", duration: 365, enabled: true, classSelection: 0, billingCycle: "yearly" },
        MONTHLY: { amount: config.plans.MONTHLY.amount, label: "Monthly Plan", duration: 30, enabled: true, classSelection: 0, billingCycle: "monthly" },
        YEARLY: { amount: config.plans.YEARLY.amount, label: "Yearly Plan", duration: 365, enabled: true, classSelection: 0, billingCycle: "yearly" },
      };
    }

    const plans = Object.entries(plansConfig)
      .filter(([_, v]: [string, any]) => v.enabled)
      .map(([key, v]: [string, any]) => ({
        id: key,
        name: v.label,
        price: v.amount / 100,
        duration: v.duration,
        billingCycle: v.billingCycle || (v.duration <= 30 ? "monthly" : "yearly"),
        features: featureMap[key] || [],
        classSelection: v.classSelection || 0,
        popular: key === "MULTI_CLASS",
      }));

    return mobileSuccess(res, { plans, classes });
  } catch (e) {
    console.error("Mobile getSubscriptionPlans error:", e);
    return mobileError(res, "Failed to fetch plans");
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

    // Validate classesAccess based on plan's classSelection
    if (planConfig.classSelection > 0) {
      if (!classesAccess || classesAccess.length !== planConfig.classSelection) {
        return mobileError(res, `This plan requires exactly ${planConfig.classSelection} class(es)`, 400);
      }
    }

    let amount = planConfig.amount;
    let couponDiscount = 0;

    // Apply coupon if provided
    if (couponCode) {
      const couponResult = await validateCoupon(couponCode, planKey);
      if (!couponResult.valid) return mobileError(res, couponResult.message, 400);
      couponDiscount = Math.round(amount * couponResult.discountPercent / 100);
      amount -= couponDiscount;
    }

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
      originalAmount: planConfig.amount,
      couponDiscount,
      couponCode,
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

    const planConfig = await getPlanConfig(planKey);
    let amount = planConfig.amount;
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

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + planConfig.duration);

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
      },
    });

    return mobileSuccess(res, {
      subscription_id: subscription.id,
      status: 1,
      expiry_date: subscription.expiryDate.toISOString(),
      plan: planKey,
      classesAccess: resolvedClassesAccess,
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
