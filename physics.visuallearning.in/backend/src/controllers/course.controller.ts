import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth";
import { userHasCourseAccess } from "../services/plan.service";

const prisma = new PrismaClient();

// Simple in-memory cache
const cache = new Map<string, { data: any; expiry: number }>();
function getCached(key: string) {
  const entry = cache.get(key);
  if (entry && entry.expiry > Date.now()) return entry.data;
  cache.delete(key);
  return null;
}
function setCache(key: string, data: any, ttlMs = 300000) {
  cache.set(key, { data, expiry: Date.now() + ttlMs });
}
export function clearCourseCache() {
  cache.delete("courses_all");
}

export async function getCourses(req: AuthRequest, res: Response) {
  try {
    const cacheKey = "courses_all";
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const courses = await prisma.course.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      include: {
        _count: { select: { chapters: true } },
      },
    });

    setCache(cacheKey, courses);
    res.json(courses);
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
}

export async function getCourseById(req: AuthRequest, res: Response) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        chapters: {
          orderBy: { displayOrder: "asc" },
          include: {
            _count: { select: { videos: true, notes: true, questions: true } },
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch course" });
  }
}

export async function getChapterVideos(req: AuthRequest, res: Response) {
  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: req.params.id },
      include: { course: { select: { id: true, tier: true } } },
    });

    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    const videos = await prisma.video.findMany({
      where: { chapterId: req.params.id },
      orderBy: { displayOrder: "asc" },
    });

    const hasAccess = await userHasCourseAccess(prisma, req.user?.id, chapter.course);

    // If first chapter, all videos are free
    const firstChapter = await prisma.chapter.findFirst({
      where: { courseId: chapter.courseId },
      orderBy: { displayOrder: "asc" },
    });
    const isFirstChapter = firstChapter?.id === chapter.id;

    const videosWithAccess = videos.map((v: any) => ({
      ...v,
      hasAccess: isFirstChapter || v.isFree || hasAccess,
      youtubeUrl: isFirstChapter || v.isFree || hasAccess ? v.youtubeUrl : "",
    }));

    res.json(videosWithAccess);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch videos" });
  }
}

export async function getVideoById(req: AuthRequest, res: Response) {
  try {
    const video = await prisma.video.findUnique({
      where: { id: req.params.id },
      include: { chapter: { include: { course: { select: { id: true, tier: true } } } } },
    });

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const hasAccess = video.isFree || await userHasCourseAccess(prisma, req.user?.id, video.chapter.course);

    if (!hasAccess) {
      return res.status(403).json({ message: "Subscription required to access this video" });
    }

    // Get watch progress if logged in
    let progress = null;
    if (req.user) {
      progress = await prisma.watchProgress.findUnique({
        where: { userId_videoId: { userId: req.user.id, videoId: video.id } },
      });
    }

    res.json({ ...video, watchProgress: progress });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch video" });
  }
}

export async function getChapterNotes(req: AuthRequest, res: Response) {
  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: req.params.id },
      include: { course: { select: { id: true, tier: true } } },
    });

    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    const notes = await prisma.note.findMany({
      where: { chapterId: req.params.id },
      orderBy: { displayOrder: "asc" },
    });

    const hasAccess = await userHasCourseAccess(prisma, req.user?.id, chapter.course);

    const notesWithAccess = notes.map((n: any, i: number) => ({
      ...n,
      hasAccess: n.isFree || i === 0 || hasAccess, // first note always free
      fileUrl: n.isFree || i === 0 || hasAccess ? n.fileUrl : "",
    }));

    res.json(notesWithAccess);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notes" });
  }
}

export async function getChapterQuestions(req: AuthRequest, res: Response) {
  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: req.params.id },
      include: { course: { select: { id: true, tier: true } } },
    });

    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    const hasAccess = await userHasCourseAccess(prisma, req.user?.id, chapter.course);

    // First chapter quiz is free
    const firstChapter = await prisma.chapter.findFirst({
      where: { courseId: chapter.courseId },
      orderBy: { displayOrder: "asc" },
    });
    const isFirstChapter = firstChapter?.id === chapter.id;

    if (!isFirstChapter && !hasAccess) {
      return res.status(403).json({ message: "Subscription required to access quizzes" });
    }

    const questions = await prisma.question.findMany({
      where: { chapterId: req.params.id },
      orderBy: { displayOrder: "asc" },
    });

    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch questions" });
  }
}

export async function updateProgress(req: AuthRequest, res: Response) {
  try {
    const { videoId, progress, completed } = req.body;

    const wp = await prisma.watchProgress.upsert({
      where: { userId_videoId: { userId: req.user!.id, videoId } },
      update: { progress, completed: completed || progress >= 90 },
      create: { userId: req.user!.id, videoId, progress, completed: completed || progress >= 90 },
    });

    res.json(wp);
  } catch (error) {
    res.status(500).json({ message: "Failed to update progress" });
  }
}
