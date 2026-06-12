/**
 * Import PPT notes into the MAIN app DB from ppt-content.json.
 * One PPT note per chapter: pdfUrl = light PDF, cssContent = dark PDF URL.
 * (cssContent is unused for PDF-only notes, so it safely carries the dark URL;
 *  the viewer reads it to power the light/dark switch.)
 *
 * Matches chapters across ALL subjects of the class (tier) by token name.
 * Upserts the chapter's PPT note (title contains "ppt"/"presentation").
 *
 * Run: DATABASE_URL="<main-prod>" npx tsx import-ppts.ts   (DRY=1 to preview)
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();
const DRY = process.env.DRY === "1";

type Item = { tier: string; chapterName: string; lightUrl: string | null; darkUrl: string | null };

const OVERRIDES: Record<string, string> = {
  "Electronmanetic induction": "Electromagnetic Induction",
  "Heredity and Evolution": "Heredity",
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

(async () => {
  const host = (process.env.DATABASE_URL || "").replace(/.*@/, "").replace(/\/.*/, "");
  console.log(`Writing to: ${host}${DRY ? "  (DRY)" : ""}`);
  const { items }: { items: Item[] } = JSON.parse(fs.readFileSync(__dirname + "/ppt-content.json", "utf-8"));

  const chaptersByTier: Record<string, { id: string; name: string; subject: string }[]> = {};
  for (const tier of new Set(items.map((i) => i.tier))) {
    const re = new RegExp(`(^|[^0-9])${tier}([^0-9]|$)`);
    // Class 11 & 12 PPT folders are Physics-only; restrict to avoid same-named
    // Chemistry chapters (e.g. Class 11 Thermodynamics exists in both subjects).
    const physicsOnly = tier === "11" || tier === "12";
    const chapters = await prisma.chapter.findMany({
      where: { subject: { class: { name: { contains: tier } } } },
      select: { id: true, name: true, subject: { select: { name: true, class: { select: { name: true } } } } },
    });
    chaptersByTier[tier] = chapters
      .filter((c) => re.test(c.subject.class.name) && (!physicsOnly || /physics/i.test(c.subject.name)))
      .map((c) => ({ id: c.id, name: c.name, subject: c.subject.name }));
  }

  let created = 0, updated = 0;
  const unmatched: string[] = [];
  for (const it of items) {
    if (!it.lightUrl && !it.darkUrl) continue;
    const chapters = chaptersByTier[it.tier] || [];
    const ov = OVERRIDES[it.chapterName];
    let target = ov ? chapters.find((c) => c.name.toLowerCase() === ov.toLowerCase()) : undefined;
    if (!target) target = bestChapter(it.chapterName, chapters) || undefined;
    if (!target) { unmatched.push(`tier ${it.tier} / "${it.chapterName}"`); console.log(`[NO MATCH] tier ${it.tier} "${it.chapterName}"`); continue; }

    const existing = await prisma.note.findMany({ where: { chapterId: target.id }, select: { id: true, title: true } });
    const hit = existing.find((n) => /ppt|presentation|slide/.test(n.title.toLowerCase()));
    const title = `${target.name} - PPT`;
    const data = { title, pdfUrl: it.lightUrl || "", cssContent: it.darkUrl || null, htmlContent: null as string | null };
    const tag = `tier ${it.tier} "${it.chapterName}" → [${(target as any).subject}/${target.name}]`;

    if (hit) {
      if (!DRY) await prisma.note.update({ where: { id: hit.id }, data });
      updated++; console.log(`  * UPDATE ${tag}  (light=${it.lightUrl ? "✓" : "·"} dark=${it.darkUrl ? "✓" : "·"})`);
    } else {
      if (!DRY) await prisma.note.create({ data: { ...data, chapterId: target.id } });
      created++; console.log(`  + CREATE ${tag}  (light=${it.lightUrl ? "✓" : "·"} dark=${it.darkUrl ? "✓" : "·"})`);
    }
  }
  console.log(`\n=== Done${DRY ? " (DRY)" : ""} === created ${created}, updated ${updated}`);
  if (unmatched.length) { console.log("⚠️ UNMATCHED:"); unmatched.forEach((u) => console.log("  - " + u)); }
  await prisma.$disconnect();
})();
