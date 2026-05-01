const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const SUBJECT_ID = "cmmn2fjx300a5uukssn5f4f1e";

const CHAPTERS = [
  { name: "Reproduction in Organisms", order: 1 },
  { name: "Sexual Reproduction in Flowering Plants", order: 2 },
  { name: "Human Reproduction", order: 3 },
  { name: "Reproductive Health", order: 4 },
  { name: "Principles of Inheritance and Variation", order: 5 },
  { name: "Molecular Basis of Inheritance", order: 6 },
  { name: "Evolution", order: 7 },
  { name: "Human Health and Disease", order: 8 },
  { name: "Strategies for Enhancement in Food Production", order: 9 },
  { name: "Microbes in Human Welfare", order: 10 },
  { name: "Biotechnology: Principles and Processes", order: 11 },
  { name: "Biotechnology and its Applications", order: 12 },
  { name: "Organisms and Populations", order: 13 },
  { name: "Ecosystem", order: 14 },
  { name: "Biodiversity and Conservation", order: 15 },
  { name: "Environmental Issues", order: 16 },
];

// Alternate name mappings for existing chapters that may have slightly different names
const NAME_ALIASES = {
  "Principles of Inheritance and Variation": ["Principles of Inheritance"],
  "Reproduction in Organisms": ["Reproduction in Organisms"],
  "Human Reproduction": ["Human Reproduction"],
  "Reproductive Health": ["Reproductive Health"],
  "Molecular Basis of Inheritance": ["Molecular Basis of Inheritance"],
};

async function findOrCreateChapter(chapterDef) {
  // Try exact match first
  let chapter = await prisma.chapter.findFirst({
    where: { subjectId: SUBJECT_ID, name: chapterDef.name },
  });
  if (chapter) {
    console.log(`  Found existing chapter: ${chapter.name} (${chapter.id})`);
    return chapter;
  }

  // Try alias matches
  const aliases = Object.entries(NAME_ALIASES);
  for (const [canonical, alts] of aliases) {
    if (canonical === chapterDef.name) {
      for (const alt of alts) {
        chapter = await prisma.chapter.findFirst({
          where: { subjectId: SUBJECT_ID, name: alt },
        });
        if (chapter) {
          console.log(`  Found existing chapter by alias: ${chapter.name} (${chapter.id})`);
          return chapter;
        }
      }
    }
  }

  // Also do a contains search as fallback
  const words = chapterDef.name.split(" ").filter(w => w.length > 4);
  if (words.length > 0) {
    chapter = await prisma.chapter.findFirst({
      where: {
        subjectId: SUBJECT_ID,
        name: { contains: words[0], mode: "insensitive" },
      },
    });
    if (chapter && chapterDef.name.toLowerCase().includes(words[0].toLowerCase())) {
      // Verify it's actually related
      const chapterWords = chapter.name.toLowerCase().split(" ");
      const defWords = chapterDef.name.toLowerCase().split(" ");
      const overlap = chapterWords.filter(w => defWords.includes(w)).length;
      if (overlap >= 2) {
        console.log(`  Found existing chapter by fuzzy match: ${chapter.name} (${chapter.id})`);
        return chapter;
      }
    }
  }

  // Create new chapter
  chapter = await prisma.chapter.create({
    data: {
      subjectId: SUBJECT_ID,
      name: chapterDef.name,
      order: chapterDef.order,
    },
  });
  console.log(`  Created new chapter: ${chapter.name} (${chapter.id})`);
  return chapter;
}

async function seedQuestionsForChapter(chapterId, chapterName, questions) {
  // Delete existing questions
  const deleted = await prisma.question.deleteMany({ where: { chapterId } });
  console.log(`    Deleted ${deleted.count} existing questions`);

  // Insert new questions
  const created = await prisma.question.createMany({
    data: questions.map((q) => ({
      chapterId,
      questionText: q.q,
      optionA: q.a,
      optionB: q.b,
      optionC: q.c,
      optionD: q.d,
      correctOption: q.ans,
      solution: q.sol,
    })),
  });
  console.log(`    Inserted ${created.count} questions for "${chapterName}"`);
}

// Load questions from separate files to keep things manageable
const ch1 = require("./bio12-questions/ch01.js");
const ch2 = require("./bio12-questions/ch02.js");
const ch3 = require("./bio12-questions/ch03.js");
const ch4 = require("./bio12-questions/ch04.js");
const ch5 = require("./bio12-questions/ch05.js");
const ch6 = require("./bio12-questions/ch06.js");
const ch7 = require("./bio12-questions/ch07.js");
const ch8 = require("./bio12-questions/ch08.js");
const ch9 = require("./bio12-questions/ch09.js");
const ch10 = require("./bio12-questions/ch10.js");
const ch11 = require("./bio12-questions/ch11.js");
const ch12 = require("./bio12-questions/ch12.js");
const ch13 = require("./bio12-questions/ch13.js");
const ch14 = require("./bio12-questions/ch14.js");
const ch15 = require("./bio12-questions/ch15.js");
const ch16 = require("./bio12-questions/ch16.js");

const ALL_QUESTIONS = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11, ch12, ch13, ch14, ch15, ch16];

async function main() {
  console.log("Starting CBSE 12th Biology seed...\n");

  // Verify subject exists
  const subject = await prisma.subject.findUnique({ where: { id: SUBJECT_ID } });
  if (!subject) {
    console.error("Subject not found! Check SUBJECT_ID.");
    process.exit(1);
  }
  console.log(`Subject: ${subject.name}\n`);

  for (let i = 0; i < CHAPTERS.length; i++) {
    const chDef = CHAPTERS[i];
    console.log(`\nChapter ${i + 1}: ${chDef.name}`);
    const chapter = await findOrCreateChapter(chDef);
    await seedQuestionsForChapter(chapter.id, chapter.name, ALL_QUESTIONS[i]);
  }

  console.log("\n=== Done! All 16 chapters seeded with 25 questions each. ===");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
