import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { success, error } from "../utils/apiResponse";

export async function getClasses(_req: Request, res: Response) {
  try {
    const classes = await prisma.class.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { subjects: true } } },
    });
    return success(res, classes);
  } catch (e) {
    console.error("Get classes error:", e);
    return error(res, "Failed to fetch classes");
  }
}

export async function getSubjects(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const classData = await prisma.class.findUnique({ where: { id } });
    if (!classData) return error(res, "Class not found", 404);

    const subjects = await prisma.subject.findMany({
      where: { classId: id },
      include: { _count: { select: { chapters: true } } },
    });
    return success(res, { class: classData, subjects });
  } catch (e) {
    console.error("Get subjects error:", e);
    return error(res, "Failed to fetch subjects");
  }
}

export async function getChapters(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: { class: true },
    });
    if (!subject) return error(res, "Subject not found", 404);

    const chapters = await prisma.chapter.findMany({
      where: { subjectId: id },
      orderBy: { order: "asc" },
      include: {
        _count: { select: { videos: true, notes: true, questions: true } },
      },
    });
    return success(res, { subject, chapters });
  } catch (e) {
    console.error("Get chapters error:", e);
    return error(res, "Failed to fetch chapters");
  }
}

// Helper: check if user has access to a specific class
async function checkClassAccess(userId: string, classId: string): Promise<{ hasAccess: boolean; subscription: any }> {
  const sub = await prisma.subscription.findFirst({
    where: { userId, status: "ACTIVE", expiryDate: { gt: new Date() } },
  });
  if (!sub) return { hasAccess: false, subscription: null };

  // MONTHLY, YEARLY, FULL_ACCESS or empty classesAccess = full access
  if (sub.classesAccess.length === 0 || sub.classesAccess.includes(classId)) {
    return { hasAccess: true, subscription: sub };
  }
  return { hasAccess: false, subscription: sub };
}

export async function getVideos(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const language = (req.query.language as string) || "ENGLISH";

    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: { subject: { include: { class: true } } },
    });
    if (!chapter) return error(res, "Chapter not found", 404);

    // Fetch videos for requested language
    let videos = await prisma.video.findMany({
      where: { chapterId: id, language: language as any },
      orderBy: { order: "asc" },
    });

    // Fallback to ENGLISH if no videos found for requested language
    let usingFallback = false;
    if (videos.length === 0 && language !== "ENGLISH") {
      videos = await prisma.video.findMany({
        where: { chapterId: id, language: "ENGLISH" },
        orderBy: { order: "asc" },
      });
      usingFallback = true;
    }

    // Check access
    const isAdmin = req.user?.role === "ADMIN";
    let hasAccess = false;
    if (isAdmin) {
      hasAccess = true;
    } else if (req.user) {
      const classId = chapter.subject.class.id;
      const result = await checkClassAccess(req.user.id, classId);
      hasAccess = result.hasAccess;
    }

    // Hide youtubeVideoId for non-free videos if no access
    const videosWithAccess = videos.map((v) => ({
      ...v,
      youtubeVideoId: v.isFree || hasAccess ? v.youtubeVideoId : null,
      locked: !v.isFree && !hasAccess,
    }));

    // Get available languages for this chapter
    const availableLanguages = await prisma.video.findMany({
      where: { chapterId: id },
      select: { language: true },
      distinct: ["language"],
    });

    return success(res, {
      chapter,
      videos: videosWithAccess,
      language,
      usingFallback,
      availableLanguages: availableLanguages.map((l) => l.language),
    });
  } catch (e) {
    console.error("Get videos error:", e);
    return error(res, "Failed to fetch videos");
  }
}

export async function getVideoById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const video = await prisma.video.findUnique({
      where: { id },
      include: { chapter: { include: { subject: { include: { class: true } } } } },
    });
    if (!video) return error(res, "Video not found", 404);

    if (!video.isFree) {
      if (!req.user) return error(res, "Login required", 401);
      const isAdmin = req.user.role === "ADMIN";
      if (!isAdmin) {
        const classId = video.chapter.subject.class.id;
        const { hasAccess } = await checkClassAccess(req.user.id, classId);
        if (!hasAccess) return error(res, "Active subscription required for this class", 403);
      }
    }

    let progress = null;
    if (req.user) {
      progress = await prisma.watchProgress.findUnique({
        where: { userId_videoId: { userId: req.user.id, videoId: id } },
      });
    }

    return success(res, { video, progress });
  } catch (e) {
    console.error("Get video error:", e);
    return error(res, "Failed to fetch video");
  }
}

export async function getNotes(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const notes = await prisma.note.findMany({ where: { chapterId: id } });
    return success(res, notes);
  } catch (e) {
    console.error("Get notes error:", e);
    return error(res, "Failed to fetch notes");
  }
}

export async function getQuestions(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const questions = await prisma.question.findMany({ where: { chapterId: id } });
    return success(res, questions);
  } catch (e) {
    console.error("Get questions error:", e);
    return error(res, "Failed to fetch questions");
  }
}
