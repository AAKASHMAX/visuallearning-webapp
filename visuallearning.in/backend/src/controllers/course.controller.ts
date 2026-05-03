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

    const chapterCacheKey = `chapters:${id}:${contentType || "all"}`;
    const cachedChapters = cacheGet(chapterCacheKey);
    if (cachedChapters) return success(res, cachedChapters);

    const subject = await prisma.subject.findUnique({
      where: { id },
      include: { class: true },
    });
    if (!subject) return error(res, "Subject not found", 404);

    // Build where clause based on content type filter
    const chapterWhere: any = { subjectId: id };
    if (contentType === "animated_videos") {
      chapterWhere.videos = { some: { type: "ANIMATED_VIDEO" } };
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
    if (contentType === "animated_videos") {
      const videoType = "ANIMATED_VIDEO";
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

    const chapterResult = { subject, chapters: chaptersWithCount };
    cacheSet(chapterCacheKey, chapterResult, CACHE_TTL);
    return success(res, chapterResult);
  } catch (e) {
    console.error("Get chapters error:", e);
    return error(res, "Failed to fetch chapters");
  }
}

// Helper: check if user has access to a specific chapter/class/subject (cached for 60s)
// Supports: course-based plans (check chapter in course), FLEXI_PLAN (subject-level), legacy class-based
async function checkClassAccess(userId: string, classId: string, subjectId?: string, chapterId?: string): Promise<{ hasAccess: boolean; subscription: any }> {
  const cacheKey = `access:${userId}:${classId}:${subjectId ?? ""}:${chapterId ?? ""}`;
  const cached = cacheGet<{ hasAccess: boolean; subscription: any }>(cacheKey);
  if (cached) return cached;

  const sub = await prisma.subscription.findFirst({
    where: { userId, status: "ACTIVE", expiryDate: { gt: new Date() } },
  });
  if (!sub) {
    const result = { hasAccess: false, subscription: null };
    cacheSet(cacheKey, result, 60);
    return result;
  }

  const subjectsAccess = sub.subjectsAccess as string[];
  const classesAccess = sub.classesAccess as string[];

  let hasAccess: boolean;

  if (sub.plan === "FLEXI_PLAN" && subjectsAccess.length > 0) {
    // Subject-level access: only allow chapters of explicitly purchased subjects
    hasAccess = subjectId ? subjectsAccess.includes(subjectId) : classesAccess.includes(classId);
  } else if (sub.courseId && chapterId) {
    // Course-based access: check if the chapter is in the user's purchased course
    const courseChapter = await prisma.courseChapter.findUnique({
      where: { courseId_chapterId: { courseId: sub.courseId, chapterId } },
    });
    hasAccess = !!courseChapter;
  } else if (sub.courseId) {
    // Course-based but no chapterId provided — check if any chapter from this class/subject is in the course
    const courseChapters = await prisma.courseChapter.findMany({
      where: { courseId: sub.courseId },
      include: { chapter: { select: { subjectId: true, subject: { select: { classId: true } } } } },
    });
    if (subjectId) {
      hasAccess = courseChapters.some((cc) => cc.chapter.subjectId === subjectId);
    } else {
      hasAccess = courseChapters.some((cc) => cc.chapter.subject.classId === classId);
    }
  } else {
    // Legacy class-level or full access
    hasAccess = classesAccess.length === 0 || classesAccess.includes(classId);
  }

  const result = { hasAccess, subscription: sub };
  cacheSet(cacheKey, result, 60);
  return result;
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

    // Filter in memory
    let videos = [];
    let usingFallback = false;

    if (language === "all") {
      videos = allChapterVideos;
    } else {
      videos = allChapterVideos.filter((v) => v.language === language);
      if (videos.length === 0 && language !== "ENGLISH") {
        videos = allChapterVideos.filter((v) => v.language === "ENGLISH");
        usingFallback = true;
      }
    }


    // Include Coming Soon placeholders from English
    if (language !== "ENGLISH" && !usingFallback) {
      const existingOrders = new Set(videos.map((v) => v.order));
      const comingSoon = allChapterVideos.filter(
        (v) => v.language === "ENGLISH" && !v.youtubeVideoId && !v.vimeoVideoId && !existingOrders.has(v.order)
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
      const result = await checkClassAccess(req.user.id, classId, chapter.subject.id, chapter.id);
      hasAccess = result.hasAccess;
    }

    // Access control: all videos are locked for unsubscribed users
    const videosWithAccess = videos.map((v) => {
      const canWatch = hasAccess;
      return {
        ...v,
        youtubeVideoId: canWatch ? v.youtubeVideoId : null,
        vimeoVideoId: canWatch ? v.vimeoVideoId : null,
        hasVideo: !!(v.youtubeVideoId || v.vimeoVideoId),
        locked: !canWatch,
        isFree: false,
      };
    });

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

    // Free preview: only the first video (order=1) of the first chapter (order=1) is free
    // All videos in the first chapter are free
    const isFirstChapter = video.chapter.order === 1;

    if (!isFirstChapter) {
      if (!req.user) return error(res, "Login required", 401);
      const isAdmin = req.user.role === "ADMIN";
      if (!isAdmin) {
        const classId = video.chapter.subject.class.id;
        const { hasAccess } = await checkClassAccess(req.user.id, classId, video.chapter.subject.id, video.chapter.id);
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

    // Check subscription access
    const isAdmin = req.user?.role === "ADMIN";
    let hasAccess = false;
    if (isAdmin) {
      hasAccess = true;
    } else if (req.user) {
      const result = await checkClassAccess(req.user.id, chapter.subject.class.id, chapter.subject.id, chapter.id);
      hasAccess = result.hasAccess;
    }

    // Access control: all notes are locked for unsubscribed users
    const notesWithAccess = notes.map((n) => {
      const canView = hasAccess;
      return {
        ...n,
        pdfUrl: canView ? n.pdfUrl : null,
        locked: !canView,
      };
    });

    return success(res, { notes: notesWithAccess, hasAccess, chapter: { name: chapter.name } });
  } catch (e) {
    console.error("Get notes error:", e);
    return error(res, "Failed to fetch notes");
  }
}

export async function getQuestions(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: { subject: { include: { class: true } } },
    });
    if (!chapter) return error(res, "Chapter not found", 404);

    // Check subscription access
    const isAdmin = req.user?.role === "ADMIN";
    let hasAccess = false;
    if (isAdmin) {
      hasAccess = true;
    } else if (req.user) {
      const result = await checkClassAccess(req.user.id, chapter.subject.class.id);
      hasAccess = result.hasAccess;
    }

    // Access control: all quizzes are locked for unsubscribed users
    if (!hasAccess) {
      return success(res, { questions: [], hasAccess: false, locked: true });
    }

    const questions = await prisma.question.findMany({ where: { chapterId: id } });
    return success(res, { questions, hasAccess: true, locked: false });
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

    const [animatedVideos, notes, quiz, boardPapers] = await Promise.all([
      prisma.video.count({ where: { chapter: { subjectId: id }, type: "ANIMATED_VIDEO" } }),
      prisma.note.count({ where: { chapter: { subjectId: id } } }),
      prisma.question.count({ where: { chapter: { subjectId: id } } }),
      prisma.boardPaper.count({ where: { subjectId: id } }),
    ]);

    const result = { animatedVideos, notes, quiz, boardPapers };
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

    const subject = await prisma.subject.findUnique({
      where: { id },
      include: { class: true },
    });
    if (!subject) return error(res, "Subject not found", 404);

    // Check subscription access
    const isAdmin = req.user?.role === "ADMIN";
    let hasAccess = false;
    if (isAdmin) {
      hasAccess = true;
    } else if (req.user) {
      const result = await checkClassAccess(req.user.id, subject.class.id);
      hasAccess = result.hasAccess;
    }

    const papers = await prisma.boardPaper.findMany({
      where: { subjectId: id },
      orderBy: [{ year: "desc" }, { order: "asc" }],
    });

    // Group by year
    const grouped: Record<number, any[]> = {};
    const years = [...new Set(papers.map((p) => p.year))].sort((a, b) => b - a);

    papers.forEach((p) => {
      if (!grouped[p.year]) grouped[p.year] = [];
      // Free preview: only the first year's papers are free
      const isFirstYear = p.year === years[years.length - 1]; // oldest/first year
      const canView = hasAccess || isFirstYear;
      grouped[p.year].push({
        ...p,
        pdfUrl: canView ? p.pdfUrl : (p.pdfUrl ? "locked" : p.pdfUrl),
        locked: !canView,
      });
    });

    return success(res, { subject, papers: grouped, hasAccess });
  } catch (e) {
    console.error("Get board papers error:", e);
    return error(res, "Failed to fetch board papers");
  }
}

export async function getCourseBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        chapters: {
          include: {
            chapter: {
              include: {
                subject: true,
                _count: { select: { videos: true, notes: true, questions: true } }
              }
            }
          },
          orderBy: { order: "asc" }
        }
      }
    });

    if (!course) return error(res, "Course not found", 404);

    // Get plan config for pricing
    let planConfig: any = null;
    if (course.planKey) {
      const setting = await prisma.setting.findUnique({ where: { key: "plans_config" } });
      if (setting) {
        const plans = JSON.parse(setting.value);
        planConfig = plans[course.planKey] || null;
      }
    }

    // Group chapters by subject for the UI
    const subjectsMap: Record<string, any> = {};

    course.chapters.forEach(({ chapter }) => {
      const subjectName = chapter.subject.name;
      if (!subjectsMap[subjectName]) {
        subjectsMap[subjectName] = {
          name: subjectName,
          icon: chapter.subject.icon || "Atom",
          color: subjectName === "Physics" ? "from-blue-500 to-blue-700" :
                 subjectName === "Chemistry" ? "from-emerald-500 to-emerald-700" :
                 "from-rose-500 to-rose-700",
          chapters: []
        };
      }
      subjectsMap[subjectName].chapters.push({
        id: chapter.id,
        subjectId: chapter.subjectId,
        classId: chapter.subject.classId,
        title: chapter.name,
        desc: `Comprehensive lessons for ${chapter.name}`,
        icon: chapter.subject.icon || "Atom",
        gradient: subjectsMap[subjectName].color,
        contentCount: chapter._count
      });
    });

    // Check if authenticated user has access to this course
    let userHasAccess = false;
    if (req.user) {
      const sub = await prisma.subscription.findFirst({
        where: { userId: req.user.id, status: "ACTIVE", expiryDate: { gt: new Date() } },
      });
      if (sub && sub.courseId === course.id) userHasAccess = true;
      if (req.user.role === "ADMIN") userHasAccess = true;
    }

    return success(res, {
      ...course,
      subjects: Object.values(subjectsMap),
      planConfig: planConfig ? {
        price: planConfig.amount / 100,
        duration: planConfig.duration,
        billingCycle: planConfig.billingCycle || "yearly",
      } : null,
      userHasAccess,
    });
  } catch (e) {
    console.error("Get course by slug error:", e);
    return error(res, "Failed to fetch course content");
  }
}

// GET /api/courses/list — all courses with plan config (for courses page)
export async function getCourses(_req: Request, res: Response) {
  try {
    const cached = cacheGet("courses-list");
    if (cached) return success(res, cached);

    const courses = await prisma.course.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        _count: { select: { chapters: true } },
      },
    });

    // Get plans config for pricing/features
    const setting = await prisma.setting.findUnique({ where: { key: "plans_config" } });
    let plansConfig: Record<string, any> = {};
    if (setting) {
      plansConfig = JSON.parse(setting.value);
    }

    const featureMap: Record<string, string[]> = {
      FOUNDATION_PASS: ["Selected chapters (9-12 PCB)", "Animated concept videos", "Beginner-friendly path", "Progress tracking", "Mobile & desktop access"],
      ACADEMIC_PLUS: ["Full Class 9-10 (PCB)", "Selected 11-12 Physics & Chemistry", "Chapter notes (PDF)", "MCQ quizzes + solutions", "Performance analytics", "Email support (24hr)"],
      ELITE_LEARNING: ["Full 9-12 Physics + Chemistry + Biology", "64+ Virtual Labs", "3D Visual Learning", "Board exam practice", "Notes + formula sheets", "Priority WhatsApp support", "Deep concept tools"],
      FLEXI_PLAN: ["Choose your own subjects", "3D Animated Videos", "Chapter notes (PDF)", "MCQ quizzes", "Flexible pricing per subject"],
    };

    const result = courses.map((c) => {
      const planConfig = c.planKey ? plansConfig[c.planKey] : null;
      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        accentColor: c.accentColor,
        icon: c.icon,
        planKey: c.planKey,
        chapterCount: c._count.chapters,
        price: planConfig ? planConfig.amount / 100 : 0,
        duration: planConfig ? planConfig.duration : 365,
        billingCycle: planConfig?.billingCycle || "yearly",
        features: c.planKey ? (featureMap[c.planKey] || []) : [],
        enabled: planConfig ? planConfig.enabled : true,
      };
    });

    cacheSet("courses-list", result, 300);
    return success(res, result);
  } catch (e) {
    console.error("Get courses error:", e);
    return error(res, "Failed to fetch courses");
  }
}

export async function getSubjectPricing(_req: Request, res: Response) {
  try {
    const classes = await prisma.class.findMany({
      orderBy: { order: "asc" },
      include: {
        subjects: {
          select: { id: true, name: true, icon: true, price: true, enabled: true },
        },
      },
    });
    return success(res, classes);
  } catch (e) {
    console.error("Get subject pricing error:", e);
    return error(res, "Failed to fetch pricing information");
  }
}
