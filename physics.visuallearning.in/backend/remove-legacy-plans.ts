/**
 * Remove the legacy Bridge/Basic/Advance subscription plans from the admin panel.
 * Safe: SubscriptionPlan has no hard FK from Subscription (plan is a string), and
 * PlanCourse links cascade on delete.
 *
 * Run: npx tsx remove-legacy-plans.ts
 */
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const prisma = new PrismaClient();

const OLD_CODES = ["BRIDGE_YEARLY", "BASIC_YEARLY", "ADVANCE_YEARLY", "BRIDGE", "BASIC", "ADVANCE"];

(async () => {
  const plans = await prisma.subscriptionPlan.findMany({ where: { code: { in: OLD_CODES } } });
  if (plans.length === 0) {
    console.log("No legacy plans found — nothing to remove.");
    await prisma.$disconnect();
    return;
  }
  console.log("Legacy plans found:", plans.map((p) => p.code).join(", "));

  // Safety: warn if any ACTIVE subscriber is still on these plans.
  const activeSubs = await prisma.subscription.count({
    where: { plan: { in: OLD_CODES }, status: "ACTIVE", expiryDate: { gt: new Date() } },
  });
  if (activeSubs > 0) {
    console.log(`\n⚠️  ${activeSubs} ACTIVE subscriber(s) still on these plans. Their access is unaffected`);
    console.log("    (Subscription.plan is a stored string), but review before deleting if unsure.");
  }

  const del = await prisma.subscriptionPlan.deleteMany({ where: { code: { in: OLD_CODES } } });
  console.log(`\nDeleted ${del.count} legacy plan(s). They will no longer appear in the admin panel.`);

  await prisma.$disconnect();
})().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
