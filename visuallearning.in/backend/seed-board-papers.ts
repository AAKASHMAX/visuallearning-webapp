/**
 * Seed board papers for Class 10 and Class 12
 * Creates 2 entries per year (2016-2025) per subject: Question Paper + Solution
 *
 * Usage: npx ts-node seed-board-papers.ts
 * Or with production DB: DATABASE_URL="..." npx ts-node seed-board-papers.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const YEARS = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

// Subjects to seed for each class
const CLASS_SUBJECTS: Record<string, string[]> = {
  "Class 10": ["Mathematics", "Physics", "Chemistry", "Biology"],
  "Class 12": ["Mathematics", "Physics", "Chemistry", "Biology"],
};

async function main() {
  console.log("Seeding board papers...\n");

  let totalCreated = 0;
  let totalSkipped = 0;

  for (const [className, subjectNames] of Object.entries(CLASS_SUBJECTS)) {
    // Find the class
    const cls = await prisma.class.findFirst({
      where: { name: { contains: className.replace("Class ", ""), mode: "insensitive" } },
    });

    if (!cls) {
      console.log(`⚠ Class "${className}" not found, skipping...`);
      continue;
    }
    console.log(`${className} (${cls.id})`);

    for (const subjectName of subjectNames) {
      const subject = await prisma.subject.findFirst({
        where: {
          classId: cls.id,
          name: { contains: subjectName, mode: "insensitive" },
        },
      });

      if (!subject) {
        console.log(`  ⚠ Subject "${subjectName}" not found in ${className}, skipping...`);
        continue;
      }

      console.log(`  ${subjectName} (${subject.id})`);

      for (const year of YEARS) {
        // Create Question Paper entry
        const paperTitle = `${subjectName} ${year} Question Paper`;
        try {
          await prisma.boardPaper.upsert({
            where: {
              subjectId_year_title: {
                subjectId: subject.id,
                year,
                title: paperTitle,
              },
            },
            update: {},
            create: {
              subjectId: subject.id,
              year,
              title: paperTitle,
              pdfUrl: "pending",
              order: 1,
            },
          });
          totalCreated++;
        } catch {
          totalSkipped++;
        }

        // Create Solution entry
        const solutionTitle = `${subjectName} ${year} Solution`;
        try {
          await prisma.boardPaper.upsert({
            where: {
              subjectId_year_title: {
                subjectId: subject.id,
                year,
                title: solutionTitle,
              },
            },
            update: {},
            create: {
              subjectId: subject.id,
              year,
              title: solutionTitle,
              pdfUrl: "pending",
              order: 2,
            },
          });
          totalCreated++;
        } catch {
          totalSkipped++;
        }
      }
      console.log(`    → ${YEARS.length * 2} entries (${YEARS[0]}-${YEARS[YEARS.length - 1]})`);
    }
  }

  console.log(`\nDone! Created/verified: ${totalCreated}, Skipped: ${totalSkipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
