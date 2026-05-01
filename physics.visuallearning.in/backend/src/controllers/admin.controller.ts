import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();

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
export async function createCourse(req: AuthRequest, res: Response) {
  try {
    const { name, description, tier, displayOrder } = req.body;
    const course = await prisma.course.create({
      data: { name, description, tier: tier || "FREE", displayOrder: displayOrder || 0 },
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: "Failed to create course" });
  }
}

export async function updateCourse(req: AuthRequest, res: Response) {
  try {
    const { name, description, tier, displayOrder, isActive } = req.body;
    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: { name, description, tier, displayOrder, isActive },
    });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: "Failed to update course" });
  }
}

export async function deleteCourse(req: AuthRequest, res: Response) {
  try {
    await prisma.course.delete({ where: { id: req.params.id } });
    res.json({ message: "Course deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete course" });
  }
}

// ─── Chapter Management ──────────────────────────────────────────
export async function createChapter(req: AuthRequest, res: Response) {
  try {
    const { name, courseId, displayOrder } = req.body;
    const chapter = await prisma.chapter.create({
      data: { name, courseId, displayOrder: displayOrder || 0 },
    });
    res.status(201).json(chapter);
  } catch (error) {
    res.status(500).json({ message: "Failed to create chapter" });
  }
}

export async function updateChapter(req: AuthRequest, res: Response) {
  try {
    const { name, displayOrder } = req.body;
    const chapter = await prisma.chapter.update({
      where: { id: req.params.id },
      data: { name, displayOrder },
    });
    res.json(chapter);
  } catch (error) {
    res.status(500).json({ message: "Failed to update chapter" });
  }
}

export async function deleteChapter(req: AuthRequest, res: Response) {
  try {
    await prisma.chapter.delete({ where: { id: req.params.id } });
    res.json({ message: "Chapter deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete chapter" });
  }
}

// ─── Video Management ────────────────────────────────────────────
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

// ─── Subscription Management ─────────────────────────────────────
export async function getSubscriptions(req: AuthRequest, res: Response) {
  try {
    const { page = "1", limit = "20" } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.subscription.count(),
    ]);

    res.json({ subscriptions, total });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subscriptions" });
  }
}

export async function grantSubscription(req: AuthRequest, res: Response) {
  try {
    const { userId, plan, days } = req.body;

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (days || 30));

    const subscription = await prisma.subscription.upsert({
      where: { userId },
      update: { plan, status: "ACTIVE", startDate: new Date(), expiryDate },
      create: { userId, plan, status: "ACTIVE", expiryDate, amount: 0 },
    });

    res.json({ message: "Subscription granted", subscription });
  } catch (error) {
    res.status(500).json({ message: "Failed to grant subscription" });
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
