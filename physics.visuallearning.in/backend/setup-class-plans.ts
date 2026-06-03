/**
 * Create Class 11 & 12 subscription plans (monthly + yearly), link them to the
 * Class 11/12 courses, and deactivate the old Basic/Advance/Bridge plans.
 *
 * Run: DATABASE_URL="<physics-prod>" npx tsx setup-class-plans.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FEATURES = ["3D Animated Videos", "Visual Notes", "NCERT Solutions", "PYQ Solutions", "Interactive Quiz"];
const NEW_PLANS = [
  { code: "CLASS_11_MONTHLY", name: "Class 11 Physics", price: 499, durationDays: 30, displayOrder: 1, tier: "11" },
  { code: "CLASS_11_YEARLY", name: "Class 11 Physics", price: 1999, durationDays: 365, displayOrder: 2, tier: "11" },
  { code: "CLASS_12_MONTHLY", name: "Class 12 Physics", price: 699, durationDays: 30, displayOrder: 3, tier: "12" },
  { code: "CLASS_12_YEARLY", name: "Class 12 Physics", price: 2999, durationDays: 365, displayOrder: 4, tier: "12" },
];
const OLD_CODES = ["BRIDGE_YEARLY", "BASIC_YEARLY", "ADVANCE_YEARLY", "BRIDGE", "BASIC", "ADVANCE"];

(async () => {
  console.log("DB host:", (process.env.DATABASE_URL || "").replace(/.*@/, "").replace(/\/.*/, ""));

  const courses = await prisma.course.findMany({
    where: { tier: { in: ["11", "12"] }, isActive: true },
    select: { id: true, tier: true, name: true },
  });
  const courseByTier = new Map(courses.map((c) => [c.tier, c.id]));
  console.log("Courses:", courses.map((c) => `${c.tier}:${c.name}`).join(", "));

  for (const p of NEW_PLANS) {
    const description = `Full ${p.name} — videos, notes, NCERT & PYQ solutions, and quizzes.`;
    const plan = await prisma.subscriptionPlan.upsert({
      where: { code: p.code },
      update: { name: p.name, description, price: p.price, durationDays: p.durationDays, displayOrder: p.displayOrder, features: FEATURES, isActive: true },
      create: { code: p.code, name: p.name, description, price: p.price, durationDays: p.durationDays, displayOrder: p.displayOrder, features: FEATURES, isActive: true },
    });
    const courseId = courseByTier.get(p.tier);
    if (courseId) {
      await prisma.planCourse.upsert({
        where: { planId_courseId: { planId: plan.id, courseId } },
        update: {},
        create: { planId: plan.id, courseId },
      });
    }
    console.log(`  ${p.code}: Rs${p.price} / ${p.durationDays}d -> course ${courseId || "(none)"}`);
  }

  const deact = await prisma.subscriptionPlan.updateMany({ where: { code: { in: OLD_CODES } }, data: { isActive: false } });
  console.log(`Deactivated ${deact.count} old plan(s).`);

  await prisma.$disconnect();
  console.log("Done!");
})().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
