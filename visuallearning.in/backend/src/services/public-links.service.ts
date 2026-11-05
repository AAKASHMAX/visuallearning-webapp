import { prisma } from "../config/prisma";

/**
 * Short public links for YouTube descriptions: visuallearning.in/notes/12-bio-1.
 * A chapter's slug is "<class number>-<subject code>-<chapter order>", stored on the chapter the
 * first time it is generated and never changed, so published links survive renames and reorders.
 */

const SUBJECT_CODES: Array<[RegExp, string]> = [
  [/phys/i, "phy"],
  [/chem/i, "chem"],
  [/bio/i, "bio"],
  [/math/i, "math"],
];

export function subjectCode(subjectName: string) {
  for (const [pattern, code] of SUBJECT_CODES) if (pattern.test(subjectName)) return code;
  return subjectName.toLowerCase().replace(/[^a-z]/g, "").slice(0, 4) || "sub";
}

export function classCode(className: string) {
  return className.match(/\d+/)?.[0] || className.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 6) || "class";
}

export function baseChapterSlug(className: string, subjectName: string, order: number) {
  return `${classCode(className)}-${subjectCode(subjectName)}-${order}`;
}

let running: Promise<number> | null = null;
let lastRunAt = 0;

/** Gives every chapter that has no slug yet its slug. Existing slugs are never touched. */
export function ensureChapterSlugs(): Promise<number> {
  if (running) return running;
  running = (async () => {
    const missing = await prisma.chapter.findMany({
      where: { slug: null },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, order: true, subject: { select: { name: true, class: { select: { name: true } } } } },
    });
    if (missing.length === 0) return 0;

    const taken = new Set(
      (await prisma.chapter.findMany({ where: { slug: { not: null } }, select: { slug: true } })).map((c) => c.slug as string)
    );
    let assigned = 0;
    for (const chapter of missing) {
      const base = baseChapterSlug(chapter.subject.class.name, chapter.subject.name, chapter.order);
      // Two chapters with the same order in one subject: the later one gets 12-bio-1b, 12-bio-1c, ...
      let slug = base;
      for (let i = 1; taken.has(slug); i += 1) slug = `${base}${String.fromCharCode(97 + i)}`;
      try {
        const { count } = await prisma.chapter.updateMany({ where: { id: chapter.id, slug: null }, data: { slug } });
        taken.add(slug);
        assigned += count;
      } catch (e: any) {
        // Another instance took this slug at the same moment; the next run picks a free one.
        console.error(`Chapter slug ${slug} not set:`, e?.code || e?.message || e);
      }
    }
    if (assigned > 0) console.log(`Public links: gave ${assigned} chapter(s) a slug`);
    return assigned;
  })().finally(() => {
    running = null;
    lastRunAt = Date.now();
  });
  return running;
}

/** For a link that matched nothing: a chapter created since the last run may just need its slug. */
export async function ensureChapterSlugsThrottled() {
  if (Date.now() - lastRunAt < 60_000) return 0;
  return ensureChapterSlugs();
}
