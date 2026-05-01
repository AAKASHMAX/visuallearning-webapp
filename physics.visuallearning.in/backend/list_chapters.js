const { PrismaClient } = require('@prisma/client');

process.env.DATABASE_URL = "postgresql://neondb_owner:npg_oahcB3vf9MEG@ep-divine-lab-aomimqim-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const prisma = new PrismaClient();

async function main() {
  const chapters = await prisma.chapter.findMany({
    select: {
      id: true,
      name: true
    }
  });

  console.log("ALL CHAPTERS:");
  chapters.forEach(c => console.log(c.name));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
