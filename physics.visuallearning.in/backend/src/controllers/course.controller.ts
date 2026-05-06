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

function formatCourseChapters(course: any) {
  const linkedChapters = (course.courseChapters || []).map((link: any) => ({
    ...link.chapter,
    displayOrder: link.order,
  }));
  const linkedIds = new Set(linkedChapters.map((chapter: any) => chapter.id));
  const legacyChapters = (course.chapters || []).filter((chapter: any) => !linkedIds.has(chapter.id));
  const chapters = [...linkedChapters, ...legacyChapters].sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
  const { courseChapters, ...rest } = course;
  return { ...rest, chapters };
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

async function userHasChapterAccess(chapter: any, userId?: string) {
  const courses = [
    ...(chapter.course ? [chapter.course] : []),
    ...((chapter.courseLinks || []).map((link: any) => link.course)),
  ].filter(Boolean);

  if (courses.length === 0) return false;
  for (const course of courses) {
    if (await userHasCourseAccess(prisma, userId, course)) return true;
  }
  return false;
}

async function isFirstChapterInAnyCourse(chapter: any) {
  if (chapter.courseId) {
    const firstChapter = await prisma.chapter.findFirst({
      where: { courseId: chapter.courseId },
      orderBy: { displayOrder: "asc" },
    });
    if (firstChapter?.id === chapter.id) return true;
  }

  const links = chapter.courseLinks || [];
  for (const link of links) {
    const firstLink = await prisma.courseChapter.findFirst({
      where: { courseId: link.courseId },
      orderBy: { order: "asc" },
    });
    if (firstLink?.chapterId === chapter.id) return true;
  }
  return false;
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
        _count: { select: { chapters: true, courseChapters: true } },
        chapters: { select: { id: true } },
        courseChapters: { select: { chapterId: true } },
      },
    });

    const formatted = courses.map(({ chapters, courseChapters, ...course }: any) => ({
      ...course,
      _count: { ...course._count, chapters: courseChapterCount({ chapters, courseChapters }) },
    }));

    setCache(cacheKey, formatted);
    res.json(formatted);
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
        courseChapters: {
          orderBy: { order: "asc" },
          include: {
            chapter: {
              include: {
                _count: { select: { videos: true, notes: true, questions: true } },
              },
            },
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const hasAccess = await userHasCourseAccess(prisma, req.user?.id, course);
    if (!hasAccess) {
      return res.status(403).json({ message: "Subscription required to access this course" });
    }

    res.json(formatCourseChapters(course));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch course" });
  }
}

export async function getChapterVideos(req: AuthRequest, res: Response) {
  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: req.params.id },
      include: {
        course: { select: { id: true, tier: true } },
        courseLinks: { include: { course: { select: { id: true, tier: true } } } },
      },
    });

    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    const videos = await prisma.video.findMany({
      where: { chapterId: req.params.id },
      orderBy: { displayOrder: "asc" },
    });

    const hasAccess = await userHasChapterAccess(chapter, req.user?.id);
    const isFirstChapter = await isFirstChapterInAnyCourse(chapter);

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
      include: {
        chapter: {
          include: {
            course: { select: { id: true, tier: true } },
            courseLinks: { include: { course: { select: { id: true, tier: true } } } },
          },
        },
      },
    });

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const isFirstChapter = await isFirstChapterInAnyCourse(video.chapter);
    const hasAccess = video.isFree || isFirstChapter || await userHasChapterAccess(video.chapter, req.user?.id);

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
      include: {
        course: { select: { id: true, tier: true } },
        courseLinks: { include: { course: { select: { id: true, tier: true } } } },
      },
    });

    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    const notes = await prisma.note.findMany({
      where: { chapterId: req.params.id },
      orderBy: { displayOrder: "asc" },
    });

    const hasAccess = await userHasChapterAccess(chapter, req.user?.id);
    const isFirstChapter = await isFirstChapterInAnyCourse(chapter);

    const notesWithAccess = notes.map((n: any, i: number) => ({
      ...n,
      hasAccess: n.isFree || (isFirstChapter && i === 0) || hasAccess,
      fileUrl: n.isFree || (isFirstChapter && i === 0) || hasAccess ? n.fileUrl : "",
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
      include: {
        course: { select: { id: true, tier: true } },
        courseLinks: { include: { course: { select: { id: true, tier: true } } } },
      },
    });

    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    const hasAccess = await userHasChapterAccess(chapter, req.user?.id);
    const isFirstChapter = await isFirstChapterInAnyCourse(chapter);

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
