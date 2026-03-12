import Razorpay from "razorpay";
import crypto from "crypto";
import { config } from "../config";

const razorpay = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

export async function createOrder(amount: number, currency = "INR", receipt: string) {
  return razorpay.orders.create({
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
