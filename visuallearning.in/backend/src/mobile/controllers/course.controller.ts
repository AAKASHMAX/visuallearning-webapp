import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { mobileSuccess, mobileError } from "../utils/response";

// In-memory cache for Vimeo thumbnails. oEmbed returns the CURRENT, content-hashed
// thumbnail URL, so it reflects the latest thumbnail. Cached with a TTL so updated
// thumbnails propagate to the app (an unbounded cache never picked up changes).
const THUMB_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const vimeoThumbCache = new Map<string, { url: string; ts: number }>();

function cachedVimeoThumb(vimeoId: string): string | null {
  const hit = vimeoThumbCache.get(vimeoId);
  return hit && Date.now() - hit.ts < THUMB_TTL_MS ? hit.url : null;
}

async function getVimeoThumbnail(vimeoId: string): Promise<string> {
  const fresh = cachedVimeoThumb(vimeoId);
  if (fresh) return fresh;
  try {
    const resp = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${vimeoId}`);
    if (resp.ok) {
      const data: any = await resp.json();
      const thumb = (data.thumbnail_url || "").replace(/_\d+x\d+/, "_640x360");
      if (thumb) {
        vimeoThumbCache.set(vimeoId, { url: thumb, ts: Date.now() });
        return thumb;
      }
    }
  } catch { /* fallback below */ }
  return `https://vumbnail.com/${vimeoId}.jpg`;
}

// GET /api/category — return feature categories for home screen grid
export async function getCategory(_req: Request, res: Response) {
  try {
    // Flutter home screen uses these category names for navigation:
    // "Animation" → ClassesScreen, "video" → ClassesScreen,
    // "Notes" → NotesScreen, "Test Paper" → TestPaperScreen,
    // "Quiz" → QuizMainScreen, "Favourite Videos" → FavoriteScreen
    const categories = [
      { category_id_PK: 1, category_name: "Animation", category_icon: "", created_at: "" },
      { category_id_PK: 2, category_name: "video", category_icon: "", created_at: "" },
      { category_id_PK: 3, category_name: "Notes", category_icon: "", created_at: "" },
      { category_id_PK: 4, category_name: "Test Paper", category_icon: "", created_at: "" },
      { category_id_PK: 5, category_name: "Quiz", category_icon: "", created_at: "" },
      { category_id_PK: 6, category_name: "Favourite Videos", category_icon: "", created_at: "" },
    ];

    return res.json({
      status: true,
      message: "Success",
      Categories: categories,
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
        enabled: s.enabled,
        chapters: s.enabled ? s.chapters.map((ch) => ({
          chapter_id: ch.id,
          chapter_name: ch.name,
        })) : [],
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

    // Helper: detect if a video ID is Vimeo (purely numeric) vs YouTube (alphanumeric)
    function getEffectiveVimeoId(v: typeof videos[0]): string | null {
      if (v.vimeoVideoId) return v.vimeoVideoId;
      // Some Vimeo videos are stored in youtubeVideoId field — detect by numeric-only ID
      if (v.youtubeVideoId && /^\d{7,}$/.test(v.youtubeVideoId)) return v.youtubeVideoId;
      return null;
    }

    function getThumbUrl(v: typeof videos[0]): string {
      const vimeoId = getEffectiveVimeoId(v);
      if (vimeoId) return cachedVimeoThumb(vimeoId) || `https://vumbnail.com/${vimeoId}.jpg`;
      if (v.youtubeVideoId) return `https://img.youtube.com/vi/${v.youtubeVideoId}/hqdefault.jpg`;
      return "";
    }

    // Free preview: only the first video of the first chapter is free
    const isFirstChapter = chapter.order === 1;

    // Pair the Hindi + English versions of the same video into one entry, keyed by
    // normalized title + type. (Previously keyed by order+type, but the two
    // languages frequently have DIFFERENT order values — e.g. Hindi order=-3,
    // English order=1 — which split one video into two mismatched entries and made
    // the list differ from the website. Title is stable across languages.)
    const normTitle = (t: string) => (t || "").toLowerCase().replace(/\s+/g, " ").trim();
    const videoMap = new Map<string, any>();
    // Collect all Vimeo IDs (including misplaced ones) to fetch thumbnails in parallel
    const vimeoIds = new Set<string>();
    for (const v of videos) {
      const vid = getEffectiveVimeoId(v);
      if (vid) vimeoIds.add(vid);
    }
    // Pre-fetch all Vimeo thumbnails in parallel
    await Promise.all(Array.from(vimeoIds).map(id => getVimeoThumbnail(id)));

    for (const v of videos) {
      const effectiveVimeoId = getEffectiveVimeoId(v);
      const isVimeo = !!effectiveVimeoId;
      const groupKey = `${normTitle(v.title)}:${v.type}`;
      const canWatch = isFirstChapter || hasAccess;
      if (!videoMap.has(groupKey)) {
        const videoUrl = isVimeo ? (effectiveVimeoId || "") : (v.youtubeVideoId || "");

        videoMap.set(groupKey, {
          _sort: v.order,
          video_id_PK: v.id,
          chapter_id_FK: v.chapterId,
          video_title: v.title,
          video_url_hindi: "",
          video_url_english: "",
          video_type: isVimeo ? 3 : 2, // 2=YouTube, 3=Vimeo
          vimeo_video_id: effectiveVimeoId || null,
          content_type: v.type === "LECTURE_VIDEO" ? "lecture" : "animation",
          description: "",
          is_paid: isFirstChapter ? 2 : 1,
          is_purchase: canWatch ? 2 : 1,
          thumbnail_url: getThumbUrl(v),
          duration: v.duration || "",
          created_at: v.createdAt.toISOString(),
          updated_at: null,
          is_favourite: 0,
        });
      }
      const entry = videoMap.get(groupKey)!;
      const videoUrl = isVimeo ? (effectiveVimeoId || "") : (v.youtubeVideoId || "");
      if (v.language === "HINDI") {
        entry.video_url_hindi = canWatch ? videoUrl : "";
        // If Hindi video has a Vimeo thumbnail and entry doesn't yet, use it
        if (isVimeo && !entry.vimeo_video_id) {
          entry.vimeo_video_id = effectiveVimeoId;
          entry.thumbnail_url = getThumbUrl(v);
        }
      } else {
        entry.video_url_english = canWatch ? videoUrl : "";
        // Use English video's data as primary (incl. its order for sorting, so the
        // list matches the website's default English ordering).
        entry._sort = v.order;
        entry.video_id_PK = v.id;
        entry.video_title = v.title;
        entry.content_type = v.type === "LECTURE_VIDEO" ? "lecture" : "animation";
        entry.duration = v.duration || entry.duration;
        // Prefer Vimeo thumbnail over YouTube (Vimeo has custom thumbnails)
        if (isVimeo || !entry.vimeo_video_id) {
          entry.video_type = isVimeo ? 3 : 2;
          entry.vimeo_video_id = effectiveVimeoId || entry.vimeo_video_id;
          entry.thumbnail_url = getThumbUrl(v);
        }
      }
    }

    // Sort paired entries by the primary (English) order to match the website,
    // and strip the internal _sort key. Fallback: each video as its own entry.
    const data = videoMap.size > 0
      ? Array.from(videoMap.values())
          .sort((a: any, b: any) => (a._sort ?? 0) - (b._sort ?? 0))
          .map(({ _sort, ...rest }: any) => rest)
      : videos.map((v) => {
          const isVimeo = !!v.vimeoVideoId;
          const videoUrl = isVimeo ? (v.vimeoVideoId || "") : (v.youtubeVideoId || "");
          const thumbUrl = isVimeo
            ? (cachedVimeoThumb(v.vimeoVideoId!) || `https://vumbnail.com/${v.vimeoVideoId}.jpg`)
            : v.youtubeVideoId ? `https://img.youtube.com/vi/${v.youtubeVideoId}/hqdefault.jpg` : "";
          const canWatch = isFirstChapter || hasAccess;
          return {
            video_id_PK: v.id,
            chapter_id_FK: v.chapterId,
            video_title: v.title,
            video_url_hindi: v.language === "HINDI" && canWatch ? videoUrl : "",
            video_url_english: v.language === "ENGLISH" && canWatch ? videoUrl : "",
            video_type: isVimeo ? 3 : 2, // 2=YouTube, 3=Vimeo
            vimeo_video_id: v.vimeoVideoId || null,
            content_type: v.type === "LECTURE_VIDEO" ? "lecture" : "animation",
            description: "",
            is_paid: isFirstChapter ? 2 : 1,
            is_purchase: canWatch ? 2 : 1,
            thumbnail_url: thumbUrl,
            duration: v.duration || "",
            created_at: v.createdAt.toISOString(),
            updated_at: null,
            is_favourite: 0,
          };
        });

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
      // HTML notes (no PDF) so the app can render them in a WebView like the website.
      html_content: (n as any).htmlContent || "",
      css_content: (n as any).cssContent || "",
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
    // PYQ now comes from the chapter's "PYQ Solutions" note (the new image-PDF),
    // matching the webapp. Chapters without one return empty -> app shows
    // "Coming soon". (The old subject-wide board papers are no longer used here.)
    const notes = await prisma.note.findMany({ where: { chapterId } });
    const pyq = notes.filter((n) => /pyq|previous year/i.test(n.title) && (n.pdfUrl || "").trim() !== "");

    const data = pyq.map((n) => ({
      testpaper_id_PK: n.id,
      chapter_id_FK: chapterId,
      pdf_title: n.title,
      pdf_url: n.pdfUrl,
      is_paid: 0,
      created_at: n.createdAt.toISOString(),
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
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { subject: { include: { class: true } } },
    });
    if (!chapter) return mobileError(res, "Chapter not found", 404);

    const questionCount = await prisma.question.count({ where: { chapterId } });

    if (questionCount === 0) {
      return mobileSuccess(res, []);
    }

    // Quiz is free only for the first chapter
    const isFree = chapter.order === 1;

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

    // Create a virtual quiz entry for this chapter
    const data = [
      {
        quiz_id_PK: chapterId, // Use chapterId as quiz ID since it's 1:1
        chapter_id_FK: chapterId,
        title: `${chapter.name} - Quiz`,
        is_paid: isFree ? 2 : 1, // 1=paid, 2=free
        is_purchase: (isFree || hasAccess) ? 2 : 1, // 1=need subscription, 2=has access
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
      include: { chapter: true },
      take: 20,
      orderBy: { createdAt: "desc" },
    });

    // Pre-fetch Vimeo thumbnails
    const searchVimeoIds = videos.filter(v => v.vimeoVideoId).map(v => v.vimeoVideoId!);
    await Promise.all(searchVimeoIds.map(id => getVimeoThumbnail(id)));

    const data = videos.map((v) => {
      const isVimeo = !!v.vimeoVideoId;
      const videoUrl = isVimeo ? (v.vimeoVideoId || "") : (v.youtubeVideoId || "");
      const thumbUrl = isVimeo
        ? (cachedVimeoThumb(v.vimeoVideoId!) || `https://vumbnail.com/${v.vimeoVideoId}.jpg`)
        : v.youtubeVideoId ? `https://img.youtube.com/vi/${v.youtubeVideoId}/hqdefault.jpg` : "";
      const isFirstChapter = v.chapter.order === 1;
      return {
        video_id_PK: v.id,
        chapter_id_FK: v.chapterId,
        video_title: v.title,
        video_url_hindi: "",
        video_url_english: videoUrl,
        video_type: isVimeo ? 3 : 2,
        vimeo_video_id: v.vimeoVideoId || null,
        content_type: v.type === "LECTURE_VIDEO" ? "lecture" : "animation",
        description: "",
        is_paid: isFirstChapter ? 2 : 1,
        is_purchase: 1,
        thumbnail_url: thumbUrl,
        duration: v.duration || "",
        created_at: v.createdAt.toISOString(),
        updated_at: null,
        is_favourite: 0,
      };
    });

    return mobileSuccess(res, data);
  } catch (e) {
    console.error("Mobile searchVideos error:", e);
    return mobileError(res, "Failed to search videos");
  }
}

// GET /api/organization — contact info from the admin-editable contact_info
// setting (same source the website uses), with sensible fallbacks.
export async function getOrganization(_req: Request, res: Response) {
  let info: any = {};
  try {
    const setting = await prisma.setting.findUnique({ where: { key: "contact_info" } });
    if (setting) info = JSON.parse(setting.value);
  } catch {
    info = {};
  }
  // Return the exact keys the mobile parses (organization_name, business_hours, etc.),
  // with the real company details as fallbacks so phone/address are never blank.
  return mobileSuccess(res, {
    organization_id_PK: 1,
    organization_name: info.companyName || "VISUALLEARNING AI PRIVATE LIMITED",
    address: info.address || "4th floor, Balaji Business Center, Pune-Mumbai Highway, NH 4, next to Hotel Spice Court, Baner, Pune, Maharashtra 411045",
    phone: info.phone || "9718154204",
    email: info.email || "visuallearning247@gmail.com",
    business_hours: info.businessHours || "Mon - Sat, 9:00 AM - 7:00 PM",
    website: "https://visuallearning.in",
    created_at: new Date().toISOString(),
  });
}
