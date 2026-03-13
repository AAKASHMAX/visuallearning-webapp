import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { config } from "../config";
import { createOrder, verifySignature } from "../services/razorpay";
import { success, error } from "../utils/apiResponse";

export const createOrderSchema = z.object({
  plan: z.string().min(1),
  classesAccess: z.array(z.string()).optional(),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  plan: z.string().min(1),
  classesAccess: z.array(z.string()).optional(),
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

export async function getPlans(_req: Request, res: Response) {
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
    SINGLE_CLASS: ["Any 1 class of your choice", "All subjects in that class", "Video lectures in all languages", "Notes & PDFs", "Practice questions"],
    MULTI_CLASS: ["Any 2 classes of your choice", "All subjects in selected classes", "Video lectures in all languages", "Notes & PDFs", "Practice questions"],
    FULL_ACCESS: ["All classes (9-12)", "All subjects", "Video lectures in all languages", "Notes & PDFs", "Practice questions", "Best value"],
    MONTHLY: ["All classes (9-12)", "All subjects", "Video lectures in all languages", "Notes & PDFs", "Practice questions"],
    YEARLY: ["All classes (9-12)", "All subjects", "Video lectures in all languages", "Notes & PDFs", "Practice questions", "Save 33%"],
    LIVE_CLASS: ["1 class of your choice (9-12)", "Small group of 10-15 students", "Live doubt clearing with expert teachers", "Weekly interactive sessions", "Session recordings access", "All video content included"],
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

  return success(res, { plans, classes });
}

export async function createSubscriptionOrder(req: Request, res: Response) {
  try {
    const { plan, classesAccess } = req.body;
    const planConfig = await getPlanConfig(plan);

    // Validate classesAccess based on plan's classSelection setting
    if (planConfig.classSelection > 0) {
      if (!classesAccess || classesAccess.length !== planConfig.classSelection) {
        return error(res, `This plan requires exactly ${planConfig.classSelection} class(es)`, 400);
      }
    }

    // Check existing active subscription
    const existing = await prisma.subscription.findFirst({
      where: { userId: req.user!.id, status: "ACTIVE", expiryDate: { gt: new Date() } },
    });
    if (existing) return error(res, "You already have an active subscription", 400);

    const receipt = `vl_${req.user!.id}_${Date.now()}`;
    const order = await createOrder(planConfig.amount, "INR", receipt);

    return success(res, {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan,
      classesAccess,
    });
  } catch (e) {
    console.error("Create order error:", e);
    return error(res, "Failed to create payment order");
  }
}

export async function verifyPayment(req: Request, res: Response) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, classesAccess } = req.body;

    const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) return error(res, "Payment verification failed", 400);

    const planConfig = await getPlanConfig(plan);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + planConfig.duration);

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
        amount: planConfig.amount,
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
