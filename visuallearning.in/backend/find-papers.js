const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const papers = await prisma.boardPaper.findMany({
    where: { subject: { class: { name: { contains: "12" } }, name: { contains: "Physics" } } },
    select: { id: true, title: true, pdfUrl: true, year: true, subject: { select: { name: true } } },
    take: 5,
  });
  papers.forEach(p => console.log(p.year, p.title, "|", p.subject.name, "|", p.pdfUrl));
}

main().catch(console.error).finally(() => prisma.$disconnect());
