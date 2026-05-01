// Run: DATABASE_URL="your-neon-url" node seed-bridge-course.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const bridgeChapters = [
  {
    name: "Language of Physics",
    topics: [
      { title: "Physical quantities", vimeoHindi: null, vimeoEnglish: null },
      { title: "Units & dimensions", vimeoHindi: null, vimeoEnglish: null },
      { title: "Scalars vs vectors", vimeoHindi: "https://vimeo.com/1186840222", vimeoEnglish: "https://vimeo.com/1187966712" },
      { title: "Graph interpretation", vimeoHindi: null, vimeoEnglish: null },
    ],
  },
  {
    name: "Motion & Change",
    topics: [
      { title: "Distance vs displacement", vimeoHindi: "https://vimeo.com/1186840222", vimeoEnglish: "https://vimeo.com/1187966712" },
      { title: "Velocity & acceleration", vimeoHindi: "https://vimeo.com/1183254383", vimeoEnglish: "https://vimeo.com/1187990084" },
      { title: "Graphs (v-t, x-t)", vimeoHindi: null, vimeoEnglish: null },
    ],
  },
  {
    name: "Forces & Laws",
    topics: [
      { title: "Force concept", vimeoHindi: "https://vimeo.com/1186840343", vimeoEnglish: "https://vimeo.com/1187966847" },
      { title: "Newton's Laws of Motion", vimeoHindi: "https://vimeo.com/1186694905", vimeoEnglish: "https://vimeo.com/1187273587" },
      { title: "Free body diagrams", vimeoHindi: null, vimeoEnglish: null },
      { title: "Friction basics", vimeoHindi: "https://vimeo.com/1186840627", vimeoEnglish: "https://vimeo.com/1187967045" },
    ],
  },
  {
    name: "Energy Thinking",
    topics: [
      { title: "Work", vimeoHindi: "https://vimeo.com/1186695506", vimeoEnglish: "https://vimeo.com/1187275042" },
      { title: "Energy types", vimeoHindi: "https://vimeo.com/1186695554", vimeoEnglish: "https://vimeo.com/1187274892" },
      { title: "Conservation of Energy", vimeoHindi: "https://vimeo.com/1186695554", vimeoEnglish: "https://vimeo.com/1187274892" },
      { title: "Power", vimeoHindi: null, vimeoEnglish: null },
    ],
  },
  {
    name: "Momentum & Collisions",
    topics: [
      { title: "Momentum", vimeoHindi: null, vimeoEnglish: null },
      { title: "Impulse", vimeoHindi: "https://vimeo.com/1186840599", vimeoEnglish: "https://vimeo.com/1187967007" },
      { title: "Conservation laws", vimeoHindi: "https://vimeo.com/1186695210", vimeoEnglish: "https://vimeo.com/1187570930" },
    ],
  },
  {
    name: "Rotational Basics",
    topics: [
      { title: "Torque", vimeoHindi: null, vimeoEnglish: null },
      { title: "Angular motion", vimeoHindi: "https://vimeo.com/1186694905", vimeoEnglish: "https://vimeo.com/1187273587" },
      { title: "Moment of inertia (basic intuition)", vimeoHindi: "https://vimeo.com/1186840413", vimeoEnglish: "https://vimeo.com/1187966899" },
    ],
  },
  {
    name: "Fluids & Pressure",
    topics: [
      { title: "Pressure", vimeoHindi: "https://vimeo.com/1186695469", vimeoEnglish: "https://vimeo.com/1187274631" },
      { title: "Pascal's Law", vimeoHindi: "https://vimeo.com/1183984372", vimeoEnglish: "https://vimeo.com/1187195604" },
      { title: "Archimedes' Principle", vimeoHindi: "https://vimeo.com/1186695318", vimeoEnglish: "https://vimeo.com/1187273990" },
    ],
  },
  {
    name: "Waves & Oscillations",
    topics: [
      { title: "Basic wave idea", vimeoHindi: null, vimeoEnglish: null },
      { title: "SHM intuition", vimeoHindi: null, vimeoEnglish: null },
      { title: "Sound basics", vimeoHindi: "https://vimeo.com/1186695903", vimeoEnglish: "https://vimeo.com/1187571387" },
    ],
  },
  {
    name: "Heat & Thermodynamics",
    topics: [
      { title: "Temperature vs heat", vimeoHindi: "https://vimeo.com/1186852595", vimeoEnglish: "https://vimeo.com/1188042451" },
      { title: "First Law of Thermodynamics", vimeoHindi: "https://vimeo.com/1186853131", vimeoEnglish: null },
      { title: "Ideal gas intuition", vimeoHindi: "https://vimeo.com/1186852791", vimeoEnglish: "https://vimeo.com/1188042586" },
    ],
  },
  {
    name: "Electricity Foundations",
    topics: [
      { title: "Charge", vimeoHindi: "https://vimeo.com/1182892651", vimeoEnglish: "https://vimeo.com/1187598680" },
      { title: "Current", vimeoHindi: "https://vimeo.com/1183984206", vimeoEnglish: "https://vimeo.com/1187195457" },
      { title: "Voltage", vimeoHindi: null, vimeoEnglish: null },
      { title: "Ohm's Law", vimeoHindi: "https://vimeo.com/1183984372", vimeoEnglish: "https://vimeo.com/1187195604" },
    ],
  },
];

async function main() {
  console.log("Creating Physics Bridge Course...\n");

  // 1. Create the Bridge Course
  const bridgeCourse = await prisma.course.create({
    data: {
      name: "Physics Bridge Course",
      description:
        "A foundational bridge course designed to build strong physics intuition. Covers essential concepts from mechanics to electricity, preparing you for advanced study.",
      tier: "BRIDGE",
      displayOrder: 3,
    },
  });
  console.log("Created Bridge course:", bridgeCourse.id);

  let totalVideos = 0;
  let skippedTopics = 0;

  // 2. Create chapters and their videos
  for (let i = 0; i < bridgeChapters.length; i++) {
    const ch = bridgeChapters[i];

    const chapter = await prisma.chapter.create({
      data: {
        name: ch.name,
        displayOrder: i + 1,
        courseId: bridgeCourse.id,
      },
    });
    console.log(`\n  Chapter ${i + 1}: ${ch.name} (${chapter.id})`);

    let videoOrder = 1;

    for (const topic of ch.topics) {
      const hasHindi = topic.vimeoHindi !== null;
      const hasEnglish = topic.vimeoEnglish !== null;

      if (!hasHindi && !hasEnglish) {
        console.log(`    ⚠ Skipped "${topic.title}" (no Vimeo links)`);
        skippedTopics++;
        continue;
      }

      // Create Hindi video if available
      if (hasHindi) {
        await prisma.video.create({
          data: {
            title: topic.title,
            youtubeUrl: topic.vimeoHindi,
            videoType: "ANIMATED_VIDEO",
            language: "HINDI",
            isFree: false,
            displayOrder: videoOrder,
            chapterId: chapter.id,
          },
        });
        totalVideos++;
      }

      // Create English video if available
      if (hasEnglish) {
        await prisma.video.create({
          data: {
            title: topic.title,
            youtubeUrl: topic.vimeoEnglish,
            videoType: "ANIMATED_VIDEO",
            language: "ENGLISH",
            isFree: false,
            displayOrder: videoOrder,
            chapterId: chapter.id,
          },
        });
        totalVideos++;
      }

      const langs = [hasHindi ? "Hindi" : null, hasEnglish ? "English" : null]
        .filter(Boolean)
        .join(" + ");
      console.log(`    ✓ "${topic.title}" (${langs})`);
      videoOrder++;
    }
  }

  console.log("\n═══════════════════════════════════════");
  console.log("Done! Summary:");
  console.log(`  Course: Physics Bridge Course (${bridgeCourse.id})`);
  console.log(`  Chapters: ${bridgeChapters.length}`);
  console.log(`  Videos created: ${totalVideos}`);
  console.log(`  Topics skipped (no links): ${skippedTopics}`);
  console.log("═══════════════════════════════════════");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
