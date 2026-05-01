const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Comprehensive Physics Content (Videos, Questions, Notes)...\n");

  // 1. Fetch all Physics chapters
  const physicsChapters = await prisma.chapter.findMany({
    where: { subject: { name: "Physics" } },
    include: { subject: { include: { class: true } } }
  });

  console.log(`Found ${physicsChapters.length} Physics chapters.`);

  // 2. Seed "Important Questions" as Notes
  console.log("Adding 'Important Questions' to Notes tab...");
  let notesCount = 0;
  for (const ch of physicsChapters) {
    await prisma.note.upsert({
      where: { id: `note-impq-${ch.id}` },
      update: {},
      create: {
        id: `note-impq-${ch.id}`,
        chapterId: ch.id,
        title: "Important Questions & Solutions",
        pdfUrl: "/notes/important-questions.pdf", // Placeholder
      }
    });
    notesCount++;
  }
  console.log(`Added ${notesCount} Important Questions notes.`);

  // 3. Seed Vimeo Videos (using data from previous turn)
  const vimeoData = {
    "Motion": [
      { hi: "1186840222", en: "1187966712", title: "Scalars vs vectors" },
      { hi: "1186840222", en: "1187966712", title: "Distance vs displacement" },
      { hi: "1183254383", en: "1187990084", title: "Velocity & acceleration" },
    ],
    "Force and Laws of Motion": [
      { hi: "1186840343", en: "1187966847", title: "Force concept" },
      { hi: "1186694905", en: "1187273587", title: "Newton's Laws of Motion" },
      { hi: "1186840627", en: "1187967045", title: "Friction basics" },
    ],
    "Work and Energy": [
      { hi: "1186695506", en: "1187275042", title: "Work" },
      { hi: "1186695554", en: "1187274892", title: "Energy types" },
      { hi: "1186695554", en: "1187274892", title: "Conservation of Energy" },
    ],
    "Electricity": [
      { hi: "1182892651", en: "1187598680", title: "Charge" },
      { hi: "1183984206", en: "1187195457", title: "Current" },
      { hi: "1183984372", en: "1187195604", title: "Ohm's Law" },
    ]
  };

  console.log("\nSeeding Vimeo videos...");
  let videoCount = 0;
  for (const [chName, videos] of Object.entries(vimeoData)) {
    const matched = physicsChapters.filter(c => c.name.toLowerCase().includes(chName.toLowerCase()));
    for (const ch of matched) {
      for (let i = 0; i < videos.length; i++) {
        const v = videos[i];
        if (v.hi) {
          await prisma.video.upsert({
            where: { id: `v-hi-${ch.id}-${i}` },
            update: { vimeoVideoId: v.hi },
            create: { id: `v-hi-${ch.id}-${i}`, chapterId: ch.id, title: v.title, vimeoVideoId: v.hi, language: "HINDI", order: i+1, type: "ANIMATED_VIDEO" }
          });
          videoCount++;
        }
        if (v.en) {
          await prisma.video.upsert({
            where: { id: `v-en-${ch.id}-${i}` },
            update: { vimeoVideoId: v.en },
            create: { id: `v-en-${ch.id}-${i}`, chapterId: ch.id, title: v.title, vimeoVideoId: v.en, language: "ENGLISH", order: i+1, type: "ANIMATED_VIDEO" }
          });
          videoCount++;
        }
      }
    }
  }
  console.log(`Seeded ${videoCount} Vimeo videos.`);

  console.log("\nDone! Content unified for Physics subjects.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
