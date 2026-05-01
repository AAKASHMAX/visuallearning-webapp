const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Chapters 3-8 that have 50 questions (duplicates)
  const chaptersWithDupes = [
    'cmmn2fawu007tuukst9ocxruu', // Plant Kingdom
    'cmmn2fazm007vuukso33mzz2h', // Animal Kingdom
    'cmmn2fb2r007xuuksu913j6qk', // Cell Structure
    'cmn89uflx0005uux0t5s3wo0f', // Anatomy of Flowering Plants
    'cmn89ufou0007uux0dk1c9sy2', // Structural Organisation in Animals
    'cmn89ufrj0009uux065vozr5m', // Cell: The Unit of Life
  ];

  for (const chapterId of chaptersWithDupes) {
    const questions = await prisma.question.findMany({
      where: { chapterId },
      orderBy: { createdAt: 'asc' },
      select: { id: true }
    });
    console.log('Chapter', chapterId, 'has', questions.length, 'questions');
    if (questions.length > 25) {
      const toDelete = questions.slice(25).map(q => q.id);
      await prisma.question.deleteMany({ where: { id: { in: toDelete } } });
      console.log('  Deleted', toDelete.length, 'duplicate questions');
    }
  }

  console.log('\nDuplicates removed.');
  await prisma.$disconnect();
}
main();
