import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { verifyWebhookSignature } from "../services/razorpay";

export async function handleRazorpayWebhook(req: Request, res: Response) {
  try {
    const signature = req.headers["x-razorpay-signature"] as string;
    if (!signature) {
      return res.status(400).json({ error: "Missing signature" });
    }

    const body = JSON.stringify(req.body);
    const isValid = verifyWebhookSignature(body, signature);
    if (!isValid) {
      console.error("Webhook signature verification failed");
      return res.status(400).json({ error: "Invalid signature" });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log(`Razorpay webhook received: ${event}`);

    switch (event) {
      case "payment.captured": {
        const paymentId = payload.payment.entity.id;
        const orderId = payload.payment.entity.order_id;
        // Update subscription status if needed
        const subscription = await prisma.subscription.findFirst({
          where: { razorpayOrderId: orderId },
        });
        if (subscription && subscription.status !== "ACTIVE") {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: "ACTIVE", paymentId },
          });
          console.log(`Subscription ${subscription.id} activated via webhook`);
        }
        break;
      }

      case "payment.failed": {
        const orderId = payload.payment.entity.order_id;
        const subscription = await prisma.subscription.findFirst({
          where: { razorpayOrderId: orderId },
        });
        if (subscription) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: "EXPIRED" },
          });
          console.log(`Subscription ${subscription.id} marked failed via webhook`);
        }
        break;
      }

      case "refund.created": {
        const paymentId = payload.refund.entity.payment_id;
        const subscription = await prisma.subscription.findFirst({
          where: { paymentId },
        });
        if (subscription) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: "EXPIRED" },
          });
          console.log(`Subscription ${subscription.id} expired due to refund`);
        }
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    // Always respond 200 so Razorpay doesn't retry
    return res.status(200).json({ status: "ok" });
  } catch (e) {
    console.error("Webhook error:", e);
    return res.status(200).json({ status: "ok" });
  }
}
