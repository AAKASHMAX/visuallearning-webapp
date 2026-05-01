const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const subjects = await prisma.subject.findMany({
    where: { class: { name: { contains: "11" } }, name: { contains: "Biology" } },
    include: { chapters: { orderBy: { order: "asc" }, select: { id: true, name: true, order: true } } }
  });

  let totalDeleted = 0;
  for (const s of subjects) {
    for (const ch of s.chapters) {
      const questions = await prisma.question.findMany({
        where: { chapterId: ch.id },
        orderBy: { createdAt: "asc" },
        select: { id: true, questionText: true, createdAt: true }
      });

      if (questions.length > 25) {
        // Keep first 25, delete the rest
        const toDelete = questions.slice(25).map(q => q.id);
        await prisma.question.deleteMany({ where: { id: { in: toDelete } } });
        console.log(`  ${ch.order}. ${ch.name}: ${questions.length} -> 25 (deleted ${toDelete.length})`);
        totalDeleted += toDelete.length;
      } else {
        console.log(`  ${ch.order}. ${ch.name}: ${questions.length} (OK)`);
      }
    }
  }
  console.log(`\nTotal deleted: ${totalDeleted}`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
