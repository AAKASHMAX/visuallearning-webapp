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
    } else if (contentType === "quiz" || contentType === "question_bank") {
      chapterWhere.questions = { some: {} };
    }

    const chapters = await prisma.chapter.findMany({
      where: chapterWhere,
      orderBy: [{ order: "asc" }, { name: "asc" }],
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
    } else if (contentType === "quiz" || contentType === "question_bank") {
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
async function checkClassAccess(userId: string, classId: string, subjectId?: string, chapterId?: string): Promise<{ hasAccess: boolean; subscription: any }> {
  const cacheKey = `access:${userId}:${classId}:${subjectId ?? ""}:${chapterId ?? ""}`;
  const cached = cacheGet<{ hasAccess: boolean; subscription: any }>(cacheKey);
  if (cached) return cached;

  const activeSubscriptions = await prisma.subscription.findMany({
    where: { userId, status: "ACTIVE", expiryDate: { gt: new Date() } },
  });

  if (activeSubscriptions.length === 0) {
    const result = { hasAccess: false, subscription: null };
    cacheSet(cacheKey, result, 60);
    return result;
  }

  // Check each active subscription for access
  for (const sub of activeSubscriptions) {
    const subjectsAccess = sub.subjectsAccess as string[];
    const classesAccess = sub.classesAccess as string[];

    let hasAccess = false;

    if (subjectsAccess.length > 0) {
      hasAccess = subjectId ? subjectsAccess.includes(subjectId) : classesAccess.includes(classId);
    } else if (sub.courseId && chapterId) {
      const courseChapter = await prisma.courseChapter.findUnique({
        where: { courseId_chapterId: { courseId: sub.courseId, chapterId } },
      });
      hasAccess = !!courseChapter;
    } else if (sub.courseId) {
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
      hasAccess = classesAccess.length === 0 || classesAccess.includes(classId);
    }

    if (hasAccess) {
      const result = { hasAccess: true, subscription: sub };
      cacheSet(cacheKey, result, 60);
      return result;
    }
  }

  const result = { hasAccess: false, subscription: null };
  cacheSet(cacheKey, result, 60);
  return result;
}

// Only this chapter (the public demo chapter) is viewable without a subscription.
// Every other chapter — including each subject's first chapter — is gated.
const DEMO_CHAPTER_ID = "cmmos51yc0001uuz8ecig0bew";

async function isFirstChapterForSubject(chapterId: string, subjectId: string) {
  const firstChapter = await prisma.chapter.findFirst({
    where: { subjectId },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: { id: true },
  });

  return firstChapter?.id === chapterId;
}

export async function getVideos(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const language = (req.query.language as string) || "ENGLISH";
    const type = req.query.type as string | undefined;

    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: { subject: { include: { class: true } } },
    });
    if (!chapter) return error(res, "Chapter not found", 404);

    const chapterVideos = await prisma.video.findMany({
      where: { chapterId: id, ...(type ? { type } : {}) },
      orderBy: { order: "asc" },
    });
    const allChapterVideos = chapterVideos.filter((v) => !!(v.youtubeVideoId || v.vimeoVideoId));

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

    const isDemoChapter = chapter.id === DEMO_CHAPTER_ID;
    const isAdmin = req.user?.role === "ADMIN";
    let hasAccess = false;
    if (isAdmin) {
      hasAccess = true;
    } else if (isDemoChapter) {
      hasAccess = true;
    } else if (req.user) {
      const classId = chapter.subject.class.id;
      const result = await checkClassAccess(req.user.id, classId, chapter.subject.id, chapter.id);
      hasAccess = result.hasAccess;
    }

    const videosWithAccess = videos.map((v) => {
      const canWatch = hasAccess;
      const exists = !!(v.youtubeVideoId || v.vimeoVideoId);
      return {
        ...v,
        // Don't leak the video IDs to non-subscribers — only expose them when unlocked.
        youtubeVideoId: canWatch ? v.youtubeVideoId : null,
        vimeoVideoId: canWatch ? v.vimeoVideoId : null,
        hasVideo: exists,
        locked: !canWatch,
        isFree: false,
      };
    });

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

    const isDemoChapter = video.chapter.id === DEMO_CHAPTER_ID;

    if (!isDemoChapter) {
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

    const isDemoChapter = chapter.id === DEMO_CHAPTER_ID;
    const isAdmin = req.user?.role === "ADMIN";
    let hasAccess = false;
    let canDownload = false;
    if (isAdmin) {
      hasAccess = true;
      canDownload = true;
    } else if (req.user) {
      const result = await checkClassAccess(req.user.id, chapter.subject.class.id, chapter.subject.id, chapter.id);
      hasAccess = result.hasAccess;
      canDownload = result.hasAccess;
    }
    if (!hasAccess && isDemoChapter) {
      hasAccess = true;
    }

    const notesWithAccess = notes.map((n) => {
      const canView = hasAccess;
      return {
        ...n,
        pdfUrl: canView ? n.pdfUrl : null,
        htmlContent: canView ? n.htmlContent : null,
        cssContent: canView ? n.cssContent : null,
        locked: !canView,
      };
    });

    return success(res, { notes: notesWithAccess, hasAccess, canDownload, chapter: { name: chapter.name } });
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

    const isDemoChapter = chapter.id === DEMO_CHAPTER_ID;
    const isAdmin = req.user?.role === "ADMIN";
    let hasAccess = false;
    if (isAdmin) {
      hasAccess = true;
    } else if (isDemoChapter) {
      hasAccess = true;
    } else if (req.user) {
      const result = await checkClassAccess(req.user.id, chapter.subject.class.id, chapter.subject.id, chapter.id);
      hasAccess = result.hasAccess;
    }

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

    const grouped: Record<number, any[]> = {};
    const years = [...new Set(papers.map((p) => p.year))].sort((a, b) => b - a);

    papers.forEach((p) => {
      if (!grouped[p.year]) grouped[p.year] = [];
      const canView = hasAccess; // gated: only subscribers (demo chapter is the public preview)
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

    let planConfig: any = null;
    if (course.planKey) {
      const setting = await prisma.setting.findUnique({ where: { key: "plans_config" } });
      if (setting) {
        const plans = JSON.parse(setting.value);
        const config = plans[course.planKey] || null;
        if (config) {
          planConfig = {
            monthlyPrice: ((config.monthlyAmount !== undefined ? config.monthlyAmount : (config.amount || 0) / 10) / 100),
            yearlyPrice: ((config.yearlyAmount !== undefined ? config.yearlyAmount : (config.amount || 0)) / 100),
            durationMonthly: config.durationMonthly !== undefined ? config.durationMonthly : 30,
            durationYearly: config.durationYearly !== undefined ? config.durationYearly : (config.duration || 365),
          };
        }
      }
    }

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

    let userHasAccess = false;
    if (req.user) {
      const isAdmin = req.user.role === "ADMIN";
      if (isAdmin) {
        userHasAccess = true;
      } else {
        const activeSubs = await prisma.subscription.findMany({
          where: { userId: req.user.id, status: "ACTIVE", expiryDate: { gt: new Date() } },
        });
        
        for (const sub of activeSubs) {
          if (sub.courseId === course.id) {
            userHasAccess = true;
            break;
          }
        }
      }
    }

    return success(res, {
      ...course,
      subjects: Object.values(subjectsMap),
      planConfig,
      userHasAccess,
    });
  } catch (e) {
    console.error("Get course by slug error:", e);
    return error(res, "Failed to fetch course content");
  }
}

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

    const setting = await prisma.setting.findUnique({ where: { key: "plans_config" } });
    let plansConfig: Record<string, any> = {};
    if (setting) {
      plansConfig = JSON.parse(setting.value);
    }

    const featureMap: Record<string, string[]> = {
      FOUNDATION_PASS: ["Selected chapters (9-12 PCB)", "Animated concept videos", "Beginner-friendly path", "Progress tracking", "Mobile & desktop access"],
      ACADEMIC_PLUS: ["Full Class 9-10 (PCB)", "Selected 11-12 Physics & Chemistry", "Chapter notes (PDF)", "MCQ quizzes + solutions", "Performance analytics", "Email support (24hr)"],
      ELITE_LEARNING: ["Full 9-12 Physics + Chemistry + Biology", "64+ Virtual Labs", "3D Visual Learning", "Board exam practice", "Notes + formula sheets", "Priority WhatsApp support", "Deep concept tools"],
      CLASS_9: ["Full 9th Grade Curriculum", "3D Animated Videos", "Virtual Labs & Simulations", "Board exam prep", "Chapter notes", "Expert support"],
      CLASS_10: ["Full 10th Grade Curriculum", "3D Animated Videos", "Virtual Labs & Simulations", "Board exam prep", "Chapter notes", "Expert support"],
      CLASS_11: ["Full 11th Grade Curriculum", "Advanced 3D Visuals", "Complex Simulations", "Competitive exam base", "Formula sheets", "Priority support"],
      CLASS_12: ["Full 12th Grade Curriculum", "Advanced 3D Visuals", "Complex Simulations", "Board & Competitive prep", "Formula sheets", "Priority support"],
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
        monthlyPrice: planConfig ? ((planConfig.monthlyAmount !== undefined ? planConfig.monthlyAmount : (planConfig.amount || 0) / 10) / 100) : 0,
        yearlyPrice: planConfig ? ((planConfig.yearlyAmount !== undefined ? planConfig.yearlyAmount : (planConfig.amount || 0)) / 100) : 0,
        durationMonthly: planConfig ? (planConfig.durationMonthly !== undefined ? planConfig.durationMonthly : 30) : 30,
        durationYearly: planConfig ? (planConfig.durationYearly !== undefined ? planConfig.durationYearly : (planConfig.duration || 365)) : 365,
        features: c.planKey ? (featureMap[c.planKey] || []) : [],
        enabled: planConfig ? planConfig.enabled : true,
      };
    });

    cacheSet("courses-list", result, 60); // Reduced to 60s for faster updates
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
