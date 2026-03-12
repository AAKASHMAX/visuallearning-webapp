import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { success, error } from "../utils/apiResponse";

// --- Schemas ---
export const classSchema = z.object({ name: z.string().min(1), order: z.number().int().optional() });
export const subjectSchema = z.object({ classId: z.string(), name: z.string().min(1), icon: z.string().optional() });
export const chapterSchema = z.object({ subjectId: z.string(), name: z.string().min(1), order: z.number().int().optional() });
export const videoSchema = z.object({
  chapterId: z.string(), title: z.string().min(1), youtubeVideoId: z.string().min(1),
  duration: z.string().optional(), order: z.number().int().optional(), isFree: z.boolean().optional(),
});
export const noteSchema = z.object({ chapterId: z.string(), title: z.string().min(1), pdfUrl: z.string().min(1) });
export const questionSchema = z.object({
  chapterId: z.string(), questionText: z.string().min(1),
  optionA: z.string(), optionB: z.string(), optionC: z.string(), optionD: z.string(),
  correctOption: z.enum(["A", "B", "C", "D"]), solution: z.string().optional(),
});

// --- Dashboard Stats ---
export async function getStats(_req: Request, res: Response) {
  try {
    const [totalUsers, activeSubscriptions, totalRevenue, totalVideos, recentUsers] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.subscription.count({ where: { status: "ACTIVE", expiryDate: { gt: new Date() } } }),
      prisma.subscription.aggregate({ _sum: { amount: true }, where: { status: "ACTIVE" } }),
      prisma.video.count(),
      prisma.user.findMany({
        where: { role: "STUDENT" },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, name: true, email: true, createdAt: true },
      }),
    ]);

    return success(res, {
      totalUsers,
      activeSubscriptions,
      totalRevenue: (totalRevenue._sum.amount || 0) / 100,
      totalVideos,
      recentUsers,
    });
  } catch (e) {
    console.error("Stats error:", e);
    return error(res, "Failed to fetch stats");
  }
}

// --- User Management ---
export async function getAllUsers(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || "";

    const where = {
      role: "STUDENT" as const,
      ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { email: { contains: search, mode: "insensitive" as const } }] } : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, blocked: true, emailVerified: true, createdAt: true },
      }),
      prisma.user.count({ where }),
    ]);

    // Get subscription status for each user
    const userIds = users.map((u) => u.id);
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: { in: userIds }, status: "ACTIVE", expiryDate: { gt: new Date() } },
      select: { userId: true, plan: true, expiryDate: true },
    });
    const subMap = new Map(subscriptions.map((s) => [s.userId, s]));

    const usersWithSub = users.map((u) => ({ ...u, subscription: subMap.get(u.id) || null }));

    return success(res, { users: usersWithSub, total, page, totalPages: Math.ceil(total / limit) });
  } catch (e) {
    console.error("Get users error:", e);
    return error(res, "Failed to fetch users");
  }
}

export async function toggleBlockUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return error(res, "User not found", 404);
    if (user.role === "ADMIN") return error(res, "Cannot block an admin", 400);

    const updated = await prisma.user.update({
      where: { id },
      data: { blocked: !user.blocked },
      select: { id: true, name: true, blocked: true },
    });
    return success(res, updated, updated.blocked ? "User blocked" : "User unblocked");
  } catch (e) {
    console.error("Toggle block error:", e);
    return error(res, "Failed to update user");
  }
}

// --- CRUD Helpers ---
async function crudCreate(model: any, data: any, res: Response) {
  try {
    const result = await model.create({ data });
    return success(res, result, "Created successfully", 201);
  } catch (e: any) {
    console.error("Create error:", e);
    return error(res, e.code === "P2002" ? "Already exists" : "Failed to create");
  }
}

async function crudUpdate(model: any, id: string, data: any, res: Response) {
  try {
    // Strip fields that should not be sent to Prisma update
    const { id: _id, createdAt, updatedAt, chapter, subject, class: cls, videos, notes, questions, ...cleanData } = data;
    const result = await model.update({ where: { id }, data: cleanData });
    return success(res, result, "Updated successfully");
  } catch (e: any) {
    console.error("Update error:", e);
    return error(res, e.code === "P2025" ? "Not found" : "Failed to update");
  }
}

async function crudDelete(model: any, id: string, res: Response) {
  try {
    await model.delete({ where: { id } });
    return success(res, null, "Deleted successfully");
  } catch (e: any) {
    console.error("Delete error:", e);
    return error(res, e.code === "P2025" ? "Not found" : "Failed to delete");
  }
}

// --- Classes ---
export async function addClass(req: Request, res: Response) { return crudCreate(prisma.class, req.body, res); }
export async function updateClass(req: Request, res: Response) { return crudUpdate(prisma.class, req.params.id, req.body, res); }
export async function deleteClass(req: Request, res: Response) { return crudDelete(prisma.class, req.params.id, res); }

// --- Subjects ---
export async function addSubject(req: Request, res: Response) { return crudCreate(prisma.subject, req.body, res); }
export async function updateSubject(req: Request, res: Response) { return crudUpdate(prisma.subject, req.params.id, req.body, res); }
export async function deleteSubject(req: Request, res: Response) { return crudDelete(prisma.subject, req.params.id, res); }

// --- Chapters ---
export async function addChapter(req: Request, res: Response) { return crudCreate(prisma.chapter, req.body, res); }
export async function updateChapter(req: Request, res: Response) { return crudUpdate(prisma.chapter, req.params.id, req.body, res); }
export async function deleteChapter(req: Request, res: Response) { return crudDelete(prisma.chapter, req.params.id, res); }

// --- Videos ---
export async function addVideo(req: Request, res: Response) { return crudCreate(prisma.video, req.body, res); }
export async function updateVideo(req: Request, res: Response) { return crudUpdate(prisma.video, req.params.id, req.body, res); }
export async function deleteVideo(req: Request, res: Response) { return crudDelete(prisma.video, req.params.id, res); }

// --- Notes ---
export async function addNote(req: Request, res: Response) { return crudCreate(prisma.note, req.body, res); }
export async function deleteNote(req: Request, res: Response) { return crudDelete(prisma.note, req.params.id, res); }

// --- Questions ---
export async function addQuestion(req: Request, res: Response) { return crudCreate(prisma.question, req.body, res); }
export async function updateQuestion(req: Request, res: Response) { return crudUpdate(prisma.question, req.params.id, req.body, res); }
export async function deleteQuestion(req: Request, res: Response) { return crudDelete(prisma.question, req.params.id, res); }

// --- Analytics ---
export async function getMostWatched(_req: Request, res: Response) {
  try {
    const videos = await prisma.watchProgress.groupBy({
      by: ["videoId"],
      _count: { videoId: true },
      orderBy: { _count: { videoId: "desc" } },
      take: 10,
    });

    const videoIds = videos.map((v) => v.videoId);
    const videoDetails = await prisma.video.findMany({
      where: { id: { in: videoIds } },
      include: { chapter: { include: { subject: { include: { class: true } } } } },
    });

    const result = videos.map((v) => ({
      ...videoDetails.find((d) => d.id === v.videoId),
      watchCount: v._count.videoId,
    }));

    return success(res, result);
  } catch (e) {
    console.error("Most watched error:", e);
    return error(res, "Failed to fetch analytics");
  }
}

export async function getRevenueByMonth(_req: Request, res: Response) {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const subscriptions = await prisma.subscription.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { amount: true, createdAt: true },
    });

    const revenueByMonth: Record<string, number> = {};
    subscriptions.forEach((s) => {
      const key = `${s.createdAt.getFullYear()}-${String(s.createdAt.getMonth() + 1).padStart(2, "0")}`;
      revenueByMonth[key] = (revenueByMonth[key] || 0) + s.amount / 100;
    });

    return success(res, revenueByMonth);
  } catch (e) {
    console.error("Revenue error:", e);
    return error(res, "Failed to fetch revenue data");
  }
}
