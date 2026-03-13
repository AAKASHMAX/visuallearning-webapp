const { PrismaClient } = require("@prisma/client");
const fs = require("fs");

const prisma = new PrismaClient();

async function main() {
  const data = JSON.parse(fs.readFileSync("import-data-12th.json", "utf-8"));

  // Only delete Class 12 Physics chapters
  const physicsSubjectId = data[0].dbSubjectId;
  console.log("Deleting existing Class 12 Physics chapters...");

  const deleted = await prisma.chapter.deleteMany({
    where: { subjectId: physicsSubjectId },
  });
  console.log(`Deleted ${deleted.count} existing chapters\n`);

  let totalVideos = 0;
  let totalComingSoon = 0;
  let totalNotes = 0;

  for (const ch of data) {
    const chapter = await prisma.chapter.create({
      data: {
        subjectId: ch.dbSubjectId,
        name: ch.name,
        order: ch.sequence,
      },
    });
    console.log(`Created chapter: ${ch.name} (order: ${ch.sequence})`);

    for (let i = 0; i < ch.topics.length; i++) {
      const topic = ch.topics[i];
      const hasEnglish = !!topic.videoIdEnglish;
      const hasHindi = !!topic.videoIdHindi;
      const isFree = i === 0;

      if (hasEnglish) {
        await prisma.video.create({
          data: {
            chapterId: chapter.id,
            title: topic.topicName,
            youtubeVideoId: topic.videoIdEnglish,
            language: "ENGLISH",
            order: i + 1,
            isFree: isFree,
            type: "ANIMATED_VIDEO",
          },
        });
        totalVideos++;
      }

      if (hasHindi) {
        await prisma.video.create({
          data: {
            chapterId: chapter.id,
            title: topic.topicName,
            youtubeVideoId: topic.videoIdHindi,
            language: "HINDI",
            order: i + 1,
            isFree: isFree,
            type: "ANIMATED_VIDEO",
          },
        });
        totalVideos++;
      }

      // Coming soon - no video links at all, create placeholder in English
      if (!hasEnglish && !hasHindi) {
        await prisma.video.create({
          data: {
            chapterId: chapter.id,
            title: topic.topicName,
            youtubeVideoId: "",
            language: "ENGLISH",
            order: i + 1,
            isFree: false,
            type: "ANIMATED_VIDEO",
          },
        });
        totalComingSoon++;
      }
    }

    if (ch.notesPdf) {
      await prisma.note.create({
        data: {
          chapterId: chapter.id,
          title: `${ch.name} - Notes`,
          pdfUrl: ch.notesPdf,
        },
      });
      totalNotes++;
    }
  }

  console.log(`\n=== Import Complete (Class 12 Physics) ===`);
  console.log(`Chapters: ${data.length}`);
  console.log(`Videos: ${totalVideos} (English + Hindi)`);
  console.log(`Coming Soon: ${totalComingSoon} topics`);
  console.log(`Notes: ${totalNotes}`);
  console.log(`First video of each chapter marked FREE`);
}

main()
  .catch((e) => { console.error("Import failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
