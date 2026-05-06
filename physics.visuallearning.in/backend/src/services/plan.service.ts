import { PrismaClient } from "@prisma/client";

export const defaultPlanSeeds = [
  {
    code: "BRIDGE",
    name: "Physics Bridge Course",
    description: "Strengthen core physics concepts before advanced chapters.",
    price: 999,
    durationDays: 30,
    displayOrder: 1,
    tier: "BRIDGE",
    features: ["Core concepts", "Foundational modules", "Concept strengthening", "Bridge tests"],
  },
  {
    code: "BRIDGE_YEARLY",
    name: "Physics Bridge Course",
    description: "Strengthen core physics concepts before advanced chapters.",
    price: 9990,
    durationDays: 365,
    displayOrder: 1,
    tier: "BRIDGE",
    features: ["Core concepts", "Foundational modules", "Concept strengthening", "Bridge tests"],
  },
  {
    code: "BASIC",
    name: "Basic Course",
    description: "Complete animated lessons, notes, and quizzes for foundation physics.",
    price: 299,
    durationDays: 30,
    displayOrder: 2,
    tier: "BASIC",
    features: ["All animated videos", "Chapter notes", "MCQ quizzes", "Progress tracking"],
  },
  {
    code: "BASIC_YEARLY",
    name: "Basic Course",
    description: "Complete animated lessons, notes, and quizzes for foundation physics.",
    price: 2990,
    durationDays: 365,
    displayOrder: 2,
    tier: "BASIC",
    features: ["All animated videos", "Chapter notes", "MCQ quizzes", "Progress tracking"],
  },
  {
    code: "ADVANCE",
    name: "Advance Course",
    description: "Advanced physics learning with expert lectures and virtual labs.",
    price: 499,
    durationDays: 30,
    displayOrder: 3,
    tier: "ADVANCE",
    features: ["Everything in Basic", "Expert lectures", "Virtual labs", "Board practice"],
  },
  {
    code: "ADVANCE_YEARLY",
    name: "Advance Course",
    description: "Advanced physics learning with expert lectures and virtual labs.",
    price: 4990,
    durationDays: 365,
    displayOrder: 3,
    tier: "ADVANCE",
    features: ["Everything in Basic", "Expert lectures", "Virtual labs", "Board practice"],
  },
];

export function isFreeOfferActive(plan: { freeOfferEnabled?: boolean; freeOfferUntil?: Date | string | null }) {
  if (!plan.freeOfferEnabled) return false;
  if (!plan.freeOfferUntil) return true;
  return new Date(plan.freeOfferUntil).getTime() > Date.now();
}

export function getEffectivePlanPrice(plan: { price: number; freeOfferEnabled?: boolean; freeOfferUntil?: Date | string | null }) {
  return isFreeOfferActive(plan) ? 0 : plan.price;
}

function courseChapterCount(course: any) {
  if (course.chapters || course.courseChapters) {
    return new Set([
      ...((course.chapters || []).map((chapter: any) => chapter.id)),
      ...((course.courseChapters || []).map((link: any) => link.chapterId)),
    ]).size;
  }
  return course._count?.courseChapters || course._count?.chapters || 0;
}

let defaultPlansEnsuredAt = 0;
const DEFAULT_PLANS_TTL_MS = 10 * 60 * 1000;

export async function ensureDefaultPlans(prisma: PrismaClient) {
  if (Date.now() - defaultPlansEnsuredAt < DEFAULT_PLANS_TTL_MS) return;

  const seedCodes = defaultPlanSeeds.map((seed) => seed.code);
  const seedTiers = Array.from(new Set(defaultPlanSeeds.map((seed) => seed.tier)));
  const [existingPlans, activeCourses] = await Promise.all([
    prisma.subscriptionPlan.findMany({
      where: { code: { in: seedCodes } },
      include: { _count: { select: { courses: true } } },
    }),
    prisma.course.findMany({
      where: { tier: { in: seedTiers }, isActive: true },
      select: { id: true, tier: true },
    }),
  ]);

  const existingByCode = new Map(existingPlans.map((plan) => [plan.code, plan]));
  const coursesByTier = new Map<string, { id: string }[]>();
  for (const course of activeCourses) {
    coursesByTier.set(course.tier, [...(coursesByTier.get(course.tier) || []), course]);
  }

  for (const seed of defaultPlanSeeds) {
    let plan = existingByCode.get(seed.code);
    if (!plan) {
      plan = await prisma.subscriptionPlan.create({
        data: {
          code: seed.code,
          name: seed.name,
          description: seed.description,
          price: seed.price,
          durationDays: seed.durationDays,
          displayOrder: seed.displayOrder,
          features: seed.features,
        },
        include: { _count: { select: { courses: true } } },
      });
    }

    const courses = coursesByTier.get(seed.tier) || [];
    if (courses.length > (plan._count?.courses || 0)) {
      await prisma.planCourse.createMany({
        data: courses.map((course) => ({ planId: plan!.id, courseId: course.id })),
        skipDuplicates: true,
      });
    }
  }

  defaultPlansEnsuredAt = Date.now();
}

export function clearDefaultPlansEnsureCache() {
  defaultPlansEnsuredAt = 0;
}

export async function getPlanByCode(prisma: PrismaClient, code: string) {
  await ensureDefaultPlans(prisma);
  return prisma.subscriptionPlan.findUnique({
    where: { code },
    include: { courses: { include: { course: true } } },
  });
}

export async function getActiveUserSubscriptions(prisma: PrismaClient, userId: string) {
  return prisma.subscription.findMany({
    where: { userId, status: "ACTIVE", expiryDate: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
}

export async function userHasCourseAccess(prisma: PrismaClient, userId: string | undefined, course: { id: string; tier: string }) {
  if (!userId) return false;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (user?.role === "ADMIN") return true;

  await ensureDefaultPlans(prisma);
  const subscriptions = await getActiveUserSubscriptions(prisma, userId);
  if (subscriptions.length === 0) return false;

  const planCodes = subscriptions.map((sub) => sub.plan);
  const plans = await prisma.subscriptionPlan.findMany({
    where: { code: { in: planCodes }, isActive: true },
    include: { courses: { select: { courseId: true } } },
  });

  if (plans.some((plan) => plan.courses.some((item) => item.courseId === course.id))) {
    return true;
  }

  // Legacy fallback only for old plans that were created before plan-course mapping existed.
  const unmappedPlanCodes = plans
    .filter((plan) => plan.courses.length === 0)
    .map((plan) => plan.code);
  if (unmappedPlanCodes.includes("BRIDGE")) return true;
  if ((unmappedPlanCodes.includes("ADVANCE") || unmappedPlanCodes.includes("ADVANCE_YEARLY")) && course.tier !== "BRIDGE") return true;
  if ((unmappedPlanCodes.includes("BASIC") || unmappedPlanCodes.includes("BASIC_YEARLY")) && course.tier === "BASIC") return true;

  return false;
}

export async function getAccessibleCoursesForUser(prisma: PrismaClient, userId: string) {
  await ensureDefaultPlans(prisma);
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (user?.role === "ADMIN") {
    const courses = await prisma.course.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      include: {
        _count: { select: { chapters: true, courseChapters: true } },
        chapters: { select: { id: true } },
        courseChapters: { select: { chapterId: true } },
      },
    });
    return courses.map(({ chapters, courseChapters, ...course }: any) => ({
      ...course,
      _count: { ...course._count, chapters: courseChapterCount({ chapters, courseChapters }) },
    }));
  }

  const subscriptions = await getActiveUserSubscriptions(prisma, userId);
  const planCodes = subscriptions.map((sub) => sub.plan);
  const plans = await prisma.subscriptionPlan.findMany({
    where: { code: { in: planCodes }, isActive: true },
    include: { courses: { select: { courseId: true } } },
  });

  const assignedCourseIds = plans.flatMap((plan) => plan.courses.map((item) => item.courseId));

  const courses = await prisma.course.findMany({
    where: {
      isActive: true,
      tier: { not: "FREE" },
      id: { in: assignedCourseIds },
    },
    orderBy: { displayOrder: "asc" },
    include: {
      _count: { select: { chapters: true, courseChapters: true } },
      chapters: { select: { id: true } },
      courseChapters: { select: { chapterId: true } },
    },
  });
  return courses.map(({ chapters, courseChapters, ...course }: any) => ({
    ...course,
    _count: { ...course._count, chapters: courseChapterCount({ chapters, courseChapters }) },
  }));
}
