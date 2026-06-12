/**
 * Import Class 11 & 12 quiz questions into the physics DB from quiz-export.json.
 * - Token-matches chapters by name within the tier.
 * - GAP-FILL by default (skip chapters that already have questions); FORCE=1 to
 *   wipe+reimport that chapter. DRY=1 previews.
 *
 * Run: DATABASE_URL="<physics-prod>" npx tsx quiz-import.ts  (DRY=1 / FORCE=1)
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();
const DRY = process.env.DRY === "1";
const FORCE = process.env.FORCE === "1";

type Q = { questionText: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: string; solution: string | null };
type Ch = { chapterName: string; questions: Q[] };
type Cls = { className: string; chapters: Ch[] };

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
const tierFor = (cn: string) => (/\b12\b/.test(cn) ? "12" : /\b11\b/.test(cn) ? "11" : null);

(async () => {
  const host = (process.env.DATABASE_URL || "").replace(/.*@/, "").replace(/\/.*/, "");
  console.log(`Writing to: ${host}${DRY ? "  (DRY)" : ""}${FORCE ? "  (FORCE)" : "  (gap-fill)"}`);
  const { classes }: { classes: Cls[] } = JSON.parse(fs.readFileSync(__dirname + "/quiz-export.json", "utf-8"));

  let created = 0, skipped = 0;
  const unmatched: string[] = [];
  for (const cls of classes) {
    const tier = tierFor(cls.className);
    if (!tier) continue;
    const chapters = await prisma.chapter.findMany({ where: { course: { tier } }, select: { id: true, name: true } });
    console.log(`\n## ${cls.className} → tier ${tier}`);
    for (const ch of cls.chapters) {
      if (ch.questions.length === 0) continue;
      const target = bestChapter(ch.chapterName, chapters);
      if (!target) { unmatched.push(`${cls.className}/${ch.chapterName}`); console.log(`  [NO MATCH] ${ch.chapterName}`); continue; }
      const existing = await prisma.question.count({ where: { chapterId: target.id } });
      if (existing > 0 && !FORCE) { skipped++; console.log(`  ~ SKIP ${ch.chapterName} → [${target.name}] (${existing} existing)`); continue; }
      if (existing > 0 && FORCE && !DRY) await prisma.question.deleteMany({ where: { chapterId: target.id } });
      let order = 0;
      for (const q of ch.questions) {
        if (!DRY) await prisma.question.create({ data: { question: q.questionText, optionA: q.optionA, optionB: q.optionB, optionC: q.optionC, optionD: q.optionD, correctAnswer: q.correctOption, solution: q.solution, displayOrder: order, chapterId: target.id } });
        order++;
      }
      created += ch.questions.length;
      console.log(`  + ${ch.chapterName} → [${target.name}]: ${ch.questions.length} questions`);
    }
  }
  console.log(`\n=== Done${DRY ? " (DRY)" : ""} === created ${created} questions, skipped ${skipped} chapters`);
  if (unmatched.length) { console.log("⚠️ UNMATCHED:"); unmatched.forEach((u) => console.log("  - " + u)); }
  await prisma.$disconnect();
})();
