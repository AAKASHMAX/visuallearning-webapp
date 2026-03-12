import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { config } from "../config";
import { createOrder, verifySignature } from "../services/razorpay";
import { success, error } from "../utils/apiResponse";

const allPlanTypes = ["MONTHLY", "YEARLY", "SINGLE_CLASS", "MULTI_CLASS", "FULL_ACCESS"] as const;

export const createOrderSchema = z.object({
  plan: z.enum(allPlanTypes),
  classesAccess: z.array(z.string()).optional(),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  plan: z.enum(allPlanTypes),
  classesAccess: z.array(z.string()).optional(),
});

export async function getPlans(_req: Request, res: Response) {
  // Fetch classes for dynamic plan display
  const classes = await prisma.class.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } });

  const plans = [
    {
      id: "SINGLE_CLASS",
      name: "Single Class Plan",
      price: config.plans.SINGLE_CLASS.amount / 100,
      duration: "365 days",
      features: ["Any 1 class of your choice", "All subjects in that class", "Video lectures in all languages", "Notes & PDFs", "Practice questions"],
      classSelection: 1,
    },
    {
      id: "MULTI_CLASS",
      name: "Multi Class Pack",
      price: config.plans.MULTI_CLASS.amount / 100,
      duration: "365 days",
      features: ["Any 2 classes of your choice", "All subjects in selected classes", "Video lectures in all languages", "Notes & PDFs", "Practice questions"],
      popular: true,
      classSelection: 2,
    },
    {
      id: "FULL_ACCESS",
      name: "Full Access Plan",
      price: config.plans.FULL_ACCESS.amount / 100,
      duration: "365 days",
      features: ["All classes (9-12)", "All subjects", "Video lectures in all languages", "Notes & PDFs", "Practice questions", "Best value"],
      classSelection: 0,
    },
    {
      id: "MONTHLY",
      name: "Monthly Plan",
      price: config.plans.MONTHLY.amount / 100,
      duration: "30 days",
      features: ["All classes (9-12)", "All subjects", "Video lectures in all languages", "Notes & PDFs", "Practice questions"],
      classSelection: 0,
    },
    {
      id: "YEARLY",
      name: "Yearly Plan",
      price: config.plans.YEARLY.amount / 100,
      duration: "365 days",
      features: ["All classes (9-12)", "All subjects", "Video lectures in all languages", "Notes & PDFs", "Practice questions", "Save 33%"],
      classSelection: 0,
    },
  ];
  return success(res, { plans, classes });
}

export async function createSubscriptionOrder(req: Request, res: Response) {
  try {
    const { plan, classesAccess } = req.body;
    const planConfig = config.plans[plan as keyof typeof config.plans];

    // Validate classesAccess for class-based plans
    if (plan === "SINGLE_CLASS" && (!classesAccess || classesAccess.length !== 1)) {
      return error(res, "Single Class plan requires exactly 1 class", 400);
    }
    if (plan === "MULTI_CLASS" && (!classesAccess || classesAccess.length !== 2)) {
      return error(res, "Multi Class plan requires exactly 2 classes", 400);
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

    const planConfig = config.plans[plan as keyof typeof config.plans];
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + planConfig.duration);

    // For FULL_ACCESS, MONTHLY, YEARLY — grant all classes
    let resolvedClassesAccess: string[] = [];
    if (plan === "SINGLE_CLASS" || plan === "MULTI_CLASS") {
      resolvedClassesAccess = classesAccess || [];
    } else {
      // Full access plans: store all class IDs
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
        plan: plan as any,
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
