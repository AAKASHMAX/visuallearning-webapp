const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  const subjects = await prisma.subject.findMany({
    where: { class: { name: { contains: "11" } }, name: { contains: "Biology" } },
    include: {
      class: { select: { name: true } },
      chapters: { orderBy: { order: "asc" }, select: { id: true, name: true, order: true, _count: { select: { questions: true } } } }
    }
  });
  subjects.forEach(s => {
    console.log(`${s.class.name} - ${s.name} (ID: ${s.id})`);
    s.chapters.forEach(c => console.log(`  ${c.order}. ${c.name} (${c.id}) - ${c._count.questions} questions`));
    console.log(`  Total chapters: ${s.chapters.length}`);
  });
}
main().catch(console.error).finally(() => prisma.$disconnect());
