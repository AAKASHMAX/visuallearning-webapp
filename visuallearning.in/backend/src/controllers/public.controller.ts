import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { success, error } from "../utils/apiResponse";
import { cacheGet, cacheSet } from "../utils/cache";
import { animatedHasVimeo } from "./course.controller";
import { classCode, ensureChapterSlugsThrottled, subjectCode } from "../services/public-links.service";
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

/** Which document kinds each chapter has. */
function kindsByChapterOf(notes: Array<{ chapterId: string; title: string; pdfUrl: string | null }>) {
  const byChapter = new Map<string, Set<DocKind>>();
  for (const n of notes) {
    const set = byChapter.get(n.chapterId) || new Set<DocKind>();
    set.add(docKind(n.title, n.pdfUrl));
    byChapter.set(n.chapterId, set);
  }
  return byChapter;
}

/** A chapter's 3D videos, counted in the chapter's main language (most are Hinglish). */
function mainLanguageVideosOf<V extends { chapterId: string; language: string; youtubeVideoId: string | null; vimeoVideoId: string | null }>(videos: V[]) {
  const byChapter = new Map<string, V[]>();
  for (const v of videos) {
    if (!animatedHasVimeo(v)) continue;
    byChapter.set(v.chapterId, [...(byChapter.get(v.chapterId) || []), v]);
  }
  return (chapterId: string) => {
    const list = byChapter.get(chapterId) || [];
    const counts = new Map<string, number>();
    for (const v of list) counts.set(v.language, (counts.get(v.language) || 0) + 1);
    const language = [...counts.entries()].sort((a, b) => b[1] - a[1] || (a[0] === "HINDI" ? -1 : 1))[0]?.[0];
    return { language: language || null, languages: [...counts.keys()], list: list.filter((v) => v.language === language) };
  };
}

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

    const kindsByChapter = kindsByChapterOf(subjectNotes);
    const mainLanguageVideos = mainLanguageVideosOf(subjectVideos);

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

// Subjects in the order students expect them, whatever order they were created in.
const SUBJECT_ORDER = ["phy", "chem", "bio", "math"];

/**
 * Course landing page of one class (visuallearning.in/class-12), linked from YouTube descriptions.
 * No login. Every subject of the class with its chapters, which documents and how many 3D videos
 * each chapter has, and a few sample videos per subject. Names and counts only, no document content.
 */
export async function getPublicClass(req: Request, res: Response) {
  try {
    const number = String(req.params.number || "");
    if (!/^\d{1,2}$/.test(number)) return error(res, "Page not found", 404);

    const cacheKey = `public-class:${number}`;
    const cached = cacheGet(cacheKey);
    if (cached) return success(res, cached);

    // Classes that have something to show; the one asked for is among them, the rest feed the class switcher.
    const classes = (
      await prisma.class.findMany({
        where: { subjects: { some: { enabled: true, chapters: { some: {} } } } },
        orderBy: { order: "asc" },
        select: { id: true, name: true },
      })
    ).filter((c) => /^\d{1,2}$/.test(classCode(c.name)));
    const cls = classes.find((c) => classCode(c.name) === number);
    if (!cls) return error(res, "This class isn't on VisualLearning yet", 404);

    const inClass = { subject: { classId: cls.id, enabled: true } };
    const loadSubjects = () =>
      prisma.subject.findMany({
        where: { classId: cls.id, enabled: true, chapters: { some: {} } },
        select: {
          id: true,
          name: true,
          chapters: { orderBy: [{ order: "asc" }, { name: "asc" }], select: { id: true, name: true, order: true, slug: true } },
        },
      });
    let subjects = await loadSubjects();
    // A chapter created since the last run may not have its link yet.
    if (subjects.some((s) => s.chapters.some((ch) => !ch.slug)) && (await ensureChapterSlugsThrottled()) > 0) subjects = await loadSubjects();

    const [notes, videos] = await Promise.all([
      prisma.note.findMany({ where: { chapter: inClass }, select: { chapterId: true, title: true, pdfUrl: true } }),
      prisma.video.findMany({
        where: { chapter: inClass, type: "ANIMATED_VIDEO" },
        orderBy: { order: "asc" },
        select: { id: true, chapterId: true, title: true, level: true, language: true, duration: true, youtubeVideoId: true, vimeoVideoId: true },
      }),
    ]);

    const kindsByChapter = kindsByChapterOf(notes);
    const mainLanguageVideos = mainLanguageVideosOf(videos);

    const rank = (name: string) => {
      const at = SUBJECT_ORDER.indexOf(subjectCode(name));
      return at === -1 ? SUBJECT_ORDER.length : at;
    };

    const resultSubjects = subjects
      .sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name))
      .map((s) => {
        const chapters = s.chapters
          .map((ch, index) => {
            const kinds = kindsByChapter.get(ch.id) || new Set<DocKind>();
            return {
              id: ch.id,
              name: ch.name,
              order: ch.order,
              slug: ch.slug,
              // The first chapter of every subject is free, as everywhere else on the site.
              isFree: index === 0,
              notes: kinds.has("notes"),
              ncert: kinds.has("ncert"),
              pyq: kinds.has("pyq"),
              videos: mainLanguageVideos(ch.id).list.length,
            };
          })
          // Chapters with nothing in them yet (mostly ones dropped from the syllabus) stay off the page.
          .filter((ch) => ch.notes || ch.ncert || ch.pyq || ch.videos > 0);
        // A few videos to show what the lessons look like: from the first chapter that has any.
        const sampleChapter = chapters.find((ch) => ch.videos > 0);
        const sample = sampleChapter ? mainLanguageVideos(sampleChapter.id) : null;
        const count = (pick: (ch: (typeof chapters)[number]) => boolean) => chapters.filter(pick).length;
        return {
          id: s.id,
          name: s.name,
          code: subjectCode(s.name),
          chapters,
          counts: {
            chapters: chapters.length,
            notes: count((ch) => ch.notes),
            ncert: count((ch) => ch.ncert),
            pyq: count((ch) => ch.pyq),
            videos: chapters.reduce((sum, ch) => sum + ch.videos, 0),
          },
          sampleVideos:
            sampleChapter && sample
              ? {
                  chapterId: sampleChapter.id,
                  chapterName: sampleChapter.name,
                  isFree: sampleChapter.isFree,
                  language: sample.language,
                  items: [...sample.list]
                    .sort((a, b) => (a.level === b.level ? 0 : a.level === "ADVANCED" ? -1 : 1))
                    .slice(0, 4)
                    .map((v) => ({ id: v.id, title: v.title, level: v.level, duration: v.duration, vimeoId: vimeoIdOf(v) })),
                }
              : null,
        };
      })
      .filter((s) => s.chapters.length > 0);

    const total = (key: "chapters" | "notes" | "ncert" | "pyq" | "videos") => resultSubjects.reduce((sum, s) => sum + s.counts[key], 0);
    const result = {
      class: { id: cls.id, name: cls.name, number },
      classes: classes.map((c) => ({ number: classCode(c.name), name: c.name })),
      subjects: resultSubjects,
      counts: { subjects: resultSubjects.length, chapters: total("chapters"), notes: total("notes"), ncert: total("ncert"), pyq: total("pyq"), videos: total("videos") },
    };

    cacheSet(cacheKey, result, CACHE_TTL);
    return success(res, result);
  } catch (e) {
    console.error("Public class error:", e);
    return error(res, "Failed to load this page");
  }
}
