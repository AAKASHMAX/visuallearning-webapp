/**
 * Import locally-built note content (local-content.json from the main backend's
 * build-local-content.ts) into the physics DB.
 *
 * - Matches each item's chapter to a physics chapter of the same tier by fuzzy
 *   token overlap (handles plurals/abbreviations: "Moving Charge Magnetism" ->
 *   "Moving Charges and Magnetism"). Hard OVERRIDES map below for stubborn cases.
 * - One note per (chapter, type): notes / ncert / pyq, identified by title signal.
 * - GAP-FILL by default: if that note already has htmlContent, it is SKIPPED so
 *   existing live content is never clobbered. Set FORCE=1 to overwrite.
 * - DRY=1 prints the plan (matches + actions) with zero writes.
 *
 * Run:  DATABASE_URL="<physics-prod>" npx tsx import-local-content.ts
 *       DRY=1 ... (preview)    FORCE=1 ... (overwrite existing)
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();
const DRY = process.env.DRY === "1";
const FORCE = process.env.FORCE === "1";

type Item = { category: string; tier: string; type: "notes" | "ncert" | "pyq"; folderName: string; chapterName: string; htmlContent: string; cssContent: string | null };

// folderName -> exact physics chapter name (fill after reviewing a dry run if any mismatch).
const OVERRIDES: Record<string, string> = {
  "7.Electronmanetic induction": "Electromagnetic Induction", // typo'd folder name
};

const STOP = new Set(["and", "the", "of", "in", "a", "to", "&", "with"]);
const tokens = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").split(" ").filter((t) => t && !STOP.has(t));
const tokMatch = (a: string, b: string) => a === b || (a.length >= 4 && b.length >= 4 && (a.startsWith(b) || b.startsWith(a)));

function bestChapter(name: string, chapters: { id: string; name: string }[]) {
  const at = tokens(name);
  let best: { ch: { id: string; name: string }; score: number; inter: number } | null = null;
  for (const ch of chapters) {
    const bt = tokens(ch.name);
    let inter = 0;
    for (const x of at) if (bt.some((y) => tokMatch(x, y))) inter++;
    const score = inter / Math.max(at.length, 1);
    if (!best || inter > best.inter || (inter === best.inter && score > best.score)) best = { ch, score, inter };
  }
  // Require a real overlap: >=2 shared tokens, or all of a short name matched.
  if (best && (best.inter >= 2 || (best.inter >= 1 && best.inter === at.length))) return best;
  return null;
}

const titleFor = (type: Item["type"], chapterName: string) =>
  type === "ncert" ? "NCERT Questions & Solutions" : type === "pyq" ? `${chapterName} - PYQ Solutions` : `${chapterName} - Notes`;

function matchExisting(notes: { id: string; title: string; htmlContent: string | null }[], type: Item["type"]) {
  const t = (s: string) => s.toLowerCase();
  if (type === "ncert") return notes.find((n) => t(n.title).includes("ncert"));
  if (type === "pyq") return notes.find((n) => t(n.title).includes("pyq") || t(n.title).includes("previous year"));
  // notes = the "main" note, i.e. not ncert/pyq/ppt/important
  return notes.find((n) => !/ncert|pyq|previous year|ppt|presentation|important/.test(t(n.title)));
}

(async () => {
  const host = (process.env.DATABASE_URL || "").replace(/.*@/, "").replace(/\/.*/, "");
  console.log(`Writing to: ${host}${DRY ? "   (DRY RUN)" : ""}${FORCE ? "   (FORCE overwrite)" : "   (gap-fill)"}`);

  const { items }: { items: Item[] } = JSON.parse(fs.readFileSync(__dirname + "/local-content.json", "utf-8"));

  const chaptersByTier: Record<string, { id: string; name: string }[]> = {};
  for (const tier of new Set(items.map((i) => i.tier))) {
    chaptersByTier[tier] = await prisma.chapter.findMany({ where: { course: { tier } }, select: { id: true, name: true } });
  }

  let created = 0, updated = 0, skipped = 0;
  const unmatched: string[] = [];

  for (const it of items) {
    if (!it.htmlContent || it.htmlContent.replace(/<[^>]*>/g, "").trim().length < 40) { console.log(`[empty] ${it.category}/${it.folderName}`); continue; }
    const chapters = chaptersByTier[it.tier] || [];

    let target: { id: string; name: string } | undefined;
    const ov = OVERRIDES[it.folderName];
    if (ov) target = chapters.find((c) => c.name.toLowerCase() === ov.toLowerCase());
    if (!target) target = bestChapter(it.chapterName, chapters)?.ch;

    if (!target) {
      unmatched.push(`${it.category} / ${it.folderName} ("${it.chapterName}")`);
      console.log(`[NO MATCH] ${it.category} "${it.chapterName}" (tier ${it.tier})`);
      continue;
    }

    const existing = await prisma.note.findMany({ where: { chapterId: target.id }, select: { id: true, title: true, htmlContent: true } });
    const hit = matchExisting(existing, it.type);
    const title = titleFor(it.type, target.name);
    const tag = `${it.category} "${it.chapterName}" → [${target.name}] ${it.type}`;

    if (hit && hit.htmlContent && !FORCE) { skipped++; console.log(`  ~ SKIP (has content) ${tag}  ["${hit.title}"]`); continue; }

    if (hit) {
      if (!DRY) await prisma.note.update({ where: { id: hit.id }, data: { title, htmlContent: it.htmlContent, cssContent: it.cssContent } });
      updated++; console.log(`  * UPDATE ${tag}  → "${title}"`);
    } else {
      const order = it.type === "notes" ? 0 : it.type === "ncert" ? 1 : 2;
      if (!DRY) await prisma.note.create({ data: { title, fileUrl: "", htmlContent: it.htmlContent, cssContent: it.cssContent, isFree: false, displayOrder: order, chapterId: target.id } });
      created++; console.log(`  + CREATE ${tag}  → "${title}"`);
    }
  }

  console.log(`\n=== Done${DRY ? " (DRY RUN)" : ""} ===`);
  console.log(`Created: ${created}, Updated: ${updated}, Skipped (already had content): ${skipped}`);
  if (unmatched.length) { console.log(`\n⚠️  UNMATCHED (add to OVERRIDES):`); unmatched.forEach((u) => console.log(`   - ${u}`)); }
  await prisma.$disconnect();
})();
