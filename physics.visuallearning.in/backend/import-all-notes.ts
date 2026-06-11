/**
 * Import ALL Notes + NCERT (Class 11 & 12) into the physics app from the main
 * app's all-notes-export.json.
 *
 * - Matches each main chapter to a physics chapter by normalized name, scoped to
 *   the course tier (Class 11 -> "11", Class 12 -> "12").
 * - Keeps only Notes + NCERT. Skips PPT, PYQ / previous-year / board papers, and
 *   "Important Questions" (so the physics PYQ/quiz sections are left untouched).
 * - Idempotent & NON-destructive: upserts each note by (chapterId, title) —
 *   updates html/css if it already exists, else creates. Does NOT delete other
 *   notes (PYQ/quiz seeded earlier survive).
 * - htmlContent already points at Cloudinary URLs, so no image work is needed.
 *
 * Run (production):
 *   1) put all-notes-export.json next to this file (copy from main backend)
 *   2) DATABASE_URL="<physics-prod>" npx tsx import-all-notes.ts
 *   Optional dry run (no writes):  DRY=1 DATABASE_URL="<physics-prod>" npx tsx import-all-notes.ts
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();
const DRY = process.env.DRY === "1";

type ExpNote = { title: string; htmlContent: string | null; cssContent: string | null; pdfUrl: string | null };
type ExpChapter = { chapterName: string; order: number; notes: ExpNote[] };
type ExpClass = { className: string; chapters: ExpChapter[] };

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

// Keep regular Notes + NCERT only.
function keepNote(title: string): boolean {
  const t = title.toLowerCase();
  if (!t) return false;
  if (t.includes("ppt") || t.includes("presentation")) return false;
  if (t.includes("pyq") || t.includes("previous year") || t.includes("board paper")) return false;
  if (t.includes("important")) return false;
  return true;
}

// Class name (e.g. "Class 12", "12th") -> physics course tier.
function tierForClass(className: string): string | null {
  if (/\b12\b|12th/i.test(className)) return "12";
  if (/\b11\b|11th/i.test(className)) return "11";
  return null;
}

(async () => {
  const host = (process.env.DATABASE_URL || "").replace(/.*@/, "").replace(/\/.*/, "");
  console.log(`Writing to: ${host}${DRY ? "   (DRY RUN — no writes)" : ""}`);

  const data: { classes: ExpClass[] } = JSON.parse(fs.readFileSync(__dirname + "/all-notes-export.json", "utf-8"));

  let created = 0, updated = 0, skippedNotes = 0;
  const unmatchedChapters: string[] = [];

  for (const cls of data.classes) {
    const tier = tierForClass(cls.className);
    if (!tier) {
      console.log(`\n[skip class] "${cls.className}" — no matching physics tier (only 11/12 supported)`);
      continue;
    }
    console.log(`\n================ ${cls.className} → tier ${tier} (${cls.chapters.length} chapters) ================`);

    // Pull the physics chapters for this tier once, match in memory by normalized name.
    const physChapters = await prisma.chapter.findMany({
      where: { course: { tier } },
      select: { id: true, name: true },
    });
    const physByNorm = new Map(physChapters.map((c) => [norm(c.name), c]));

    for (const ch of cls.chapters) {
      const keep = ch.notes.filter((n) => keepNote(n.title) && n.htmlContent);
      const dropped = ch.notes.length - keep.length;
      skippedNotes += dropped;
      if (keep.length === 0) continue; // nothing to migrate for this chapter

      // Match: exact normalized, else contains either way.
      let target = physByNorm.get(norm(ch.chapterName));
      if (!target) {
        const n = norm(ch.chapterName);
        target = physChapters.find((c) => norm(c.name).includes(n) || n.includes(norm(c.name)));
      }
      if (!target) {
        unmatchedChapters.push(`${cls.className} / ${ch.chapterName} (${keep.length} notes)`);
        console.log(`  [NO MATCH] "${ch.chapterName}" — ${keep.length} notes not imported`);
        continue;
      }

      console.log(`  ${ch.chapterName}  →  "${target.name}"  (${keep.length} notes${dropped ? `, ${dropped} skipped` : ""})`);

      let order = 0;
      for (const n of keep) {
        const existing = await prisma.note.findFirst({ where: { chapterId: target.id, title: n.title } });
        if (existing) {
          if (!DRY) await prisma.note.update({ where: { id: existing.id }, data: { htmlContent: n.htmlContent, cssContent: n.cssContent } });
          updated++;
          console.log(`      ~ update "${n.title}"`);
        } else {
          if (!DRY) await prisma.note.create({
            data: {
              title: n.title,
              fileUrl: "",
              htmlContent: n.htmlContent,
              cssContent: n.cssContent,
              isFree: false, // per-chapter gating handles the free first chapter
              displayOrder: order,
              chapterId: target.id,
            },
          });
          created++;
          console.log(`      + create "${n.title}"`);
        }
        order++;
      }
    }
  }

  console.log(`\n=== Done${DRY ? " (DRY RUN)" : ""} ===`);
  console.log(`Created: ${created}, Updated: ${updated}, Skipped (PYQ/PPT/Important/no-html): ${skippedNotes}`);
  if (unmatchedChapters.length) {
    console.log(`\n⚠️  Unmatched chapters (notes NOT imported — name mismatch between apps):`);
    unmatchedChapters.forEach((u) => console.log(`   - ${u}`));
  }
  await prisma.$disconnect();
})();
