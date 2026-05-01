/**
 * Seed "Important Questions" board paper entries for Class 9 and Class 11
 * Similar to board papers but titled as Important Questions
 *
 * Usage: DATABASE_URL="..." npx ts-node seed-important-questions.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const YEARS = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

const CLASS_SUBJECTS: Record<string, string[]> = {
  "Class 9": ["Mathematics", "Physics", "Chemistry", "Biology"],
  "Class 11": ["Mathematics", "Physics", "Chemistry", "Biology"],
};

async function main() {
  console.log("Seeding Important Questions...\n");

  let totalCreated = 0;

  for (const [className, subjectNames] of Object.entries(CLASS_SUBJECTS)) {
    const classNum = className.replace("Class ", "");
    const cls = await prisma.class.findFirst({
      where: { name: { contains: classNum, mode: "insensitive" } },
    });

    if (!cls) {
      console.log(`⚠ "${className}" not found, skipping...`);
      continue;
    }
    console.log(`${className} (${cls.id})`);

    for (const subjectName of subjectNames) {
      const subject = await prisma.subject.findFirst({
        where: { classId: cls.id, name: { contains: subjectName, mode: "insensitive" } },
      });

      if (!subject) {
        console.log(`  ⚠ "${subjectName}" not found in ${className}, skipping...`);
        continue;
      }

      console.log(`  ${subjectName} (${subject.id})`);

      for (const year of YEARS) {
        // Question Paper
        const paperTitle = `${subjectName} ${year} Question Paper`;
        try {
          await prisma.boardPaper.upsert({
            where: { subjectId_year_title: { subjectId: subject.id, year, title: paperTitle } },
            update: {},
            create: { subjectId: subject.id, year, title: paperTitle, pdfUrl: "pending", order: 1 },
          });
          totalCreated++;
        } catch {}

        // Solution
        const solutionTitle = `${subjectName} ${year} Solution`;
        try {
          await prisma.boardPaper.upsert({
            where: { subjectId_year_title: { subjectId: subject.id, year, title: solutionTitle } },
            update: {},
            create: { subjectId: subject.id, year, title: solutionTitle, pdfUrl: "pending", order: 2 },
          });
          totalCreated++;
        } catch {}
      }
      console.log(`    → ${YEARS.length * 2} entries (${YEARS[0]}-${YEARS[YEARS.length - 1]})`);
    }
  }

  console.log(`\nDone! Created/verified: ${totalCreated}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
