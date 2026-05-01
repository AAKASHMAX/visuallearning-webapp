// Run: DATABASE_URL="your-neon-url" node seed-motion-videos.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const motionVideos = [
  // Hindi
  { title: "Motion", youtubeUrl: "https://www.youtube.com/watch?v=IeVXkgyWiYA", language: "HINDI", displayOrder: 1 },
  { title: "Motion along a straight line", youtubeUrl: "https://www.youtube.com/watch?v=UXazo9CVbb8", language: "HINDI", displayOrder: 2 },
  { title: "Uniform and non uniform motion", youtubeUrl: "https://www.youtube.com/watch?v=Kv5Njh_4lrE", language: "HINDI", displayOrder: 3 },
  { title: "Basic terms use in motion", youtubeUrl: "https://www.youtube.com/watch?v=ullWbSbdNag", language: "HINDI", displayOrder: 4 },
  // English
  { title: "Motion", youtubeUrl: "https://www.youtube.com/watch?v=KfqkMtZLrBQ", language: "ENGLISH", displayOrder: 1 },
  { title: "Motion along a straight line", youtubeUrl: "https://www.youtube.com/watch?v=IfwKLPXr5Vo", language: "ENGLISH", displayOrder: 2 },
  { title: "Uniform and non uniform motion", youtubeUrl: "https://www.youtube.com/watch?v=Su1fZ_zQV68", language: "ENGLISH", displayOrder: 3 },
  { title: "Basic terms use in motion", youtubeUrl: "https://www.youtube.com/watch?v=MloG94lCb-U", language: "ENGLISH", displayOrder: 4 },
];

async function main() {
  // Find Motion chapter in both Basic and Advance courses
  const chapters = await prisma.chapter.findMany({
    where: { name: "Motion" },
    include: { course: { select: { name: true, tier: true } } },
  });

  if (chapters.length === 0) {
    console.log("No Motion chapter found!");
    return;
  }

  for (const chapter of chapters) {
    console.log(`\nAdding videos to: ${chapter.course.name} (${chapter.course.tier}) - ${chapter.name}`);

    for (const video of motionVideos) {
      await prisma.video.create({
        data: {
          title: video.title,
          youtubeUrl: video.youtubeUrl,
          videoType: "ANIMATED_VIDEO",
          language: video.language,
          isFree: chapter.course.tier === "FREE",
          displayOrder: video.displayOrder,
          chapterId: chapter.id,
        },
      });
    }
    console.log(`  Added ${motionVideos.length} videos (${motionVideos.length / 2} Hindi + ${motionVideos.length / 2} English)`);
  }

  console.log("\nDone!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
