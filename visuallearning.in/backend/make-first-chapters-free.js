const { PrismaClient } = require("@prisma/client");

const PROD_URL =
  "postgresql://neondb_owner:npg_qLi6vFODMz4k@ep-polished-cell-a18eh31p-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const DATABASE_URL = process.env.SEED_DATABASE_URL || PROD_URL;
process.env.DATABASE_URL = DATABASE_URL;

const prisma = new PrismaClient();

async function makeFirstChaptersFree() {
  // Get all classes with their subjects and chapters
  const classes = await prisma.class.findMany({
    orderBy: { order: "asc" },
    include: {
      subjects: {
        include: {
          chapters: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  let totalUpdated = 0;

  for (const cls of classes) {
    console.log(`\nClass: ${cls.name}`);
    for (const subject of cls.subjects) {
      if (subject.chapters.length === 0) {
        console.log(`  ${subject.name}: No chapters`);
        continue;
      }

      const firstChapter = subject.chapters[0];
      console.log(`  ${subject.name} → First chapter: "${firstChapter.name}" (order: ${firstChapter.order})`);

      // Update all videos in this chapter to be free
      const result = await prisma.video.updateMany({
        where: { chapterId: firstChapter.id },
        data: { isFree: true },
      });

      console.log(`    Updated ${result.count} videos to free`);
      totalUpdated += result.count;
    }
  }

  console.log(`\nDone! Total videos made free: ${totalUpdated}`);
}

makeFirstChaptersFree()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
