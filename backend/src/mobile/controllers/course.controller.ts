import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { mobileSuccess, mobileError } from "../utils/response";

// GET /api/category — return category list with banner images
export async function getCategory(_req: Request, res: Response) {
  try {
    // Flutter model expects { status, message, Categories: [...], BannerImages: [...] }
    return res.json({
      status: true,
      message: "Success",
      Categories: [
        { category_id_PK: 1, category_name: "CBSE", category_icon: "", created_at: "2024-01-01T00:00:00.000Z", updated_at: null },
      ],
      BannerImages: [],
    });
  } catch (e) {
    console.error("Mobile getCategory error:", e);
    return mobileError(res, "Failed to fetch categories");
  }
}

// GET /api/class — list all classes
export async function getClassList(_req: Request, res: Response) {
  try {
    const classes = await prisma.class.findMany({ orderBy: { order: "asc" } });
    const data = classes.map((c) => ({
      class_id_PK: c.id,
      class_name: c.name,
      class_icon: "",
      category_id_FK: "cbse",
      created_at: "",
      updated_at: null,
    }));
    return mobileSuccess(res, data);
  } catch (e) {
    console.error("Mobile getClassList error:", e);
    return mobileError(res, "Failed to fetch classes");
  }
}

// GET /api/class/class-detail/:id — class with subjects and chapters
export async function getClassDetail(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const classData = await prisma.class.findUnique({ where: { id } });
    if (!classData) return mobileError(res, "Class not found", 404);

    const subjects = await prisma.subject.findMany({
      where: { classId: id },
      include: {
        chapters: { orderBy: { order: "asc" } },
      },
    });

    const data = {
      class_name: classData.name,
      subjects: subjects.map((s) => ({
        subject_id: s.id,
        subject_name: s.name,
        chapters: s.chapters.map((ch) => ({
          chapter_id: ch.id,
          chapter_name: ch.name,
        })),
      })),
    };

    return mobileSuccess(res, data);
  } catch (e) {
    console.error("Mobile getClassDetail error:", e);
    return mobileError(res, "Failed to fetch class detail");
  }
}

// GET /api/video/video-list/:chapterId — videos for a chapter
export async function getVideoList(req: Request, res: Response) {
  try {
    const chapterId = req.params.id || req.params.chapterId;

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { subject: { include: { class: true } } },
    });
    if (!chapter) return mobileError(res, "Chapter not found", 404);

    const videos = await prisma.video.findMany({
      where: { chapterId },
      orderBy: { order: "asc" },
    });

    // Check subscription access
    let hasAccess = false;
    if (req.user) {
      if (req.user.role === "ADMIN") {
        hasAccess = true;
      } else {
        const sub = await prisma.subscription.findFirst({
          where: { userId: req.user.id, status: "ACTIVE", expiryDate: { gt: new Date() } },
        });
        if (sub) {
          hasAccess = sub.classesAccess.length === 0 || sub.classesAccess.includes(chapter.subject.class.id);
        }
      }
    }

    // Group videos by language to create hindi/english pairs
    const videoMap = new Map<number, any>();
    for (const v of videos) {
      if (!videoMap.has(v.order)) {
        videoMap.set(v.order, {
          video_id_PK: v.id,
          chapter_id_FK: v.chapterId,
          video_title: v.title,
          video_url_hindi: "",
          video_url_english: "",
          video_type: v.type === "LECTURE_VIDEO" ? 2 : 1,
          description: "",
          is_paid: v.isFree ? 0 : 1,
          is_purchase: (v.isFree || hasAccess) ? 1 : 0,
          thumbnail_url: v.youtubeVideoId ? `https://img.youtube.com/vi/${v.youtubeVideoId}/hqdefault.jpg` : "",
          duration: v.duration || "",
          created_at: v.createdAt.toISOString(),
          updated_at: null,
          is_favourite: 0,
        });
      }
      const entry = videoMap.get(v.order)!;
      if (v.language === "HINDI") {
        entry.video_url_hindi = (v.isFree || hasAccess) ? v.youtubeVideoId : "";
      } else {
        entry.video_url_english = (v.isFree || hasAccess) ? v.youtubeVideoId : "";
        // Use English video's data as primary
        entry.video_id_PK = v.id;
        entry.video_title = v.title;
        entry.thumbnail_url = v.youtubeVideoId ? `https://img.youtube.com/vi/${v.youtubeVideoId}/hqdefault.jpg` : entry.thumbnail_url;
        entry.duration = v.duration || entry.duration;
      }
    }

    // If videos aren't paired by order, fallback: each video as its own entry
    const data = videoMap.size > 0
      ? Array.from(videoMap.values())
      : videos.map((v) => ({
          video_id_PK: v.id,
          chapter_id_FK: v.chapterId,
          video_title: v.title,
          video_url_hindi: v.language === "HINDI" && (v.isFree || hasAccess) ? v.youtubeVideoId : "",
          video_url_english: v.language === "ENGLISH" && (v.isFree || hasAccess) ? v.youtubeVideoId : "",
          video_type: v.type === "LECTURE_VIDEO" ? 2 : 1,
          description: "",
          is_paid: v.isFree ? 0 : 1,
          is_purchase: (v.isFree || hasAccess) ? 1 : 0,
          thumbnail_url: v.youtubeVideoId ? `https://img.youtube.com/vi/${v.youtubeVideoId}/hqdefault.jpg` : "",
          duration: v.duration || "",
          created_at: v.createdAt.toISOString(),
          updated_at: null,
          is_favourite: 0,
        }));

    return mobileSuccess(res, data);
  } catch (e) {
    console.error("Mobile getVideoList error:", e);
    return mobileError(res, "Failed to fetch videos");
  }
}

// GET /api/notes-pdf/:chapterId — notes for a chapter
export async function getNotesPdf(req: Request, res: Response) {
  try {
    const chapterId = req.params.id;
    const notes = await prisma.note.findMany({ where: { chapterId } });

    const data = notes.map((n) => ({
      note_id_PK: n.id,
      chapter_id_FK: n.chapterId,
      pdf_title: n.title,
      pdf_url: n.pdfUrl,
      is_paid: 0, // Notes don't have isFree flag in our DB, serve all
      created_at: n.createdAt.toISOString(),
      updated_at: null,
    }));

    return mobileSuccess(res, data);
  } catch (e) {
    console.error("Mobile getNotesPdf error:", e);
    return mobileError(res, "Failed to fetch notes");
  }
}

// GET /api/test-paper/:chapterId — board papers mapped as test papers
// Since our DB has board papers per subject (not per chapter), we find the subject from chapter
// and return board papers for that subject
export async function getTestPaper(req: Request, res: Response) {
  try {
    const chapterId = req.params.id;
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { subject: true },
    });
    if (!chapter) return mobileError(res, "Chapter not found", 404);

    const papers = await prisma.boardPaper.findMany({
      where: { subjectId: chapter.subjectId },
      orderBy: [{ year: "desc" }, { order: "asc" }],
    });

    const data = papers.map((p) => ({
      testpaper_id_PK: p.id,
      chapter_id_FK: chapterId,
      pdf_title: `${p.title} (${p.year})`,
      pdf_url: p.pdfUrl,
      is_paid: 0,
      created_at: p.createdAt.toISOString(),
      updated_at: null,
    }));

    return mobileSuccess(res, data);
  } catch (e) {
    console.error("Mobile getTestPaper error:", e);
    return mobileError(res, "Failed to fetch test papers");
  }
}

// GET /api/quiz/:chapterId — quiz list for a chapter
// Our DB has questions directly under chapters (no quiz grouping)
// So we create a virtual "quiz" per chapter
export async function getQuizList(req: Request, res: Response) {
  try {
    const chapterId = req.params.id;
    const chapter = await prisma.chapter.findUnique({ where: { id: chapterId } });
    if (!chapter) return mobileError(res, "Chapter not found", 404);

    const questionCount = await prisma.question.count({ where: { chapterId } });

    if (questionCount === 0) {
      return mobileSuccess(res, []);
    }

    // Create a virtual quiz entry for this chapter
    const data = [
      {
        quiz_id_PK: chapterId, // Use chapterId as quiz ID since it's 1:1
        chapter_id_FK: chapterId,
        title: `${chapter.name} - Quiz`,
        is_paid: 0,
        question_count: questionCount,
        created_at: "",
        updated_at: null,
      },
    ];

    return mobileSuccess(res, data);
  } catch (e) {
    console.error("Mobile getQuizList error:", e);
    return mobileError(res, "Failed to fetch quizzes");
  }
}

// GET /api/quiz/quiz-detail/:quizId — questions for a quiz (quizId = chapterId)
export async function getQuizDetail(req: Request, res: Response) {
  try {
    const chapterId = req.params.id; // quizId is actually chapterId
    const questions = await prisma.question.findMany({
      where: { chapterId },
      orderBy: { createdAt: "asc" },
    });

    const data = questions.map((q, index) => {
      // correctOption is stored as "A", "B", "C", or "D"
      const correctMap: Record<string, number> = { A: 1, B: 2, C: 3, D: 4 };
      return {
        quiz_id_PK: q.id,
        quiz_id_FK: chapterId,
        chapter_id_FK: q.chapterId,
        question_no: index + 1,
        question: q.questionText,
        option_a: q.optionA,
        option_b: q.optionB,
        option_c: q.optionC,
        option_d: q.optionD,
        right_answer: correctMap[q.correctOption.toUpperCase()] || 1,
        explanation: q.solution || "",
      };
    });

    return mobileSuccess(res, data);
  } catch (e) {
    console.error("Mobile getQuizDetail error:", e);
    return mobileError(res, "Failed to fetch quiz detail");
  }
}

// POST /api/video/search — search videos
export async function searchVideos(req: Request, res: Response) {
  try {
    const { query, search } = req.body;
    const searchTerm = query || search || "";
    if (!searchTerm) return mobileSuccess(res, []);

    const videos = await prisma.video.findMany({
      where: {
        title: { contains: searchTerm, mode: "insensitive" },
      },
      take: 20,
      orderBy: { createdAt: "desc" },
    });

    const data = videos.map((v) => ({
      video_id_PK: v.id,
      chapter_id_FK: v.chapterId,
      video_title: v.title,
      video_url_hindi: "",
      video_url_english: v.youtubeVideoId,
      video_type: v.type === "LECTURE_VIDEO" ? 2 : 1,
      description: "",
      is_paid: v.isFree ? 0 : 1,
      is_purchase: 0,
      thumbnail_url: v.youtubeVideoId ? `https://img.youtube.com/vi/${v.youtubeVideoId}/hqdefault.jpg` : "",
      duration: v.duration || "",
      created_at: v.createdAt.toISOString(),
      updated_at: null,
      is_favourite: 0,
    }));

    return mobileSuccess(res, data);
  } catch (e) {
    console.error("Mobile searchVideos error:", e);
    return mobileError(res, "Failed to search videos");
  }
}

// GET /api/organization — static org info
export async function getOrganization(_req: Request, res: Response) {
  return mobileSuccess(res, {
    name: "Visual Learning",
    email: "visuallearning247@gmail.com",
    phone: "",
    website: "https://visuallearning.in",
    address: "",
  });
}
