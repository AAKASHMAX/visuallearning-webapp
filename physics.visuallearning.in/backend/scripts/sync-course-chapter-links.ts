import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.PHYSICS_DATABASE_URL || process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("PHYSICS_DATABASE_URL or DATABASE_URL is required");
}
process.env.DATABASE_URL = databaseUrl;

const prisma = new PrismaClient();

async function main() {
  const chapters = await prisma.chapter.findMany({
    where: { courseId: { not: null } },
    select: { id: true, courseId: true, displayOrder: true },
  });

  let createdOrUpdated = 0;
  for (const chapter of chapters) {
    if (!chapter.courseId) continue;
    await prisma.courseChapter.upsert({
      where: { courseId_chapterId: { courseId: chapter.courseId, chapterId: chapter.id } },
      update: { order: chapter.displayOrder || 0 },
      create: {
        courseId: chapter.courseId,
        chapterId: chapter.id,
        order: chapter.displayOrder || 0,
      },
    });
    createdOrUpdated += 1;
  }

  const courses = await prisma.course.findMany({
    orderBy: { displayOrder: "asc" },
    include: { _count: { select: { courseChapters: true, chapters: true } } },
  });

  console.log(JSON.stringify({
    legacyChaptersScanned: chapters.length,
    linksCreatedOrUpdated: createdOrUpdated,
    courses: courses.map((course) => ({
      name: course.name,
      tier: course.tier,
      linkedChapters: course._count.courseChapters,
      legacyChapters: course._count.chapters,
    })),
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
