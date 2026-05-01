import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { config } from "../config";
import { createOrder, verifySignature } from "../services/razorpay";
import { success, error } from "../utils/apiResponse";
import { cacheGet, cacheSet } from "../utils/cache";

export const createOrderSchema = z.object({
  plan: z.string().min(1),
  classesAccess: z.array(z.string()).optional(),
  couponCode: z.string().optional(),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  plan: z.string().min(1),
  classesAccess: z.array(z.string()).optional(),
  couponCode: z.string().optional(),
});

// Helper: get plan config from settings DB, fallback to hardcoded config
async function getPlanConfig(planKey: string): Promise<{ amount: number; duration: number; label: string; classSelection: number }> {
  const setting = await prisma.setting.findUnique({ where: { key: "plans_config" } });
  if (setting) {
    const plans = JSON.parse(setting.value);
    if (plans[planKey]) {
      return plans[planKey];
    }
  }
  // Fallback to hardcoded config
  const fallback = config.plans[planKey as keyof typeof config.plans];
  return { amount: fallback.amount, duration: fallback.duration, label: fallback.label, classSelection: 0 };
}

// Helper: get upgrade discount config
async function getUpgradeDiscount(): Promise<number> {
  const setting = await prisma.setting.findUnique({ where: { key: "subscription_settings" } });
  if (setting) {
    const config = JSON.parse(setting.value);
    return config.upgradeDiscountPercent || 0;
  }
  return 0;
}

// Helper: validate and get coupon, optionally checking plan restriction
async function validateCoupon(code: string, planKey?: string): Promise<{ valid: boolean; discountPercent: number; message: string; applicablePlans: string[] }> {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (!coupon) return { valid: false, discountPercent: 0, message: "Invalid coupon code", applicablePlans: [] };
  if (!coupon.active) return { valid: false, discountPercent: 0, message: "This coupon is no longer active", applicablePlans: [] };
  const now = new Date();
  if (now < coupon.validFrom) return { valid: false, discountPercent: 0, message: "This coupon is not yet valid", applicablePlans: [] };
  if (now > coupon.validUntil) return { valid: false, discountPercent: 0, message: "This coupon has expired", applicablePlans: [] };
  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) return { valid: false, discountPercent: 0, message: "This coupon has reached its usage limit", applicablePlans: [] };
  const plans = (coupon.applicablePlans as string[]) || [];
  if (planKey && plans.length > 0 && !plans.includes(planKey)) {
    return { valid: false, discountPercent: 0, message: "This coupon is not valid for the selected plan", applicablePlans: plans };
  }
  return { valid: true, discountPercent: coupon.discountPercent, message: "Coupon applied", applicablePlans: plans };
}

export async function getPlans(req: Request, res: Response) {
  const cached = cacheGet("plans");
  if (cached) return success(res, cached);

  const classes = await prisma.class.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } });

  // Get plans from settings
  const setting = await prisma.setting.findUnique({ where: { key: "plans_config" } });
  let plansConfig: Record<string, any> = {};
  if (setting) {
    plansConfig = JSON.parse(setting.value);
  } else {
    // Fallback to hardcoded defaults
    plansConfig = {
      SINGLE_CLASS: { amount: config.plans.SINGLE_CLASS.amount, label: "Single Class Plan", duration: 365, enabled: true, classSelection: 1, billingCycle: "yearly" },
      MULTI_CLASS: { amount: config.plans.MULTI_CLASS.amount, label: "Multi Class Pack", duration: 365, enabled: true, classSelection: 2, billingCycle: "yearly" },
      FULL_ACCESS: { amount: config.plans.FULL_ACCESS.amount, label: "Full Access Plan", duration: 365, enabled: true, classSelection: 0, billingCycle: "yearly" },
      MONTHLY: { amount: config.plans.MONTHLY.amount, label: "Monthly Plan", duration: 30, enabled: true, classSelection: 0, billingCycle: "monthly" },
      YEARLY: { amount: config.plans.YEARLY.amount, label: "Yearly Plan", duration: 365, enabled: true, classSelection: 0, billingCycle: "yearly" },
      LIVE_CLASS: { amount: config.plans.LIVE_CLASS.amount, label: "Live Classes", duration: 30, enabled: true, classSelection: 1, billingCycle: "monthly" },
    };
  }

  const featureMap: Record<string, string[]> = {
    SINGLE_CLASS: ["3D Animated Videos", "Any 1 class of your choice", "All subjects in that class", "Video lectures in all languages", "Notes & PDFs", "Quiz", "Solved Board Question Papers"],
    MULTI_CLASS: ["3D Animated Videos", "Any 2 classes of your choice", "All subjects in selected classes", "Video lectures in all languages", "Notes & PDFs", "Quiz", "Solved Board Question Papers"],
    FULL_ACCESS: ["3D Animated Videos", "All classes (9-12)", "All subjects", "Video lectures in all languages", "Notes & PDFs", "Best value", "Quiz", "Solved Board Question Papers"],
    MONTHLY: ["3D Animated Videos", "All classes (9-12)", "All subjects", "Video lectures in all languages", "Notes & PDFs", "Quiz", "Solved Board Question Papers"],
    YEARLY: ["3D Animated Videos", "All classes (9-12)", "All subjects", "Video lectures in all languages", "Notes & PDFs", "Save 33%", "Quiz", "Solved Board Question Papers"],
    LIVE_CLASS: ["3D Animated Videos", "1 class of your choice (9-12)", "Small group of 10-15 students", "Live doubt clearing with expert teachers", "Weekly interactive sessions", "Session recordings access", "Quiz", "Solved Board Question Papers"],
  };

  const plans = Object.entries(plansConfig)
    .filter(([_, v]: [string, any]) => v.enabled)
    .map(([key, v]: [string, any]) => ({
      id: key,
      name: v.label,
      price: v.amount / 100,
      duration: `${v.duration} days`,
      billingCycle: v.billingCycle || (v.duration <= 30 ? "monthly" : "yearly"),
      features: featureMap[key] || [],
      classSelection: v.classSelection || 0,
      popular: key === "MULTI_CLASS",
    }));

  // Get upgrade discount
  const upgradeDiscountPercent = await getUpgradeDiscount();

  const result = { plans, classes, upgradeDiscountPercent };
  cacheSet("plans", result, 600); // 10 min cache
  return success(res, result);
}

// Validate coupon endpoint
export async function validateCouponCode(req: Request, res: Response) {
  try {
    const { code, plan } = req.query;
    if (!code || typeof code !== "string") return error(res, "Coupon code is required", 400);
    const planKey = typeof plan === "string" ? plan : undefined;
    const result = await validateCoupon(code, planKey);
    return success(res, result);
  } catch (e) {
    console.error("Validate coupon error:", e);
    return error(res, "Failed to validate coupon");
  }
}

export async function createSubscriptionOrder(req: Request, res: Response) {
  try {
    const { plan, classesAccess, couponCode } = req.body;
    const planConfig = await getPlanConfig(plan);

    // Validate classesAccess based on plan's classSelection setting
    if (planConfig.classSelection > 0) {
      if (!classesAccess || classesAccess.length !== planConfig.classSelection) {
        return error(res, `This plan requires exactly ${planConfig.classSelection} class(es)`, 400);
      }
    }

    let amount = planConfig.amount;
    let couponDiscount = 0;
    let upgradeDiscount = 0;

    // Check for existing active subscription (upgrade flow)
    const existing = await prisma.subscription.findFirst({
      where: { userId: req.user!.id, status: "ACTIVE", expiryDate: { gt: new Date() } },
    });

    if (existing) {
      // Apply upgrade discount
      const upgradeDiscountPercent = await getUpgradeDiscount();
      if (upgradeDiscountPercent > 0) {
        upgradeDiscount = Math.round(amount * upgradeDiscountPercent / 100);
        amount -= upgradeDiscount;
      }
    }

    // Apply coupon if provided
    if (couponCode) {
      const couponResult = await validateCoupon(couponCode, plan);
      if (!couponResult.valid) return error(res, couponResult.message, 400);
      couponDiscount = Math.round(amount * couponResult.discountPercent / 100);
      amount -= couponDiscount;
    }

    // Ensure minimum amount (Razorpay requires at least 100 paise = Rs 1)
    if (amount < 100) amount = 100;

    const receipt = `vl_${req.user!.id.slice(-8)}_${Date.now()}`;
    const order = await createOrder(amount, "INR", receipt);

    return success(res, {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan,
      classesAccess,
      couponCode,
      originalAmount: planConfig.amount,
      upgradeDiscount,
      couponDiscount,
      isUpgrade: !!existing,
    });
  } catch (e: any) {
    console.error("Create order error:", e);
    const detail = e?.error?.description || e?.message || "Unknown error";
    return error(res, `Failed to create payment order: ${detail}`);
  }
}

export async function verifyPayment(req: Request, res: Response) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, classesAccess, couponCode } = req.body;

    const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) return error(res, "Payment verification failed", 400);

    const planConfig = await getPlanConfig(plan);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + planConfig.duration);

    // Calculate actual amount paid
    let amount = planConfig.amount;
    let discountAmount = 0;

    const existing = await prisma.subscription.findFirst({
      where: { userId: req.user!.id, status: "ACTIVE", expiryDate: { gt: new Date() } },
    });

    if (existing) {
      const upgradeDiscountPercent = await getUpgradeDiscount();
      if (upgradeDiscountPercent > 0) {
        discountAmount += Math.round(amount * upgradeDiscountPercent / 100);
        amount -= Math.round(planConfig.amount * upgradeDiscountPercent / 100);
      }
    }

    if (couponCode) {
      const couponResult = await validateCoupon(couponCode, plan);
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

    // If plan has classSelection > 0, use provided classesAccess; otherwise grant all
    let resolvedClassesAccess: string[] = [];
    if (planConfig.classSelection > 0) {
      resolvedClassesAccess = classesAccess || [];
    } else {
      const allClasses = await prisma.class.findMany({ select: { id: true } });
      resolvedClassesAccess = allClasses.map((c) => c.id);
    }

    // Expire any existing active subscriptions
    await prisma.subscription.updateMany({
      where: { userId: req.user!.id, status: "ACTIVE" },
      data: { status: "EXPIRED" },
    });

    const subscription = await prisma.subscription.create({
      data: {
        userId: req.user!.id,
        plan,
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

    return success(res, subscription, "Payment verified and subscription activated");
  } catch (e) {
    console.error("Verify payment error:", e);
    return error(res, "Payment verification failed");
  }
}

export async function getMySubscription(req: Request, res: Response) {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
    });

    // Auto-expire if past expiry date
    if (subscription && subscription.status === "ACTIVE" && subscription.expiryDate < new Date()) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: "EXPIRED" },
      });
      subscription.status = "EXPIRED";
    }

    return success(res, subscription);
  } catch (e) {
    console.error("Get subscription error:", e);
    return error(res, "Failed to fetch subscription");
  }
}
