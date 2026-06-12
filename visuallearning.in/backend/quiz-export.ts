/**
 * Export Class 11 & 12 Physics quiz questions from the main prod DB.
 * Run: DATABASE_URL="<main-prod>" npx tsx quiz-export.ts  → quiz-export.json
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

(async () => {
  const host = (process.env.DATABASE_URL || "").replace(/.*@/, "").replace(/\/.*/, "");
  console.log("Reading from:", host);

  const chapters = await prisma.chapter.findMany({
    where: { subject: { name: { contains: "Physics", mode: "insensitive" }, class: { name: { contains: "1" } } } },
    include: {
      subject: { include: { class: true } },
      questions: { select: { questionText: true, optionA: true, optionB: true, optionC: true, optionD: true, correctOption: true, solution: true }, orderBy: { createdAt: "asc" } },
    },
    orderBy: { order: "asc" },
  });

  const byClass: Record<string, any> = {};
  for (const ch of chapters) {
    const cn = ch.subject.class.name;
    if (!/\b(11|12)\b/.test(cn)) continue;
    (byClass[cn] ??= { className: cn, chapters: [] }).chapters.push({ chapterName: ch.name, questions: ch.questions });
  }

  const out = { classes: Object.values(byClass) };
  fs.writeFileSync(__dirname + "/quiz-export.json", JSON.stringify(out, null, 2), "utf-8");
  let total = 0;
  for (const c of out.classes as any[]) {
    console.log(`\n${c.className} (${c.chapters.length} ch)`);
    for (const ch of c.chapters) { total += ch.questions.length; console.log(`  ${ch.chapterName}: ${ch.questions.length} questions`); }
  }
  console.log(`\nTotal: ${total} questions → quiz-export.json`);
  await prisma.$disconnect();
})();
