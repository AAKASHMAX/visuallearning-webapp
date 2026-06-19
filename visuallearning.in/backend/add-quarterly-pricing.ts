/**
 * Add quarterly pricing to the three audience plans in the plans_config Setting.
 * Single ₹2199, Dual ₹2799, Full ₹3999 (90 days). Idempotent.
 *
 * Run: DATABASE_URL="<main-prod>" npx tsx add-quarterly-pricing.ts   (DRY=1 to preview)
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const DRY = process.env.DRY === "1";

const QUARTERLY: Record<string, number> = {
  SINGLE_CLASS: 219900, // ₹2199
  DUAL_CLASS: 279900,   // ₹2799
  FULL_ACCESS: 399900,  // ₹3999
};

(async () => {
  const host = (process.env.DATABASE_URL || "").replace(/.*@/, "").replace(/\/.*/, "");
  console.log(`Target: ${host}${DRY ? "  (DRY)" : ""}`);

  const setting = await prisma.setting.findUnique({ where: { key: "plans_config" } });
  if (!setting) { console.log("No plans_config setting found — nothing to patch."); await prisma.$disconnect(); return; }

  const plans = JSON.parse(setting.value);
  for (const [key, paise] of Object.entries(QUARTERLY)) {
    if (!plans[key]) { console.log(`  [skip] ${key} not in plans_config`); continue; }
    const before = { q: plans[key].quarterlyAmount, d: plans[key].durationQuarterly };
    plans[key].quarterlyAmount = paise;
    plans[key].durationQuarterly = 90;
    console.log(`  ${key}: monthly=₹${(plans[key].monthlyAmount||0)/100} | quarterly ₹${(before.q||0)/100} -> ₹${paise/100} (90d) | yearly=₹${(plans[key].yearlyAmount||0)/100}`);
  }

  if (!DRY) {
    await prisma.setting.update({ where: { key: "plans_config" }, data: { value: JSON.stringify(plans) } });
    console.log("Saved plans_config.");
  } else {
    console.log("(dry run — not saved)");
  }
  await prisma.$disconnect();
})();
