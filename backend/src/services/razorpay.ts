import Razorpay from "razorpay";
import crypto from "crypto";
import { config } from "../config";

let razorpay: Razorpay | null = null;

function getRazorpay(): Razorpay {
  if (!razorpay) {
    if (!config.razorpay.keyId || !config.razorpay.keySecret) {
      throw new Error("Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
    }
    razorpay = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
  }
  return razorpay;
}

export async function createOrder(amount: number, currency = "INR", receipt: string) {
  return getRazorpay().orders.create({
    amount,
    currency,
    receipt,
  });
}

export function verifySignature(orderId: string, paymentId: string, signature: string): boolean {
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", config.razorpay.keySecret)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
}
