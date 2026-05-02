const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const classes = await prisma.class.findMany({
    include: {
      subjects: true
    }
  });
  console.log(JSON.stringify(classes, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
