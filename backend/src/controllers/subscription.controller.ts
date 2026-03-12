import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { config } from "../config";
import { createOrder, verifySignature } from "../services/razorpay";
import { success, error } from "../utils/apiResponse";

export const createOrderSchema = z.object({
  plan: z.enum(["MONTHLY", "YEARLY"]),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  plan: z.enum(["MONTHLY", "YEARLY"]),
});

export function getPlans(_req: Request, res: Response) {
  const plans = [
    {
      id: "MONTHLY",
      name: "Monthly Plan",
      price: config.plans.MONTHLY.amount / 100,
      duration: "30 days",
      features: ["All classes (9-12)", "All subjects", "Video lectures", "Notes & PDFs", "Practice questions"],
    },
    {
      id: "YEARLY",
      name: "Yearly Plan",
      price: config.plans.YEARLY.amount / 100,
      duration: "365 days",
      features: ["All classes (9-12)", "All subjects", "Video lectures", "Notes & PDFs", "Practice questions", "Save 33%"],
      popular: true,
    },
  ];
  return success(res, plans);
}

export async function createSubscriptionOrder(req: Request, res: Response) {
  try {
    const { plan } = req.body;
    const planConfig = config.plans[plan as keyof typeof config.plans];

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
    });
  } catch (e) {
    console.error("Create order error:", e);
    return error(res, "Failed to create payment order");
  }
}

export async function verifyPayment(req: Request, res: Response) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) return error(res, "Payment verification failed", 400);

    const planConfig = config.plans[plan as keyof typeof config.plans];
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + planConfig.duration);

    // Expire any existing active subscriptions
    await prisma.subscription.updateMany({
      where: { userId: req.user!.id, status: "ACTIVE" },
      data: { status: "EXPIRED" },
    });

    const subscription = await prisma.subscription.create({
      data: {
        userId: req.user!.id,
        plan: plan as any,
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
