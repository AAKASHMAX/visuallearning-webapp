import Razorpay from "razorpay";
import { config } from "../config";
import { YEARLY_PLAN_DURATION_DAYS } from "./plan.service";

export function getRazorpayClient() {
  if (!config.razorpay.keyId || !config.razorpay.keySecret) {
    return null;
  }
  return new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
  });
}

export function getRazorpayPeriod(plan: { code: string; durationDays: number }) {
  if (plan.code.endsWith("_MONTHLY")) return "monthly" as const;
  if (plan.code.endsWith("_YEARLY")) return "yearly" as const;
  return plan.durationDays >= YEARLY_PLAN_DURATION_DAYS ? ("yearly" as const) : ("monthly" as const);
}

// Razorpay plan amounts are immutable, so a price change requires creating a
// fresh plan. Returns the new plan id (plan_xxx) or null if Razorpay isn't set up.
export async function createRecurringPlan(plan: { code: string; name: string; price: number; durationDays: number }) {
  const razorpay = getRazorpayClient();
  if (!razorpay) return null;

  const created = await razorpay.plans.create({
    period: getRazorpayPeriod(plan),
    interval: 1,
    item: {
      name: `${plan.name} (${getRazorpayPeriod(plan) === "yearly" ? "Yearly" : "Monthly"})`,
      amount: Math.round(plan.price * 100), // paise
      currency: "INR",
    },
    notes: { planCode: plan.code },
  });

  return created.id;
}
