const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  const chapters = await prisma.chapter.findMany({
    where: { subject: { classId: "cmmkpxm1t0002uu34sra42qqh" } },
    include: { subject: true, videos: true, notes: true },
    orderBy: [{ subject: { name: "asc" } }, { order: "asc" }],
  });
  let cur = "";
  for (const ch of chapters) {
    if (ch.subject.name !== cur) {
      cur = ch.subject.name;
      console.log("\n" + cur.toUpperCase());
    }
    const free = ch.videos.filter((v) => v.isFree).length;
    console.log(
      `  ${ch.order}. ${ch.name} | videos: ${ch.videos.length} (free: ${free}) | notes: ${ch.notes.length}`
    );
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
