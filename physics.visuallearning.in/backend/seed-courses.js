// Run: DATABASE_URL="your-neon-url" node seed-courses.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const basicChapters = [
  // Class 9
  "Motion",
  "Force and Laws of Motion",
  "Gravitation",
  "Work and Energy",
  "Sound",
  // Class 10
  "Light (Reflection & Refraction)",
  "Human Eye & Defects",
  "Electricity",
  "Magnetism",
  // Class 11
  "Units & Measurements",
  "Kinematics",
  "Laws of Motion",
  "Work, Energy & Power",
  // Class 12
  "Electrostatics",
  "Current Electricity",
  "Semiconductors",
];

const advanceChapters = [
  // Class 9
  "Motion",
  "Force and Laws of Motion",
  "Gravitation",
  "Work and Energy",
  "Sound",
  // Class 10
  "Light (Reflection & Refraction)",
  "Human Eye & Defects",
  "Electricity",
  "Magnetism",
  // Class 11
  "Units & Measurements",
  "Kinematics",
  "Laws of Motion",
  "Work, Energy & Power",
  "Rotational Motion",
  "Gravitation (Advanced)",
  "Properties of Matter",
  "Thermodynamics",
  "Oscillations (SHM)",
  "Waves",
  // Class 12
  "Electrostatics",
  "Current Electricity",
  "Semiconductors",
  "Magnetism & EMI",
  "Alternating Current",
  "Ray Optics & Wave Optics",
  "Modern Physics",
  "Semiconductors (Advanced)",
];

async function main() {
  console.log("Creating courses and chapters...\n");

  // Create Basic course
  const basicCourse = await prisma.course.create({
    data: {
      name: "Basic Physics",
      description: "Complete chapter-wise video lectures with notes and quizzes. Build strong physics fundamentals from Class 9 to 12.",
      tier: "BASIC",
      displayOrder: 1,
    },
  });
  console.log("Created Basic course:", basicCourse.id);

  // Create Basic chapters
  for (let i = 0; i < basicChapters.length; i++) {
    await prisma.chapter.create({
      data: {
        name: basicChapters[i],
        displayOrder: i + 1,
        courseId: basicCourse.id,
      },
    });
  }
  console.log(`Added ${basicChapters.length} chapters to Basic course`);

  // Create Advance course
  const advanceCourse = await prisma.course.create({
    data: {
      name: "Advance Physics",
      description: "Everything in Basic plus advanced topics — rotational motion, thermodynamics, wave optics, modern physics, and more.",
      tier: "ADVANCE",
      displayOrder: 2,
    },
  });
  console.log("\nCreated Advance course:", advanceCourse.id);

  // Create Advance chapters
  for (let i = 0; i < advanceChapters.length; i++) {
    await prisma.chapter.create({
      data: {
        name: advanceChapters[i],
        displayOrder: i + 1,
        courseId: advanceCourse.id,
      },
    });
  }
  console.log(`Added ${advanceChapters.length} chapters to Advance course`);

  console.log("\nDone! Summary:");
  console.log(`  Basic: ${basicChapters.length} chapters`);
  console.log(`  Advance: ${advanceChapters.length} chapters`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
