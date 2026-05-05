import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import Razorpay from "razorpay";
import crypto from "crypto";
import { config, PLANS } from "../config";
import { AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();

function getRazorpayClient() {
  if (!config.razorpay.keyId || !config.razorpay.keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
  });
}

export async function getPlans(req: AuthRequest, res: Response) {
  try {
    // Try to get plans from database settings first
    const setting = await prisma.setting.findUnique({ where: { key: "plans_config" } });
    if (setting) {
      return res.json(JSON.parse(setting.value));
    }
    res.json(PLANS);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch plans" });
  }
}

export async function validateCoupon(req: AuthRequest, res: Response) {
  try {
    const { code, plan } = req.query;
    if (!code) return res.status(400).json({ message: "Coupon code required" });

    const coupon = await prisma.coupon.findUnique({ where: { code: code as string } });

    if (!coupon || !coupon.isActive) {
      return res.status(400).json({ message: "Invalid coupon code" });
    }
    if (coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }
    if (new Date() < coupon.validFrom || new Date() > coupon.validUntil) {
      return res.status(400).json({ message: "Coupon has expired" });
    }
    if (coupon.applicablePlans.length > 0 && plan && !coupon.applicablePlans.includes(plan as string)) {
      return res.status(400).json({ message: "Coupon not applicable for this plan" });
    }

    res.json({ discountPercent: coupon.discountPercent, code: coupon.code });
  } catch (error) {
    res.status(500).json({ message: "Failed to validate coupon" });
  }
}

export async function getMySubscription(req: AuthRequest, res: Response) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user!.id },
    });

    if (!subscription) {
      return res.json({ plan: "FREE", status: "ACTIVE" });
    }

    // Check expiry
    if (subscription.expiryDate < new Date() && subscription.status === "ACTIVE") {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: "EXPIRED" },
      });
      return res.json({ ...subscription, status: "EXPIRED" });
    }

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subscription" });
  }
}

export async function createOrder(req: AuthRequest, res: Response) {
  try {
    const { plan, couponCode } = req.body;
    const razorpay = getRazorpayClient();

    if (!razorpay) {
      return res.status(503).json({ message: "Payment gateway is not configured" });
    }

    if (!plan || !PLANS[plan]) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    let amount = PLANS[plan].price;

    // Apply coupon
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && coupon.isActive && coupon.usedCount < coupon.maxUses) {
        amount = Math.round(amount * (1 - coupon.discountPercent / 100));
      }
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: `phy_${req.user!.id}_${Date.now()}`,
    });

    res.json({
      orderId: order.id,
      amount: amount,
      currency: "INR",
      plan,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Failed to create order" });
  }
}

export async function verifyPayment(req: AuthRequest, res: Response) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, plan, couponCode } = req.body;

    if (!config.razorpay.keySecret) {
      return res.status(503).json({ message: "Payment gateway is not configured" });
    }

    // Verify signature
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", config.razorpay.keySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const planConfig = PLANS[plan];
    if (!planConfig) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    let discountAmount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon) {
        discountAmount = Math.round(planConfig.price * coupon.discountPercent / 100);
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + planConfig.duration);

    // Create or update subscription
    const subscription = await prisma.subscription.upsert({
      where: { userId: req.user!.id },
      update: {
        plan,
        status: "ACTIVE",
        startDate: new Date(),
        expiryDate,
        razorpayOrderId,
        razorpayPaymentId,
        couponCode,
        discountAmount,
        amount: planConfig.price - discountAmount,
      },
      create: {
        userId: req.user!.id,
        plan,
        status: "ACTIVE",
        expiryDate,
        razorpayOrderId,
        razorpayPaymentId,
        couponCode,
        discountAmount,
        amount: planConfig.price - discountAmount,
      },
    });

    res.json({ message: "Payment verified, subscription activated", subscription });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ message: "Failed to verify payment" });
  }
}
