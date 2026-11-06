import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { success, error } from "../utils/apiResponse";
import { cacheGet, cacheSet } from "../utils/cache";
import { animatedHasVimeo } from "./course.controller";
import { ensureChapterSlugsThrottled } from "../services/public-links.service";
import { DocKind, docKind } from "../utils/doc-kind";

/**
 * Public document pages linked from YouTube descriptions (visuallearning.in/notes/12-bio-1).
 * No login: the linked Notes / NCERT / PYQ document of that chapter is returned in full. Everything
 * else (the chapter's other documents, other chapters, videos) is returned as titles and counts
 * only, so the page can invite the visitor to sign up for the rest.
 */

const PUBLIC_KINDS = ["notes", "ncert", "pyq"] as const;
type PublicKind = (typeof PUBLIC_KINDS)[number];

function vimeoIdOf(v: { youtubeVideoId: string | null; vimeoVideoId: string | null }) {
  const vm = (v.vimeoVideoId || "").trim();
  if (vm) return vm;
  const yt = (v.youtubeVideoId || "").trim();
  return /^\d{7,}$/.test(yt) ? yt : null;
}

const CACHE_TTL = 300;

function findChapter(slug: string) {
  return prisma.chapter.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      order: true,
      slug: true,
      subject: { select: { id: true, name: true, enabled: true, class: { select: { id: true, name: true } } } },
    },
  });
}

export async function getPublicDoc(req: Request, res: Response) {
  try {
    const kind = String(req.params.kind || "").toLowerCase() as PublicKind;
    const slug = String(req.params.slug || "").toLowerCase();
    if (!PUBLIC_KINDS.includes(kind) || !/^[a-z0-9-]{3,40}$/.test(slug)) return error(res, "Page not found", 404);

    const cacheKey = `public-doc:${kind}:${slug}`;
    const cached = cacheGet(cacheKey);
    if (cached) return success(res, cached);

    let chapter = await findChapter(slug);
    if (!chapter && (await ensureChapterSlugsThrottled()) > 0) chapter = await findChapter(slug);
    if (!chapter || !chapter.subject.enabled) return error(res, "This link doesn't match a chapter", 404);
    const subjectId = chapter.subject.id;

    const [subjectChapters, subjectNotes, subjectVideos] = await Promise.all([
      prisma.chapter.findMany({
        where: { subjectId },
        orderBy: [{ order: "asc" }, { name: "asc" }],
        select: { id: true, name: true, order: true, slug: true },
      }),
      prisma.note.findMany({ where: { chapter: { subjectId } }, select: { id: true, chapterId: true, title: true, pdfUrl: true } }),
      prisma.video.findMany({
        where: { chapter: { subjectId }, type: "ANIMATED_VIDEO" },
        orderBy: { order: "asc" },
        select: { id: true, chapterId: true, title: true, level: true, language: true, duration: true, youtubeVideoId: true, vimeoVideoId: true },
      }),
    ]);

    // Which document kinds each chapter has.
    const kindsByChapter = new Map<string, Set<DocKind>>();
    for (const n of subjectNotes) {
      const set = kindsByChapter.get(n.chapterId) || new Set<DocKind>();
      set.add(docKind(n.title, n.pdfUrl));
      kindsByChapter.set(n.chapterId, set);
    }

    // 3D videos per chapter, counted in the chapter's main language (most are Hinglish).
    const videosByChapter = new Map<string, typeof subjectVideos>();
    for (const v of subjectVideos) {
      if (!animatedHasVimeo(v)) continue;
      videosByChapter.set(v.chapterId, [...(videosByChapter.get(v.chapterId) || []), v]);
    }
    const mainLanguageVideos = (chapterId: string) => {
      const list = videosByChapter.get(chapterId) || [];
      const counts = new Map<string, number>();
      for (const v of list) counts.set(v.language, (counts.get(v.language) || 0) + 1);
      const language = [...counts.entries()].sort((a, b) => b[1] - a[1] || (a[0] === "HINDI" ? -1 : 1))[0]?.[0];
      return { language: language || null, languages: [...counts.keys()], list: list.filter((v) => v.language === language) };
    };

    // The linked document itself, with its content.
    const docMeta = subjectNotes.find((n) => n.chapterId === chapter!.id && docKind(n.title, n.pdfUrl) === kind);
    const doc = docMeta
      ? await prisma.note.findUnique({
          where: { id: docMeta.id },
          select: { id: true, title: true, pdfUrl: true, htmlContent: true, cssContent: true, download: { select: { noteId: true } } },
        })
      : null;

    const chapterVideos = mainLanguageVideos(chapter.id);
    const ordered = [...chapterVideos.list].sort((a, b) => (a.level === b.level ? 0 : a.level === "ADVANCED" ? -1 : 1));
    const isFreeChapter = subjectChapters[0]?.id === chapter.id;
    const kinds = kindsByChapter.get(chapter.id) || new Set<DocKind>();

    const result = {
      kind,
      slug: chapter.slug,
      doc: doc
        ? {
            id: doc.id,
            title: doc.title,
            htmlContent: doc.htmlContent || null,
            cssContent: doc.htmlContent ? doc.cssContent || null : null,
            pdfUrl: doc.htmlContent ? null : doc.pdfUrl || null,
            // A downloadable PDF exists (the download itself needs sign-in; see course.controller).
            hasPdf: !!doc.download,
          }
        : null,
      chapter: { id: chapter.id, name: chapter.name, order: chapter.order, slug: chapter.slug, isFree: isFreeChapter },
      subject: { id: subjectId, name: chapter.subject.name },
      class: chapter.subject.class,
      available: { notes: kinds.has("notes"), ncert: kinds.has("ncert"), pyq: kinds.has("pyq") },
      videos: {
        total: chapterVideos.list.length,
        advanced: chapterVideos.list.filter((v) => v.level === "ADVANCED").length,
        basic: chapterVideos.list.filter((v) => v.level !== "ADVANCED").length,
        language: chapterVideos.language,
        languages: chapterVideos.languages,
        items: ordered.slice(0, 6).map((v) => ({ id: v.id, title: v.title, level: v.level, duration: v.duration, vimeoId: vimeoIdOf(v) })),
      },
      chapters: subjectChapters.map((ch) => {
        const k = kindsByChapter.get(ch.id) || new Set<DocKind>();
        return {
          id: ch.id,
          name: ch.name,
          order: ch.order,
          slug: ch.slug,
          notes: k.has("notes"),
          ncert: k.has("ncert"),
          pyq: k.has("pyq"),
          videos: mainLanguageVideos(ch.id).list.length,
        };
      }),
    };

    cacheSet(cacheKey, result, CACHE_TTL);
    return success(res, result);
  } catch (e) {
    console.error("Public doc error:", e);
    return error(res, "Failed to load this page");
  }
}
