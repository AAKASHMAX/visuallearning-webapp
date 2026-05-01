const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const bridgeData = [
  {
    name: "Language of Physics",
    topics: [
      { title: "Physical quantities", vimeoHindi: null, vimeoEnglish: null },
      { title: "Units & dimensions", vimeoHindi: null, vimeoEnglish: null },
      { title: "Scalars vs vectors", vimeoHindi: "1186840222", vimeoEnglish: "1187966712" },
      { title: "Graph interpretation", vimeoHindi: null, vimeoEnglish: null },
    ],
  },
  {
    name: "Motion & Change",
    topics: [
      { title: "Distance vs displacement", vimeoHindi: "1186840222", vimeoEnglish: "1187966712" },
      { title: "Velocity & acceleration", vimeoHindi: "1183254383", vimeoEnglish: "1187990084" },
      { title: "Graphs (v-t, x-t)", vimeoHindi: null, vimeoEnglish: null },
    ],
  },
  {
    name: "Forces & Laws",
    topics: [
      { title: "Force concept", vimeoHindi: "1186840343", vimeoEnglish: "1187966847" },
      { title: "Newton's Laws of Motion", vimeoHindi: "1186694905", vimeoEnglish: "1187273587" },
      { title: "Free body diagrams", vimeoHindi: null, vimeoEnglish: null },
      { title: "Friction basics", vimeoHindi: "1186840627", vimeoEnglish: "1187967045" },
    ],
  },
  {
    name: "Energy Thinking",
    topics: [
      { title: "Work", vimeoHindi: "1186695506", vimeoEnglish: "1187275042" },
      { title: "Energy types", vimeoHindi: "1186695554", vimeoEnglish: "1187274892" },
      { title: "Conservation of Energy", vimeoHindi: "1186695554", vimeoEnglish: "1187274892" },
      { title: "Power", vimeoHindi: null, vimeoEnglish: null },
    ],
  },
  {
    name: "Momentum & Collisions",
    topics: [
      { title: "Momentum", vimeoHindi: null, vimeoEnglish: null },
      { title: "Impulse", vimeoHindi: "1186840599", vimeoEnglish: "1187967007" },
      { title: "Conservation laws", vimeoHindi: "1186695210", vimeoEnglish: "1187570930" },
    ],
  },
  {
    name: "Rotational Basics",
    topics: [
      { title: "Torque", vimeoHindi: null, vimeoEnglish: null },
      { title: "Angular motion", vimeoHindi: "1186694905", vimeoEnglish: "1187273587" },
      { title: "Moment of inertia (basic intuition)", vimeoHindi: "1186840413", vimeoEnglish: "1187966899" },
    ],
  },
  {
    name: "Fluids & Pressure",
    topics: [
      { title: "Pressure", vimeoHindi: "1186695469", vimeoEnglish: "1187274631" },
      { title: "Pascal's Law", vimeoHindi: "1183984372", vimeoEnglish: "1187195604" },
      { title: "Archimedes' Principle", vimeoHindi: "1186695318", vimeoEnglish: "1187273990" },
    ],
  },
  {
    name: "Waves & Oscillations",
    topics: [
      { title: "Basic wave idea", vimeoHindi: null, vimeoEnglish: null },
      { title: "SHM intuition", vimeoHindi: null, vimeoEnglish: null },
      { title: "Sound basics", vimeoHindi: "1186695903", vimeoEnglish: "1187571387" },
    ],
  },
  {
    name: "Heat & Thermodynamics",
    topics: [
      { title: "Temperature vs heat", vimeoHindi: "1186852595", vimeoEnglish: "1188042451" },
      { title: "First Law of Thermodynamics", vimeoHindi: "1186853131", vimeoEnglish: null },
      { title: "Ideal gas intuition", vimeoHindi: "1186852791", vimeoEnglish: "1188042586" },
    ],
  },
  {
    name: "Electricity Foundations",
    topics: [
      { title: "Charge", vimeoHindi: "1182892651", vimeoEnglish: "1187598680" },
      { title: "Current", vimeoHindi: "1183984206", vimeoEnglish: "1187195457" },
      { title: "Voltage", vimeoHindi: null, vimeoEnglish: null },
      { title: "Ohm's Law", vimeoHindi: "1183984372", vimeoEnglish: "1187195604" },
    ],
  },
];

async function main() {
  console.log("Seeding Vimeo videos to VisualLearning chapters...\n");

  const chaptersInDb = await prisma.chapter.findMany({
    include: { subject: { include: { class: true } } }
  });

  console.log(`Found ${chaptersInDb.length} chapters in DB.`);

  let totalVideos = 0;

  const manualMap = {
    "Forces & Laws": "Force and Laws of Motion",
    "Energy Thinking": "Work and Energy",
    "Fluids & Pressure": "Pressure",
    "Rotational Basics": "Rotational Motion",
    "Electricity Foundations": "Electricity",
    "Motion & Change": "Motion"
  };

  for (const bridgeCh of bridgeData) {
    const bridgeName = manualMap[bridgeCh.name] || bridgeCh.name;
    const normalize = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
    const bridgeNorm = normalize(bridgeName);

    const matchedChapters = chaptersInDb.filter(c => {
      const dbNorm = normalize(c.name);
      return c.subject.name === "Physics" && 
        (dbNorm.includes(bridgeNorm) || bridgeNorm.includes(dbNorm));
    });

    if (matchedChapters.length === 0) {
      console.log(`⚠ No match found for chapter: ${bridgeCh.name}`);
      continue;
    }

    for (const chapter of matchedChapters) {
      console.log(`\nProcessing: ${chapter.subject.class.name} - ${chapter.name} (${chapter.id})`);
      
      let videoOrder = 1;
      for (const topic of bridgeCh.topics) {
        if (!topic.vimeoHindi && !topic.vimeoEnglish) continue;

        // Create Hindi Video
        if (topic.vimeoHindi) {
          await prisma.video.upsert({
            where: { id: `vimeo-hi-${chapter.id}-${videoOrder}` },
            update: { vimeoVideoId: topic.vimeoHindi },
            create: {
              id: `vimeo-hi-${chapter.id}-${videoOrder}`,
              chapterId: chapter.id,
              title: topic.title,
              vimeoVideoId: topic.vimeoHindi,
              language: "HINDI",
              order: videoOrder,
              isFree: false,
              type: "ANIMATED_VIDEO"
            }
          });
          totalVideos++;
        }

        // Create English Video
        if (topic.vimeoEnglish) {
          await prisma.video.upsert({
            where: { id: `vimeo-en-${chapter.id}-${videoOrder}` },
            update: { vimeoVideoId: topic.vimeoEnglish },
            create: {
              id: `vimeo-en-${chapter.id}-${videoOrder}`,
              chapterId: chapter.id,
              title: topic.title,
              vimeoVideoId: topic.vimeoEnglish,
              language: "ENGLISH",
              order: videoOrder,
              isFree: false,
              type: "ANIMATED_VIDEO"
            }
          });
          totalVideos++;
        }
        videoOrder++;
      }
    }
  }

  console.log(`\nSuccessfully seeded ${totalVideos} Vimeo videos.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
