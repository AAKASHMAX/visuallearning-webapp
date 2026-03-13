const { PrismaClient } = require("@prisma/client");
const fs = require("fs");

const prisma = new PrismaClient();

async function main() {
  const data = JSON.parse(fs.readFileSync("import-data.json", "utf-8"));

  // Step 1: Delete existing Class 9 Physics, Chemistry, Biology chapters (cascades to videos & notes)
  const subjectIds = [...new Set(data.map((d) => d.dbSubjectId))];
  console.log("Deleting existing chapters for subjects:", subjectIds.length);

  const deleted = await prisma.chapter.deleteMany({
    where: { subjectId: { in: subjectIds } },
  });
  console.log(`Deleted ${deleted.count} existing chapters (with videos & notes)\n`);

  // Step 2: Create chapters, videos, and notes
  let totalVideos = 0;
  let totalNotes = 0;

  for (const ch of data) {
    // Create chapter
    const chapter = await prisma.chapter.create({
      data: {
        subjectId: ch.dbSubjectId,
        name: ch.name,
        order: ch.sequence,
      },
    });
    console.log(`Created chapter: ${ch.name} (order: ${ch.sequence})`);

    // Create videos for each topic
    for (let i = 0; i < ch.topics.length; i++) {
      const topic = ch.topics[i];
      const isFree = i === 0; // First topic of each chapter is free

      // English video
      if (topic.videoIdEnglish) {
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

      // Hindi video
      if (topic.videoIdHindi) {
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
    }

    // Create note from ChapterName sheet NotesPDF
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

  console.log(`\n=== Import Complete ===`);
  console.log(`Chapters: ${data.length}`);
  console.log(`Videos: ${totalVideos} (English + Hindi)`);
  console.log(`Notes: ${totalNotes}`);
  console.log(`First video of each chapter marked FREE`);
}

main()
  .catch((e) => {
    console.error("Import failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
