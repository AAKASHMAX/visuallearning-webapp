const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const className = process.argv[2] || "12";
  const subjects = await prisma.subject.findMany({
    where: {
      class: { name: { contains: className } },
      NOT: { name: { contains: "Math" } },
    },
    include: {
      class: true,
      chapters: {
        orderBy: { order: "asc" },
        select: { id: true, name: true, order: true, _count: { select: { questions: true } } },
      },
    },
    orderBy: { name: "asc" },
  });

  subjects.forEach((s) => {
    console.log(`\n=== ${s.class.name} - ${s.name} (id: ${s.id}, enabled: ${s.enabled}) ===`);
    if (s.chapters.length === 0) {
      console.log("  (no chapters)");
    }
    s.chapters.forEach((c) =>
      console.log(`  ${c.order}. ${c.name} | id: ${c.id} | questions: ${c._count.questions}`)
    );
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
