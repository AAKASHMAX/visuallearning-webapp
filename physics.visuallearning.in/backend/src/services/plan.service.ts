import { PrismaClient } from "@prisma/client";

export const defaultPlanSeeds = [
  {
    code: "FREE",
    name: "Free Course",
    description: "Preview physics chapters with selected free videos, notes, and quizzes.",
    price: 0,
    durationDays: 3650,
    displayOrder: 0,
    tier: "FREE",
    features: ["First chapter previews", "Selected 3D animations", "Basic notes", "Introductory quizzes"],
  },
  {
    code: "BASIC",
    name: "Basic Course",
    description: "Complete animated lessons, notes, and quizzes for foundation physics.",
    price: 299,
    durationDays: 30,
    displayOrder: 1,
    tier: "BASIC",
    features: ["All animated videos", "Chapter notes", "MCQ quizzes", "Progress tracking"],
  },
  {
    code: "BASIC_YEARLY",
    name: "Basic Course",
    description: "Complete animated lessons, notes, and quizzes for foundation physics.",
    price: 2990,
    durationDays: 365,
    displayOrder: 1,
    tier: "BASIC",
    features: ["All animated videos", "Chapter notes", "MCQ quizzes", "Progress tracking"],
  },
  {
    code: "ADVANCE",
    name: "Advance Course",
    description: "Advanced physics learning with expert lectures and virtual labs.",
    price: 499,
    durationDays: 30,
    displayOrder: 2,
    tier: "ADVANCE",
    features: ["Everything in Basic", "Expert lectures", "Virtual labs", "Board practice"],
  },
  {
    code: "ADVANCE_YEARLY",
    name: "Advance Course",
    description: "Advanced physics learning with expert lectures and virtual labs.",
    price: 4990,
    durationDays: 365,
    displayOrder: 2,
    tier: "ADVANCE",
    features: ["Everything in Basic", "Expert lectures", "Virtual labs", "Board practice"],
  },
  {
    code: "BRIDGE",
    name: "Physics Bridge Course",
    description: "Strengthen core physics concepts before advanced chapters.",
    price: 999,
    durationDays: 30,
    displayOrder: 3,
    tier: "BRIDGE",
    features: ["Core concepts", "Foundational modules", "Concept strengthening", "Bridge tests"],
  },
  {
    code: "BRIDGE_YEARLY",
    name: "Physics Bridge Course",
    description: "Strengthen core physics concepts before advanced chapters.",
    price: 9990,
    durationDays: 365,
    displayOrder: 3,
    tier: "BRIDGE",
    features: ["Core concepts", "Foundational modules", "Concept strengthening", "Bridge tests"],
  },
];

function courseChapterCount(course: any) {
  if (course.chapters || course.courseChapters) {
    return new Set([
      ...((course.chapters || []).map((chapter: any) => chapter.id)),
      ...((course.courseChapters || []).map((link: any) => link.chapterId)),
    ]).size;
  }
  return course._count?.courseChapters || course._count?.chapters || 0;
}

export async function ensureDefaultPlans(prisma: PrismaClient) {
  for (const seed of defaultPlanSeeds) {
    const plan = await prisma.subscriptionPlan.upsert({
      where: { code: seed.code },
      update: {},
      create: {
        code: seed.code,
        name: seed.name,
        description: seed.description,
        price: seed.price,
        durationDays: seed.durationDays,
        displayOrder: seed.displayOrder,
        features: seed.features,
      },
    });

    const courses = await prisma.course.findMany({
      where: { tier: seed.tier, isActive: true },
      select: { id: true },
    });

    for (const course of courses) {
      await prisma.planCourse.upsert({
        where: { planId_courseId: { planId: plan.id, courseId: course.id } },
        update: {},
        create: { planId: plan.id, courseId: course.id },
      });
    }
  }
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
  if (course.tier === "FREE") return true;
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
  if ((unmappedPlanCodes.includes("BASIC") || unmappedPlanCodes.includes("BASIC_YEARLY")) && (course.tier === "BASIC" || course.tier === "FREE")) return true;

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
      OR: [
        { tier: "FREE" },
        { id: { in: assignedCourseIds } },
      ],
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
