import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { config } from "../../config";
import { createOrder, verifySignature } from "../../services/razorpay";
import { mobileSuccess, mobileError } from "../utils/response";

// GET /api/subscription-plan — list plans in mobile format
export async function getSubscriptionPlans(_req: Request, res: Response) {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: "plans_config" } });
    let plansConfig: Record<string, any> = {};

    if (setting) {
      plansConfig = JSON.parse(setting.value);
    } else {
      plansConfig = {
        SINGLE_CLASS: { amount: config.plans.SINGLE_CLASS.amount, label: "Single Class Plan", duration: 365, enabled: true },
        MULTI_CLASS: { amount: config.plans.MULTI_CLASS.amount, label: "Multi Class Pack", duration: 365, enabled: true },
        FULL_ACCESS: { amount: config.plans.FULL_ACCESS.amount, label: "Full Access Plan", duration: 365, enabled: true },
        MONTHLY: { amount: config.plans.MONTHLY.amount, label: "Monthly Plan", duration: 30, enabled: true },
        YEARLY: { amount: config.plans.YEARLY.amount, label: "Yearly Plan", duration: 365, enabled: true },
      };
    }

    let counter = 1;
    const data = Object.entries(plansConfig)
      .filter(([_, v]: [string, any]) => v.enabled)
      .map(([key, v]: [string, any]) => ({
        plan_id_PK: key,
        plan_name: v.label,
        price: String(v.amount / 100),
        offer_price: null,
        validity_unit: v.duration <= 30 ? 1 : 2, // 1=months, 2=years
        validity_count: v.duration <= 30 ? 1 : Math.round(v.duration / 365),
        is_active: 1,
        created_at: "",
        plan_key: key, // extra field for order creation
      }));

    return mobileSuccess(res, data);
  } catch (e) {
    console.error("Mobile getSubscriptionPlans error:", e);
    return mobileError(res, "Failed to fetch plans");
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

    const { plan_id, plan_key, plan } = req.body;
    const planKey = plan_key || plan_id || plan;
    if (!planKey) return mobileError(res, "Plan is required", 400);

    // Get plan config
    const setting = await prisma.setting.findUnique({ where: { key: "plans_config" } });
    let amount: number;
    if (setting) {
      const plans = JSON.parse(setting.value);
      if (!plans[planKey]) return mobileError(res, "Invalid plan", 400);
      amount = plans[planKey].amount;
    } else {
      const fallback = config.plans[planKey as keyof typeof config.plans];
      if (!fallback) return mobileError(res, "Invalid plan", 400);
      amount = fallback.amount;
    }

    const receipt = `vl_${req.user.id.slice(-8)}_${Date.now()}`;
    const order = await createOrder(amount, "INR", receipt);

    return mobileSuccess(res, {
      id: order.id,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      plan_key: planKey,
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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan_key, plan } = req.body;
    const planKey = plan_key || plan;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return mobileError(res, "Payment details required", 400);
    }

    const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) return mobileError(res, "Payment verification failed", 400);

    // Get plan config
    const setting = await prisma.setting.findUnique({ where: { key: "plans_config" } });
    let planAmount: number;
    let planDuration: number;
    if (setting) {
      const plans = JSON.parse(setting.value);
      planAmount = plans[planKey]?.amount || 0;
      planDuration = plans[planKey]?.duration || 365;
    } else {
      const fallback = config.plans[planKey as keyof typeof config.plans];
      planAmount = fallback?.amount || 0;
      planDuration = fallback?.duration || 365;
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + planDuration);

    // Grant all classes access
    const allClasses = await prisma.class.findMany({ select: { id: true } });
    const classesAccess = allClasses.map((c) => c.id);

    // Expire existing subscriptions
    await prisma.subscription.updateMany({
      where: { userId: req.user.id, status: "ACTIVE" },
      data: { status: "EXPIRED" },
    });

    const subscription = await prisma.subscription.create({
      data: {
        userId: req.user.id,
        plan: planKey,
        classesAccess,
        expiryDate,
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpaySignature: razorpay_signature,
        status: "ACTIVE",
        amount: planAmount,
      },
    });

    return mobileSuccess(res, {
      subscription_id: subscription.id,
      status: 1,
      expiry_date: subscription.expiryDate.toISOString(),
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
