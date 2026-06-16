/**
 * One-time setup: creates the Razorpay recurring Plans for each subscription
 * tier and stores their plan ids on the matching SubscriptionPlan rows.
 *
 * Run with:  npx tsx setup-razorpay-plans.ts
 *
 * Requirements (in backend/.env):
 *   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, DATABASE_URL
 * Recurring payments must be ENABLED on the Razorpay account first.
 *
 * Idempotent: a plan that already has razorpayPlanId is left untouched, so it
 * is safe to re-run (Razorpay plans cannot be deleted once created).
 */
import dotenv from "dotenv";
import Razorpay from "razorpay";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

// Edit prices here (in rupees). amount is auto-converted to paise.
const PLAN_SETUP = [
  { code: "CLASS_11_MONTHLY", name: "Class 11 Physics (Monthly)", price: 1499, period: "monthly" as const },
  { code: "CLASS_11_YEARLY",  name: "Class 11 Physics (Yearly)",  price: 5999, period: "yearly" as const },
  { code: "CLASS_12_MONTHLY", name: "Class 12 Physics (Monthly)", price: 1999, period: "monthly" as const },
  { code: "CLASS_12_YEARLY",  name: "Class 12 Physics (Yearly)",  price: 8999, period: "yearly" as const },
];

async function main() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing in .env");
  }

  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

  for (const setup of PLAN_SETUP) {
    const plan = await prisma.subscriptionPlan.findUnique({ where: { code: setup.code } });
    if (!plan) {
      console.warn(`! ${setup.code}: no SubscriptionPlan row found — skipping`);
      continue;
    }

    // Keep the DB price in sync with the Razorpay plan amount.
    if (plan.price !== setup.price) {
      await prisma.subscriptionPlan.update({
        where: { code: setup.code },
        data: { price: setup.price },
      });
      console.log(`  ${setup.code}: price updated ${plan.price} -> ${setup.price}`);
    }

    if (plan.razorpayPlanId) {
      console.log(`= ${setup.code}: already linked to ${plan.razorpayPlanId} — skipping`);
      continue;
    }

    const created = await razorpay.plans.create({
      period: setup.period,
      interval: 1,
      item: {
        name: setup.name,
        amount: setup.price * 100, // paise
        currency: "INR",
      },
      notes: { planCode: setup.code },
    });

    await prisma.subscriptionPlan.update({
      where: { code: setup.code },
      data: { razorpayPlanId: created.id },
    });

    console.log(`+ ${setup.code}: created Razorpay plan ${created.id} (₹${setup.price}/${setup.period})`);
  }

  console.log("\nDone. Razorpay recurring plans are ready.");
}

main()
  .catch((err) => {
    console.error("Setup failed:", err?.error?.description || err?.message || err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
