const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  console.log("Connecting to local backend database...");

  // Delete 'Mathematics' from Subject
  const subjects = await prisma.subject.findMany({
    where: {
      OR: [
        { name: { contains: 'math', mode: 'insensitive' } },
        { name: { contains: 'mathematics', mode: 'insensitive' } },
        { name: { contains: 'mathametics', mode: 'insensitive' } }
      ]
    }
  });

  if (subjects.length > 0) {
    for (const sub of subjects) {
      console.log(`Deleting subject: ${sub.name} (Class ID: ${sub.classId})`);
      await prisma.subject.delete({ where: { id: sub.id } });
    }
    console.log("Successfully deleted Mathematics subjects.");
  } else {
    console.log("No Mathematics subjects found in database.");
  }

  // Delete all live classes just in case
  const liveClasses = await prisma.liveClass.findMany();
  if (liveClasses.length > 0) {
    await prisma.liveClass.deleteMany();
    console.log(`Deleted ${liveClasses.length} live classes.`);
  } else {
    console.log("No live classes found.");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
