/**
 * Import locally-built content (local-content.json from build-local-content.ts)
 * into the MAIN app DB. Chapters are found via Subject(Physics) -> Class(tier).
 *
 * - Fuzzy token chapter match (plural/abbrev/typo tolerant); OVERRIDES below.
 * - One note per (chapter, type): notes / ncert / pyq by title signal.
 * - GAP-FILL by default (skip if that note already has htmlContent); FORCE=1 to
 *   overwrite. DRY=1 previews with no writes.
 *
 * Run: DATABASE_URL="<main-prod>" npx tsx import-local-content-main.ts
 *      DRY=1 ... / FORCE=1 ...
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();
const DRY = process.env.DRY === "1";
const FORCE = process.env.FORCE === "1";

type Item = { tier: string; type: "notes" | "ncert" | "pyq"; folderName: string; chapterName: string; htmlContent: string; cssContent: string | null };

const OVERRIDES: Record<string, string> = {
  "7.Electronmanetic induction": "Electromagnetic Induction",
  "9.Heredity and Evolution": "Heredity", // main Class-10 Biology chapter is just "Heredity"
};

const STOP = new Set(["and", "the", "of", "in", "a", "to", "&", "with"]);
const tokens = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").split(" ").filter((t) => t && !STOP.has(t));
const tokMatch = (a: string, b: string) => a === b || (a.length >= 4 && b.length >= 4 && (a.startsWith(b) || b.startsWith(a)));

function bestChapter(name: string, chapters: { id: string; name: string }[]) {
  const at = tokens(name);
  let best: { ch: { id: string; name: string }; inter: number; score: number } | null = null;
  for (const ch of chapters) {
    const bt = tokens(ch.name);
    let inter = 0;
    for (const x of at) if (bt.some((y) => tokMatch(x, y))) inter++;
    const score = inter / Math.max(at.length, 1);
    if (!best || inter > best.inter || (inter === best.inter && score > best.score)) best = { ch, inter, score };
  }
  if (best && (best.inter >= 2 || (best.inter >= 1 && best.inter === at.length))) return best.ch;
  return null;
}

const titleFor = (type: Item["type"], name: string) =>
  type === "ncert" ? "NCERT Questions & Solutions" : type === "pyq" ? `${name} - PYQ Solutions` : `${name} - Notes`;

function matchExisting(notes: { id: string; title: string; htmlContent: string | null }[], type: Item["type"]) {
  const t = (s: string) => s.toLowerCase();
  if (type === "ncert") return notes.find((n) => t(n.title).includes("ncert"));
  if (type === "pyq") return notes.find((n) => t(n.title).includes("pyq") || t(n.title).includes("previous year"));
  return notes.find((n) => !/ncert|pyq|previous year|ppt|presentation|important/.test(t(n.title)));
}

(async () => {
  const host = (process.env.DATABASE_URL || "").replace(/.*@/, "").replace(/\/.*/, "");
  console.log(`Writing to: ${host}${DRY ? "  (DRY RUN)" : ""}${FORCE ? "  (FORCE)" : "  (gap-fill)"}`);

  const { items }: { items: Item[] } = JSON.parse(fs.readFileSync(__dirname + "/local-content.json", "utf-8"));

  // Main chapters per tier: ALL subjects (Physics/Chemistry/Biology), class name contains the tier number.
  const chaptersByTier: Record<string, { id: string; name: string; subject: string }[]> = {};
  for (const tier of new Set(items.map((i) => i.tier))) {
    const re = new RegExp(`(^|[^0-9])${tier}([^0-9]|$)`);
    const chapters = await prisma.chapter.findMany({
      where: { subject: { class: { name: { contains: tier } } } },
      select: { id: true, name: true, subject: { select: { name: true, class: { select: { name: true } } } } },
    });
    chaptersByTier[tier] = chapters.filter((c) => re.test(c.subject.class.name)).map((c) => ({ id: c.id, name: c.name, subject: c.subject.name }));
    console.log(`  tier ${tier}: ${chaptersByTier[tier].length} chapters across all subjects`);
  }

  let created = 0, updated = 0, skipped = 0;
  const unmatched: string[] = [];

  for (const it of items) {
    if (!it.htmlContent || it.htmlContent.replace(/<[^>]*>/g, "").trim().length < 40) continue;
    const chapters = chaptersByTier[it.tier] || [];
    let target = OVERRIDES[it.folderName] ? chapters.find((c) => c.name.toLowerCase() === OVERRIDES[it.folderName].toLowerCase()) : undefined;
    if (!target) target = bestChapter(it.chapterName, chapters) || undefined;
    if (!target) { unmatched.push(`tier ${it.tier} / "${it.chapterName}"`); console.log(`[NO MATCH] tier ${it.tier} "${it.chapterName}"`); continue; }

    const existing = await prisma.note.findMany({ where: { chapterId: target.id }, select: { id: true, title: true, htmlContent: true } });
    const hit = matchExisting(existing, it.type);
    const title = titleFor(it.type, target.name);
    const tag = `tier ${it.tier} "${it.chapterName}" → [${(target as any).subject}/${target.name}] ${it.type}`;

    if (hit && hit.htmlContent && !FORCE) { skipped++; console.log(`  ~ SKIP (has content) ${tag}  ["${hit.title}"]`); continue; }
    if (hit) {
      // Clear pdfUrl so the new HTML replaces any old PDF note for this chapter.
      if (!DRY) await prisma.note.update({ where: { id: hit.id }, data: { title, htmlContent: it.htmlContent, cssContent: it.cssContent, pdfUrl: "" } });
      updated++; console.log(`  * UPDATE ${tag} → "${title}"${hit.htmlContent ? "" : "  (was PDF)"}`);
    } else {
      if (!DRY) await prisma.note.create({ data: { chapterId: target.id, title, pdfUrl: "", htmlContent: it.htmlContent, cssContent: it.cssContent } });
      created++; console.log(`  + CREATE ${tag} → "${title}"`);
    }
  }

  console.log(`\n=== Done${DRY ? " (DRY RUN)" : ""} ===  Created: ${created}, Updated: ${updated}, Skipped: ${skipped}`);
  if (unmatched.length) { console.log("⚠️  UNMATCHED:"); unmatched.forEach((u) => console.log("   - " + u)); }
  await prisma.$disconnect();
})();
