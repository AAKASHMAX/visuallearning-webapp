import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { AuthRequest } from "../middleware/auth";
import { clearCourseCache } from "./course.controller";
import { clearSubscriptionPlanCache } from "./subscription.controller";
import { clearDefaultPlansEnsureCache, ensureDefaultPlans, getEffectivePlanPrice, getPlanByCode, isFreeOfferActive } from "../services/plan.service";

const prisma = new PrismaClient();

function normalizeVimeoVideoId(value?: string | null) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return null;

  const match =
    trimmed.match(/player\.vimeo\.com\/video\/(\d+)(?:\?h=([a-zA-Z0-9]+))?/i) ||
    trimmed.match(/vimeo\.com\/(?:manage\/videos\/|video\/)?(\d+)(?:\/([a-zA-Z0-9]+))?/i);

  if (!match) return trimmed;
  const hash = match[2];
  return hash ? `${match[1]}/${hash}` : match[1];
}

// ─── Dashboard Stats ─────────────────────────────────────────────
export async function getStats(req: AuthRequest, res: Response) {
  try {
    const [totalUsers, totalCourses, totalVideos, activeSubscriptions] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.course.count(),
      prisma.video.count(),
      prisma.subscription.count({ where: { status: "ACTIVE", expiryDate: { gt: new Date() } } }),
    ]);

    res.json({ totalUsers, totalCourses, totalVideos, activeSubscriptions });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
}

// ─── User Management ─────────────────────────────────────────────
export async function getUsers(req: AuthRequest, res: Response) {
  try {
    const { page = "1", limit = "20", search = "" } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { role: "STUDENT" };
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { email: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: "desc" },
        select: {
          id: true, name: true, email: true, blocked: true, createdAt: true,
          subscription: { select: { plan: true, status: true, expiryDate: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
}

export async function toggleBlockUser(req: AuthRequest, res: Response) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { blocked: !user.blocked },
    });

    res.json({ message: `User ${updated.blocked ? "blocked" : "unblocked"}` });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user" });
  }
}

// ─── Course Management ───────────────────────────────────────────
export async function deleteUser(req: AuthRequest, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.id === req.user!.id) return res.status(400).json({ message: "You cannot delete your own account" });
    if (user.role !== "STUDENT") return res.status(400).json({ message: "Only student accounts can be deleted here" });

    await prisma.$transaction([
      prisma.watchProgress.deleteMany({ where: { userId: user.id } }),
      prisma.notificationRead.deleteMany({ where: { userId: user.id } }),
      prisma.subscription.deleteMany({ where: { userId: user.id } }),
      prisma.feedback.updateMany({ where: { userId: user.id }, data: { userId: null } }),
      prisma.user.delete({ where: { id: user.id } }),
    ]);

    res.json({ message: `Deleted ${user.name || user.email}` });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
}

export async function createCourse(req: AuthRequest, res: Response) {
  try {
    const { name, description, tier, displayOrder, vimeoVideoId } = req.body;
    const course = await prisma.course.create({
      data: { name, description, tier: tier || "BASIC", displayOrder: displayOrder || 0, vimeoVideoId: normalizeVimeoVideoId(vimeoVideoId) },
    });
    clearCourseCache();
    clearDefaultPlansEnsureCache();
    clearSubscriptionPlanCache();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: "Failed to create course" });
  }
}

export async function updateCourse(req: AuthRequest, res: Response) {
  try {
    const { name, description, tier, displayOrder, isActive, vimeoVideoId } = req.body;
    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: { name, description, tier, displayOrder, isActive, vimeoVideoId: normalizeVimeoVideoId(vimeoVideoId) },
    });
    clearCourseCache();
    clearDefaultPlansEnsureCache();
    clearSubscriptionPlanCache();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: "Failed to update course" });
  }
}

export async function deleteCourse(req: AuthRequest, res: Response) {
  try {
    await prisma.course.delete({ where: { id: req.params.id } });
    clearCourseCache();
    clearDefaultPlansEnsureCache();
    clearSubscriptionPlanCache();
    res.json({ message: "Course deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete course" });
  }
}

// ─── Chapter Management ──────────────────────────────────────────
export async function getAdminCourse(req: AuthRequest, res: Response) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        courseChapters: {
          orderBy: { order: "asc" },
          include: { chapter: { include: { _count: { select: { videos: true, notes: true, questions: true } } } } },
        },
        chapters: {
          orderBy: { displayOrder: "asc" },
          include: { _count: { select: { videos: true, notes: true, questions: true } } },
        },
      },
    });

    if (!course) return res.status(404).json({ message: "Course not found" });

    const linkedChapters = course.courseChapters.map((link) => ({
      ...link.chapter,
      displayOrder: link.order,
      chapterId: link.chapterId,
    }));
    const linkedIds = new Set(linkedChapters.map((chapter) => chapter.id));
    const legacyChapters = course.chapters.filter((chapter) => !linkedIds.has(chapter.id));
    const chapters = [...linkedChapters, ...legacyChapters].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    res.json({ ...course, chapters });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch course" });
  }
}

export async function addChapterToCourse(req: AuthRequest, res: Response) {
  try {
    const { chapterId, order } = req.body;
    if (!chapterId) return res.status(400).json({ message: "Chapter is required" });

    const link = await prisma.courseChapter.create({
      data: { courseId: req.params.id, chapterId, order: order || 0 },
    });
    clearCourseCache();
    clearSubscriptionPlanCache();
    res.status(201).json(link);
  } catch (error: any) {
    res.status(error.code === "P2002" ? 409 : 500).json({
      message: error.code === "P2002" ? "Chapter already added to this course" : "Failed to add chapter",
    });
  }
}

export async function removeChapterFromCourse(req: AuthRequest, res: Response) {
  try {
    await prisma.courseChapter.delete({
      where: { courseId_chapterId: { courseId: req.params.id, chapterId: req.params.chapterId } },
    });
    clearCourseCache();
    clearSubscriptionPlanCache();
    res.json({ message: "Chapter removed from course" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove chapter" });
  }
}

export async function createChapter(req: AuthRequest, res: Response) {
  try {
    const { name, courseId, displayOrder, animationKey } = req.body;
    const chapter = await prisma.chapter.create({
      data: { name, courseId: courseId || null, displayOrder: displayOrder || 0, animationKey: animationKey || null },
    });
    if (courseId) {
      await prisma.courseChapter.upsert({
        where: { courseId_chapterId: { courseId, chapterId: chapter.id } },
        update: { order: displayOrder || 0 },
        create: { courseId, chapterId: chapter.id, order: displayOrder || 0 },
      });
    }
    clearCourseCache();
    clearSubscriptionPlanCache();
    res.status(201).json(chapter);
  } catch (error) {
    res.status(500).json({ message: "Failed to create chapter" });
  }
}

export async function updateChapter(req: AuthRequest, res: Response) {
  try {
    const { name, displayOrder, animationKey } = req.body;
    const chapter = await prisma.chapter.update({
      where: { id: req.params.id },
      data: { name, displayOrder, animationKey: animationKey || null },
    });
    clearCourseCache();
    clearSubscriptionPlanCache();
    res.json(chapter);
  } catch (error) {
    res.status(500).json({ message: "Failed to update chapter" });
  }
}

export async function deleteChapter(req: AuthRequest, res: Response) {
  try {
    await prisma.chapter.delete({ where: { id: req.params.id } });
    clearCourseCache();
    clearSubscriptionPlanCache();
    res.json({ message: "Chapter deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete chapter" });
  }
}

// ─── Video Management ────────────────────────────────────────────
export async function getChaptersList(req: AuthRequest, res: Response) {
  try {
    const chapters = await prisma.chapter.findMany({
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      include: {
        _count: { select: { videos: true, notes: true, questions: true, courseLinks: true } },
        course: { select: { id: true, name: true, tier: true } },
        courseLinks: { include: { course: { select: { id: true, name: true, tier: true } } } },
      },
    });
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch chapters" });
  }
}

export async function createVideo(req: AuthRequest, res: Response) {
  try {
    const { title, youtubeUrl, videoType, language, isFree, displayOrder, chapterId } = req.body;
    const video = await prisma.video.create({
      data: { title, youtubeUrl, videoType, language, isFree, displayOrder: displayOrder || 0, chapterId },
    });
    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ message: "Failed to create video" });
  }
}

export async function updateVideo(req: AuthRequest, res: Response) {
  try {
    const { title, youtubeUrl, videoType, language, isFree, displayOrder } = req.body;
    const video = await prisma.video.update({
      where: { id: req.params.id },
      data: { title, youtubeUrl, videoType, language, isFree, displayOrder },
    });
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: "Failed to update video" });
  }
}

export async function deleteVideo(req: AuthRequest, res: Response) {
  try {
    await prisma.video.delete({ where: { id: req.params.id } });
    res.json({ message: "Video deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete video" });
  }
}

// ─── Note Management ─────────────────────────────────────────────
export async function getChapterVideosAdmin(req: AuthRequest, res: Response) {
  try {
    const videos = await prisma.video.findMany({
      where: { chapterId: req.params.chapterId },
      orderBy: { displayOrder: "asc" },
    });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch videos" });
  }
}

export async function createNote(req: AuthRequest, res: Response) {
  try {
    const { title, fileUrl, isFree, displayOrder, chapterId } = req.body;
    const note = await prisma.note.create({
      data: { title, fileUrl, isFree, displayOrder: displayOrder || 0, chapterId },
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: "Failed to create note" });
  }
}

export async function updateNote(req: AuthRequest, res: Response) {
  try {
    const { title, fileUrl, isFree, displayOrder } = req.body;
    const note = await prisma.note.update({
      where: { id: req.params.id },
      data: { title, fileUrl, isFree, displayOrder },
    });
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: "Failed to update note" });
  }
}

export async function deleteNote(req: AuthRequest, res: Response) {
  try {
    await prisma.note.delete({ where: { id: req.params.id } });
    res.json({ message: "Note deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete note" });
  }
}

// ─── Question Management ─────────────────────────────────────────
export async function getChapterNotesAdmin(req: AuthRequest, res: Response) {
  try {
    const notes = await prisma.note.findMany({
      where: { chapterId: req.params.chapterId },
      orderBy: { displayOrder: "asc" },
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notes" });
  }
}

export async function createQuestion(req: AuthRequest, res: Response) {
  try {
    const { question, optionA, optionB, optionC, optionD, correctAnswer, solution, displayOrder, chapterId } = req.body;
    const q = await prisma.question.create({
      data: { question, optionA, optionB, optionC, optionD, correctAnswer, solution, displayOrder: displayOrder || 0, chapterId },
    });
    res.status(201).json(q);
  } catch (error) {
    res.status(500).json({ message: "Failed to create question" });
  }
}

export async function updateQuestion(req: AuthRequest, res: Response) {
  try {
    const { question, optionA, optionB, optionC, optionD, correctAnswer, solution, displayOrder } = req.body;
    const q = await prisma.question.update({
      where: { id: req.params.id },
      data: { question, optionA, optionB, optionC, optionD, correctAnswer, solution, displayOrder },
    });
    res.json(q);
  } catch (error) {
    res.status(500).json({ message: "Failed to update question" });
  }
}

export async function deleteQuestion(req: AuthRequest, res: Response) {
  try {
    await prisma.question.delete({ where: { id: req.params.id } });
    res.json({ message: "Question deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete question" });
  }
}

export async function getChapterQuestionsAdmin(req: AuthRequest, res: Response) {
  try {
    const questions = await prisma.question.findMany({
      where: { chapterId: req.params.chapterId },
      orderBy: { displayOrder: "asc" },
    });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch questions" });
  }
}

// ─── Subscription Management ─────────────────────────────────────
export async function getSubscriptions(req: AuthRequest, res: Response) {
  try {
    const { page = "1", limit = "20" } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    await ensureDefaultPlans(prisma);
    const [subscriptions, total, plans] = await Promise.all([
      prisma.subscription.findMany({
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.subscription.count(),
      prisma.subscriptionPlan.findMany({ where: { code: { not: "FREE" } }, select: { code: true, name: true, price: true, durationDays: true, freeOfferEnabled: true, freeOfferUntil: true } }),
    ]);

    const planMap = new Map(plans.map((plan) => [plan.code, { ...plan, effectivePrice: getEffectivePlanPrice(plan) }]));
    res.json({ subscriptions: subscriptions.map((sub) => ({ ...sub, planDetails: planMap.get(sub.plan) || null })), total });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subscriptions" });
  }
}

export async function grantSubscription(req: AuthRequest, res: Response) {
  try {
    const { userId, plan, planCode, days } = req.body;
    const resolvedPlanCode = planCode || plan;
    const selectedPlan = await getPlanByCode(prisma, resolvedPlanCode);

    if (!selectedPlan) {
      return res.status(400).json({ message: "Invalid subscription plan" });
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (days || selectedPlan.durationDays || 30));

    const amount = getEffectivePlanPrice(selectedPlan);
    const subscription = await prisma.subscription.upsert({
      where: { userId },
      update: { plan: selectedPlan.code, status: "ACTIVE", startDate: new Date(), expiryDate, amount },
      create: { userId, plan: selectedPlan.code, status: "ACTIVE", expiryDate, amount },
    });

    res.json({ message: "Subscription granted", subscription });
  } catch (error) {
    res.status(500).json({ message: "Failed to grant subscription" });
  }
}

// ─── Subscription Plan Management ──────────────────────────────────────────
export async function getSubscriptionPlans(req: AuthRequest, res: Response) {
  try {
    await ensureDefaultPlans(prisma);
    const plans = await prisma.subscriptionPlan.findMany({
      where: { code: { not: "FREE" } },
      orderBy: { displayOrder: "asc" },
      include: { courses: { include: { course: { select: { id: true, name: true, tier: true } } } } },
    });
    res.json(plans.map((plan) => ({
      ...plan,
      effectivePrice: getEffectivePlanPrice(plan),
      isFreeOfferActive: isFreeOfferActive(plan),
      courseIds: plan.courses.map((item) => item.courseId),
      assignedCourses: plan.courses.map((item) => item.course),
    })));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subscription plans" });
  }
}

export async function createSubscriptionPlan(req: AuthRequest, res: Response) {
  try {
    const { code, name, description, price, durationDays, features, freeOfferEnabled, freeOfferUntil, isActive, displayOrder, courseIds } = req.body;
    const planCode = String(code || name || "").trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "");
    if (!planCode || !name) return res.status(400).json({ message: "Plan code and name are required" });

    const plan = await prisma.subscriptionPlan.create({
      data: {
        code: planCode,
        name,
        description,
        price: price || 0,
        durationDays: durationDays || 30,
        features: Array.isArray(features) ? features : [],
        freeOfferEnabled: freeOfferEnabled ?? false,
        freeOfferUntil: freeOfferUntil ? new Date(freeOfferUntil) : null,
        isActive: isActive ?? true,
        displayOrder: displayOrder || 0,
        courses: { create: (courseIds || []).map((courseId: string) => ({ courseId })) },
      },
    });
    clearSubscriptionPlanCache();
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: "Failed to create subscription plan" });
  }
}

export async function updateSubscriptionPlan(req: AuthRequest, res: Response) {
  try {
    const { code, name, description, price, durationDays, features, freeOfferEnabled, freeOfferUntil, isActive, displayOrder, courseIds } = req.body;
    const plan = await prisma.subscriptionPlan.update({
      where: { id: req.params.id },
      data: {
        code,
        name,
        description,
        price,
        durationDays,
        features: Array.isArray(features) ? features : [],
        freeOfferEnabled,
        freeOfferUntil: freeOfferUntil ? new Date(freeOfferUntil) : null,
        isActive,
        displayOrder,
        courses: {
          deleteMany: {},
          create: (courseIds || []).map((courseId: string) => ({ courseId })),
        },
      },
    });
    clearSubscriptionPlanCache();
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: "Failed to update subscription plan" });
  }
}

export async function deleteSubscriptionPlan(req: AuthRequest, res: Response) {
  try {
    await prisma.subscriptionPlan.delete({ where: { id: req.params.id } });
    clearSubscriptionPlanCache();
    res.json({ message: "Subscription plan deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete subscription plan" });
  }
}

export async function cancelSubscription(req: AuthRequest, res: Response) {
  try {
    await prisma.subscription.update({
      where: { id: req.params.id },
      data: { status: "CANCELLED" },
    });
    res.json({ message: "Subscription cancelled" });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel subscription" });
  }
}

// ─── Coupon Management ───────────────────────────────────────────
export async function getCoupons(req: AuthRequest, res: Response) {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch coupons" });
  }
}

export async function createCoupon(req: AuthRequest, res: Response) {
  try {
    const { code, discountPercent, maxUses, validFrom, validUntil, applicablePlans } = req.body;
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountPercent,
        maxUses: maxUses || 100,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: new Date(validUntil),
        applicablePlans: applicablePlans || [],
      },
    });
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: "Failed to create coupon" });
  }
}

export async function toggleCoupon(req: AuthRequest, res: Response) {
  try {
    const coupon = await prisma.coupon.findUnique({ where: { id: req.params.id } });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    const updated = await prisma.coupon.update({
      where: { id: req.params.id },
      data: { isActive: !coupon.isActive },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle coupon" });
  }
}

export async function deleteCoupon(req: AuthRequest, res: Response) {
  try {
    await prisma.coupon.delete({ where: { id: req.params.id } });
    res.json({ message: "Coupon deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete coupon" });
  }
}

// ─── Settings ────────────────────────────────────────────────────
// ─── Notification Management ─────────────────────────────────────
export async function getAdminNotifications(req: AuthRequest, res: Response) {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: [{ createdAt: "desc" }],
      include: { _count: { select: { reads: true } } },
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
}

export async function createNotification(req: AuthRequest, res: Response) {
  try {
    const { title, message, type = "INFO", isPublished = false } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Failed to create notification" });
  }
}

export async function updateNotification(req: AuthRequest, res: Response) {
  try {
    const { title, message, type, isPublished } = req.body;
    const existing = await prisma.notification.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: "Notification not found" });

    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: {
        title,
        message,
        type,
        isPublished,
        publishedAt: isPublished && !existing.publishedAt ? new Date() : existing.publishedAt,
      },
    });

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: "Failed to update notification" });
  }
}

export async function publishNotification(req: AuthRequest, res: Response) {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isPublished: true, publishedAt: new Date() },
    });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: "Failed to publish notification" });
  }
}

export async function deleteNotification(req: AuthRequest, res: Response) {
  try {
    await prisma.notification.delete({ where: { id: req.params.id } });
    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete notification" });
  }
}

export async function getSettings(req: AuthRequest, res: Response) {
  try {
    const settings = await prisma.setting.findMany();
    const result: Record<string, any> = {};
    for (const s of settings) {
      try { result[s.key] = JSON.parse(s.value); } catch { result[s.key] = s.value; }
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch settings" });
  }
}

export async function updateSettings(req: AuthRequest, res: Response) {
  try {
    const { key, value } = req.body;
    await prisma.setting.upsert({
      where: { key },
      update: { value: typeof value === "string" ? value : JSON.stringify(value) },
      create: { key, value: typeof value === "string" ? value : JSON.stringify(value) },
    });
    res.json({ message: "Settings updated" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update settings" });
  }
}

// ─── Analytics ───────────────────────────────────────────────────
export async function getAnalytics(req: AuthRequest, res: Response) {
  try {
    const [recentUsers, recentSubs, popularVideos] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
      prisma.subscription.count({
        where: { status: "ACTIVE", createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),
      prisma.watchProgress.groupBy({
        by: ["videoId"],
        _count: { videoId: true },
        orderBy: { _count: { videoId: "desc" } },
        take: 10,
      }),
    ]);

    // Get video details for popular videos
    const videoIds = popularVideos.map((p: any) => p.videoId);
    const videos = await prisma.video.findMany({
      where: { id: { in: videoIds } },
      select: { id: true, title: true },
    });

    const popularWithNames = popularVideos.map((p: any) => ({
      ...p,
      title: videos.find((v: any) => v.id === p.videoId)?.title || "Unknown",
    }));

    res.json({ recentUsers, recentSubs, popularVideos: popularWithNames });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
}

// ─── Public Settings ─────────────────────────────────────────────
export async function getPublicSettings(req: AuthRequest, res: Response) {
  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: ["plans_config", "contact_info"] } },
    });
    const result: Record<string, any> = {};
    for (const s of settings) {
      try { result[s.key] = JSON.parse(s.value); } catch { result[s.key] = s.value; }
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch settings" });
  }
}
