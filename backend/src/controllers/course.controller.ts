import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { success, error } from "../utils/apiResponse";
import { cacheGet, cacheSet } from "../utils/cache";

const CACHE_TTL = 300; // 5 minutes for static content

export async function getClasses(_req: Request, res: Response) {
  try {
    const cached = cacheGet("classes");
    if (cached) return success(res, cached);

    const classes = await prisma.class.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { subjects: true } } },
    });
    cacheSet("classes", classes, CACHE_TTL);
    return success(res, classes);
  } catch (e) {
    console.error("Get classes error:", e);
    return error(res, "Failed to fetch classes");
  }
}

export async function getSubjects(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const cacheKey = `subjects:${id}`;
    const cached = cacheGet(cacheKey);
    if (cached) return success(res, cached);

    const classData = await prisma.class.findUnique({ where: { id } });
    if (!classData) return error(res, "Class not found", 404);

    const subjects = await prisma.subject.findMany({
      where: { classId: id },
      include: { _count: { select: { chapters: true } } },
    });
    const result = { class: classData, subjects };
    cacheSet(cacheKey, result, CACHE_TTL);
    return success(res, result);
  } catch (e) {
    console.error("Get subjects error:", e);
    return error(res, "Failed to fetch subjects");
  }
}

export async function getChapters(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const contentType = req.query.contentType as string | undefined;

    const subject = await prisma.subject.findUnique({
      where: { id },
      include: { class: true },
    });
    if (!subject) return error(res, "Subject not found", 404);

    // Build where clause based on content type filter
    const chapterWhere: any = { subjectId: id };
    if (contentType === "animated_videos") {
      chapterWhere.videos = { some: { type: "ANIMATED_VIDEO" } };
    } else if (contentType === "lecture_videos") {
      chapterWhere.videos = { some: { type: "LECTURE_VIDEO" } };
    } else if (contentType === "notes") {
      chapterWhere.notes = { some: {} };
    } else if (contentType === "quiz") {
      chapterWhere.questions = { some: {} };
    }

    const chapters = await prisma.chapter.findMany({
      where: chapterWhere,
      orderBy: { order: "asc" },
      include: {
        _count: { select: { videos: true, notes: true, questions: true } },
      },
    });

    // If filtering by content type, add specific content count (single query instead of N+1)
    let chaptersWithCount = chapters;
    if (contentType === "animated_videos" || contentType === "lecture_videos") {
      const videoType = contentType === "animated_videos" ? "ANIMATED_VIDEO" : "LECTURE_VIDEO";
      const chapterIds = chapters.map((ch) => ch.id);
      const counts = await prisma.video.groupBy({
        by: ["chapterId"],
        where: { chapterId: { in: chapterIds }, type: videoType },
        _count: true,
      });
      const countMap = new Map(counts.map((c) => [c.chapterId, c._count]));
      chaptersWithCount = chapters.map((ch) => ({
        ...ch,
        contentCount: countMap.get(ch.id) || 0,
      }));
    } else if (contentType === "notes") {
      chaptersWithCount = chapters.map((ch) => ({
        ...ch,
        contentCount: ch._count.notes,
      }));
    } else if (contentType === "quiz") {
      chaptersWithCount = chapters.map((ch) => ({
        ...ch,
        contentCount: ch._count.questions,
      }));
    }

    return success(res, { subject, chapters: chaptersWithCount });
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
    const type = req.query.type as string | undefined;

    // Single query: fetch chapter + ALL videos for this chapter (filter in memory)
    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: { subject: { include: { class: true } } },
    });
    if (!chapter) return error(res, "Chapter not found", 404);

    // Fetch all videos for this chapter in one query (avoids 3-4 separate queries)
    const allChapterVideos = await prisma.video.findMany({
      where: { chapterId: id, ...(type ? { type } : {}) },
      orderBy: { order: "asc" },
    });

    // Filter in memory instead of multiple DB calls
    let videos = allChapterVideos.filter((v) => v.language === language);
    let usingFallback = false;

    if (videos.length === 0 && language !== "ENGLISH") {
      videos = allChapterVideos.filter((v) => v.language === "ENGLISH");
      usingFallback = true;
    }

    // Include Coming Soon placeholders from English
    if (language !== "ENGLISH" && !usingFallback) {
      const existingOrders = new Set(videos.map((v) => v.order));
      const comingSoon = allChapterVideos.filter(
        (v) => v.language === "ENGLISH" && v.youtubeVideoId === "" && !existingOrders.has(v.order)
      );
      if (comingSoon.length > 0) {
        videos = [...videos, ...comingSoon].sort((a, b) => a.order - b.order);
      }
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
      hasVideo: !!v.youtubeVideoId,
      locked: !v.isFree && !hasAccess,
    }));

    // Extract available languages from the already-fetched data (no extra query)
    const availableLanguages = [...new Set(allChapterVideos.map((v) => v.language))];

    return success(res, {
      chapter,
      videos: videosWithAccess,
      language,
      usingFallback,
      availableLanguages,
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
    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: { subject: { include: { class: true } } },
    });
    if (!chapter) return error(res, "Chapter not found", 404);

    const notes = await prisma.note.findMany({ where: { chapterId: id } });

    // Check subscription for download access
    const isAdmin = req.user?.role === "ADMIN";
    let hasAccess = false;
    if (isAdmin) {
      hasAccess = true;
    } else if (req.user) {
      const result = await checkClassAccess(req.user.id, chapter.subject.class.id);
      hasAccess = result.hasAccess;
    }

    return success(res, { notes, hasAccess });
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

export async function getSubjectContentCounts(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const cacheKey = `content-counts:${id}`;
    const cached = cacheGet(cacheKey);
    if (cached) return success(res, cached);

    const subject = await prisma.subject.findUnique({ where: { id } });
    if (!subject) return error(res, "Subject not found", 404);

    const [animatedVideos, lectureVideos, notes, quiz, boardPapers] = await Promise.all([
      prisma.video.count({ where: { chapter: { subjectId: id }, type: "ANIMATED_VIDEO" } }),
      prisma.video.count({ where: { chapter: { subjectId: id }, type: "LECTURE_VIDEO" } }),
      prisma.note.count({ where: { chapter: { subjectId: id } } }),
      prisma.question.count({ where: { chapter: { subjectId: id } } }),
      prisma.boardPaper.count({ where: { subjectId: id } }),
    ]);

    const result = { animatedVideos, lectureVideos, notes, quiz, boardPapers };
    cacheSet(cacheKey, result, CACHE_TTL);
    return success(res, result);
  } catch (e) {
    console.error("Get content counts error:", e);
    return error(res, "Failed to fetch content counts");
  }
}

export async function getBoardPapers(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const cacheKey = `board-papers:${id}`;
    const cached = cacheGet(cacheKey);
    if (cached) return success(res, cached);

    const subject = await prisma.subject.findUnique({
      where: { id },
      include: { class: true },
    });
    if (!subject) return error(res, "Subject not found", 404);

    const papers = await prisma.boardPaper.findMany({
      where: { subjectId: id },
      orderBy: [{ year: "desc" }, { order: "asc" }],
    });

    // Group by year
    const grouped: Record<number, typeof papers> = {};
    papers.forEach((p) => {
      if (!grouped[p.year]) grouped[p.year] = [];
      grouped[p.year].push(p);
    });

    const result = { subject, papers: grouped };
    cacheSet(cacheKey, result, CACHE_TTL);
    return success(res, result);
  } catch (e) {
    console.error("Get board papers error:", e);
    return error(res, "Failed to fetch board papers");
  }
}
