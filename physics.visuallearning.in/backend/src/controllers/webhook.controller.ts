import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { config } from "../config";
import { getPlanByCode } from "../services/plan.service";

const prisma = new PrismaClient();

// Extend an expiry date by one billing period. If the subscription is still
// active we add to the existing expiry (so renewals stack); otherwise we count
// from now.
function extendExpiry(current: Date | null | undefined, durationDays: number) {
  const base = current && current.getTime() > Date.now() ? new Date(current) : new Date();
  base.setDate(base.getDate() + durationDays);
  return base;
}

// Razorpay sends the raw JSON body and signs it with the webhook secret.
// This route MUST receive the raw (unparsed) body — see index.ts.
export async function handleRazorpayWebhook(req: Request, res: Response) {
  try {
    const webhookSecret = config.razorpay.webhookSecret;
    if (!webhookSecret) {
      console.error("Razorpay webhook secret not configured");
      return res.status(503).json({ message: "Webhook not configured" });
    }

    const signature = req.headers["x-razorpay-signature"] as string | undefined;
    // req.body is a Buffer because the route uses express.raw().
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (!signature || expectedSignature !== signature) {
      console.warn("Razorpay webhook signature mismatch");
      return res.status(400).json({ message: "Invalid signature" });
    }

    const event = JSON.parse(rawBody.toString("utf8"));
    const eventType: string = event.event;
    const subEntity = event.payload?.subscription?.entity;
    const razorpaySubscriptionId: string | undefined = subEntity?.id;

    // Acknowledge fast; Razorpay retries on non-2xx, so only fail on signature.
    if (!razorpaySubscriptionId) {
      return res.json({ received: true });
    }

    const local = await prisma.subscription.findUnique({
      where: { razorpaySubscriptionId },
    });

    // We may not have a local row yet if the webhook beats verify-payment; that
    // is fine — verify-payment will create it. Only act on rows we recognise.
    switch (eventType) {
      case "subscription.charged": {
        // Fired on every successful charge, including auto-renewals.
        if (!local) break;
        const planConfig = await getPlanByCode(prisma, local.plan);
        const durationDays = planConfig?.durationDays ?? (local.billingCycle === "YEARLY" ? 365 : 30);
        const paymentId = event.payload?.payment?.entity?.id || local.razorpayPaymentId;
        await prisma.subscription.update({
          where: { razorpaySubscriptionId },
          data: {
            status: "ACTIVE",
            expiryDate: extendExpiry(local.expiryDate, durationDays),
            razorpayPaymentId: paymentId,
          },
        });
        break;
      }

      case "subscription.activated":
      case "subscription.authenticated": {
        if (!local) break;
        await prisma.subscription.update({
          where: { razorpaySubscriptionId },
          data: { status: "ACTIVE", autoRenew: true },
        });
        break;
      }

      case "subscription.pending": {
        // A renewal charge failed; Razorpay is retrying. Keep access for now.
        break;
      }

      case "subscription.halted": {
        // Retries exhausted — auto-renewal stopped. Access lapses at expiry.
        if (!local) break;
        await prisma.subscription.update({
          where: { razorpaySubscriptionId },
          data: { status: "HALTED", autoRenew: false },
        });
        break;
      }

      case "subscription.cancelled":
      case "subscription.completed": {
        // No more auto-charges. Existing access stays until expiryDate, then the
        // getMySubscription expiry check flips it to EXPIRED.
        if (!local) break;
        await prisma.subscription.update({
          where: { razorpaySubscriptionId },
          data: { autoRenew: false, cancelledAt: local.cancelledAt ?? new Date() },
        });
        break;
      }

      default:
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    // Return 200 so Razorpay does not hammer retries on our parsing bugs; the
    // error is logged for investigation.
    res.json({ received: true });
  }
}
