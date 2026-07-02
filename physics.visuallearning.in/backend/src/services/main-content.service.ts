/**
 * Option B — serve Physics 11/12 CONTENT from the MAIN webapp database.
 *
 * The main app models content as Class -> Subject(Physics) -> Chapter ->
 * Note/Video/Question. This module reads that (read-only) and maps it into the
 * shapes this physics app's API already returns, so the frontend is unchanged.
 * IDs returned are the MAIN db's IDs.
 *
 * Users / subscriptions / plans / access-control stay in THIS app's own DB.
 * Only enabled when config.contentSource === "main" and MAIN_DATABASE_URL is set.
 */
import { PrismaClient } from "@prisma/client";
import { config } from "../config";

// A second client pointed at the main DB. We only ever run raw SELECTs on it,
// so it does not matter that the generated client's schema is this app's schema.
export const mainDb: PrismaClient | null = config.mainDatabaseUrl
  ? new PrismaClient({ datasources: { db: { url: config.mainDatabaseUrl } } })
  : null;

export function mainContentEnabled(): boolean {
  return config.contentSource === "main" && !!mainDb;
}

// ---- tiny TTL cache (content changes on main are picked up within the TTL) ----
type Entry = { data: any; exp: number };
const cache = new Map<string, Entry>();
async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.exp > Date.now()) return hit.data as T;
  const data = await fn();
  cache.set(key, { data, exp: Date.now() + ttlMs });
  return data;
}
export function clearMainContentCache() {
  cache.clear();
}

// ---- mappers: main row -> physics API shape ----
function videoUrl(v: any): string {
  // Prefer Vimeo (main's primary source); fall back to YouTube. The physics
  // player embeds both. Empty when the video has no source (placeholder row).
  if (v.vimeoVideoId) return `https://vimeo.com/${v.vimeoVideoId}`;
  if (v.youtubeVideoId) return `https://www.youtube.com/watch?v=${v.youtubeVideoId}`;
  return "";
}
function mapVideo(v: any, i: number, chapterId: string) {
  return {
    id: v.id,
    title: v.title,
    youtubeUrl: videoUrl(v),
    videoType: v.type || "ANIMATED_VIDEO",
    language: v.language || "ENGLISH",
    isFree: !!v.isFree,
    displayOrder: typeof v.order === "number" ? v.order : i,
    chapterId,
    createdAt: v.createdAt,
  };
}
function mapNote(n: any, i: number, chapterId: string) {
  return {
    id: n.id,
    title: n.title,
    fileUrl: n.pdfUrl || "", // main "pdfUrl" (image-PDF) -> physics "fileUrl"
    htmlContent: n.htmlContent ?? null,
    cssContent: n.cssContent ?? null,
    isFree: false, // main notes have no per-note free flag
    displayOrder: i,
    chapterId,
    createdAt: n.createdAt,
  };
}
function mapQuestion(q: any, i: number, chapterId: string) {
  return {
    id: q.id,
    question: q.questionText,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
    correctAnswer: q.correctOption,
    solution: q.solution ?? null,
    displayOrder: i,
    chapterId,
    createdAt: q.createdAt,
  };
}

// ---- lookups ----
// The main Subject id for "Physics" of the class matching this tier ("11"/"12").
async function physicsSubjectId(tier: string): Promise<string | null> {
  return cached(`subj:${tier}`, 10 * 60 * 1000, async () => {
    const rows: any[] = await mainDb!.$queryRawUnsafe(
      `SELECT s.id FROM "Subject" s JOIN "Class" c ON s."classId" = c.id
       WHERE s.name ILIKE '%physics%' AND c.name ILIKE $1
       ORDER BY length(c.name) ASC LIMIT 1`,
      `%${tier}%`,
    );
    return rows[0]?.id ?? null;
  });
}

/** Chapters for a tier, each with content counts, ordered — for course listings. */
export async function getTierChapters(tier: string): Promise<any[]> {
  const sid = await physicsSubjectId(tier);
  if (!sid) return [];
  return cached(`chs:${tier}`, 60 * 1000, async () => {
    const rows: any[] = await mainDb!.$queryRawUnsafe(
      `SELECT ch.id, ch.name, ch."order" AS "order",
         (SELECT count(*)::int FROM "Video"    v WHERE v."chapterId" = ch.id AND (COALESCE(v."youtubeVideoId",'') <> '' OR COALESCE(v."vimeoVideoId",'') <> '')) AS videos,
         (SELECT count(*)::int FROM "Note"     n WHERE n."chapterId" = ch.id AND n.title !~* '(ppt|presentation|slide)') AS notes,
         (SELECT count(*)::int FROM "Question" q WHERE q."chapterId" = ch.id) AS questions
       FROM "Chapter" ch WHERE ch."subjectId" = $1 ORDER BY ch."order" ASC`,
      sid,
    );
    return rows.map((r, i) => ({
      id: r.id,
      name: r.name,
      animationKey: null,
      displayOrder: typeof r.order === "number" ? r.order : i,
      _count: { videos: r.videos, notes: r.notes, questions: r.questions },
    }));
  });
}

/** Resolve a main chapter id -> { tier, isFirst } (or null if not Physics 11/12). */
export async function getChapterContext(chapterId: string): Promise<{ tier: string; isFirst: boolean } | null> {
  return cached(`ctx:${chapterId}`, 60 * 1000, async () => {
    const rows: any[] = await mainDb!.$queryRawUnsafe(
      `SELECT ch.id, ch."order" AS "order", ch."subjectId" AS "subjectId", c.name AS cls, s.name AS subj
       FROM "Chapter" ch JOIN "Subject" s ON ch."subjectId" = s.id JOIN "Class" c ON s."classId" = c.id
       WHERE ch.id = $1`,
      chapterId,
    );
    const r = rows[0];
    if (!r || !/physics/i.test(r.subj)) return null;
    const tier = /12/.test(r.cls) ? "12" : /11/.test(r.cls) ? "11" : null;
    if (!tier) return null;
    const first: any[] = await mainDb!.$queryRawUnsafe(
      `SELECT id FROM "Chapter" WHERE "subjectId" = $1 ORDER BY "order" ASC LIMIT 1`,
      r.subjectId,
    );
    return { tier, isFirst: first[0]?.id === chapterId };
  });
}

export async function getChapterNotes(chapterId: string): Promise<any[]> {
  // Exclude PPT notes — the physics app has no PPT feature (Notes/NCERT/PYQ only).
  const rows: any[] = await mainDb!.$queryRawUnsafe(
    `SELECT id, title, "pdfUrl", "htmlContent", "cssContent", "createdAt"
     FROM "Note" WHERE "chapterId" = $1 AND title !~* '(ppt|presentation|slide)'
     ORDER BY CASE WHEN title ~* 'ncert' THEN 2 WHEN title ~* '(pyq|previous year)' THEN 3 ELSE 1 END, "createdAt" ASC`,
    chapterId,
  );
  return rows.map((n, i) => mapNote(n, i, chapterId));
}

export async function getChapterVideos(chapterId: string): Promise<any[]> {
  const rows: any[] = await mainDb!.$queryRawUnsafe(
    `SELECT id, title, "youtubeVideoId", "vimeoVideoId", language, duration, "order", "isFree", type, "createdAt"
     FROM "Video" WHERE "chapterId" = $1 ORDER BY "order" ASC, "createdAt" ASC`,
    chapterId,
  );
  // Skip sourceless placeholder rows (no youtube/vimeo) so no broken players show.
  return rows.map((v, i) => mapVideo(v, i, chapterId)).filter((v) => v.youtubeUrl);
}

export async function getVideoById(id: string): Promise<{ video: any; chapterId: string } | null> {
  const rows: any[] = await mainDb!.$queryRawUnsafe(
    `SELECT id, "chapterId", title, "youtubeVideoId", "vimeoVideoId", language, duration, "order", "isFree", type, "createdAt"
     FROM "Video" WHERE id = $1`,
    id,
  );
  const v = rows[0];
  if (!v) return null;
  return { video: mapVideo(v, 0, v.chapterId), chapterId: v.chapterId };
}

export async function getChapterQuestions(chapterId: string): Promise<any[]> {
  const rows: any[] = await mainDb!.$queryRawUnsafe(
    `SELECT id, "questionText", "optionA", "optionB", "optionC", "optionD", "correctOption", solution, "createdAt"
     FROM "Question" WHERE "chapterId" = $1 ORDER BY "createdAt" ASC`,
    chapterId,
  );
  return rows.map((q, i) => mapQuestion(q, i, chapterId));
}
