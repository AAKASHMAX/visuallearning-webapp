const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const chapters = await prisma.chapter.findMany({ select: { id: true, name: true, courseId: true } });
  console.log("Chapters:", chapters);
  const courses = await prisma.course.findMany({ select: { id: true, name: true } });
  console.log("Courses:", courses);
}
main().catch(console.error).finally(() => prisma.$disconnect());
