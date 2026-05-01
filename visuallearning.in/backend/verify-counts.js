const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const subjects = await prisma.subject.findMany({
    where: { class: { name: { contains: '11' } }, name: { in: ['Chemistry', 'Biology'] } },
    include: { class: true, chapters: { orderBy: { order: 'asc' }, select: { id: true, name: true, order: true, _count: { select: { questions: true } } } } }
  });
  let allGood = true;
  subjects.forEach(sub => {
    console.log('\n=== ' + sub.class.name + ' - ' + sub.name + ' (' + sub.chapters.length + ' chapters) ===');
    sub.chapters.forEach(c => {
      const status = c._count.questions === 25 ? 'OK' : 'ISSUE';
      if (status !== 'OK') allGood = false;
      console.log('  ' + c.order + '. ' + c.name + ' | questions: ' + c._count.questions + ' | ' + status);
    });
  });
  console.log('\n' + (allGood ? 'ALL CHAPTERS HAVE 25 QUESTIONS!' : 'SOME CHAPTERS NEED ATTENTION'));
  await prisma.$disconnect();
}
main();
