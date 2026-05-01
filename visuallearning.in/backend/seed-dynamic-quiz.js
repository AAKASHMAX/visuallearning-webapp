const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Sample questions extracted from 11th physics seed file
const physicsQuestions = [
  {
    chapterMatch: "Units and Measurements",
    questions: [
      { questionText: "Which of the following is a base SI unit?", optionA: "Newton", optionB: "Joule", optionC: "Candela", optionD: "Watt", correctOption: "C", solution: "Candela is the SI base unit for luminous intensity." },
      { questionText: "Dimensions of force are:", optionA: "MLT-1", optionB: "MLT-2", optionC: "ML2T-2", optionD: "M2LT-2", correctOption: "B", solution: "Force = mass x acceleration = [M][LT-2] = [MLT-2]." },
    ]
  },
  {
    chapterMatch: "Motion",
    questions: [
      { questionText: "Slope of velocity-time graph represents:", optionA: "Distance", optionB: "Displacement", optionC: "Acceleration", optionD: "Speed", correctOption: "C", solution: "The slope of a v-t graph gives the rate of change of velocity, which is acceleration." },
      { questionText: "Area under acceleration-time graph gives:", optionA: "Displacement", optionB: "Change in velocity", optionC: "Distance", optionD: "Speed", correctOption: "B", solution: "The integral of acceleration over time gives the change in velocity." },
    ]
  },
  {
    chapterMatch: "Law",
    questions: [
      { questionText: "Newton's first law defines:", optionA: "Force", optionB: "Inertia", optionC: "Momentum", optionD: "Energy", correctOption: "B", solution: "The first law is also known as the Law of Inertia." },
    ]
  },
  {
    chapterMatch: "Electric",
    questions: [
      { questionText: "The SI unit of electric potential is:", optionA: "Ampere", optionB: "Coulomb", optionC: "Volt", optionD: "Ohm", correctOption: "C", solution: "Electric potential is measured in Volts (V)." },
    ]
  }
];

async function main() {
  console.log("Seeding Dynamic Quiz Questions...\n");

  const chapters = await prisma.chapter.findMany({
    where: { subject: { name: "Physics" } }
  });

  let count = 0;
  for (const qSet of physicsQuestions) {
    const matched = chapters.filter(c => c.name.toLowerCase().includes(qSet.chapterMatch.toLowerCase()));
    
    for (const ch of matched) {
      console.log(`Adding questions to: ${ch.name}`);
      for (const q of qSet.questions) {
        await prisma.question.create({
          data: {
            chapterId: ch.id,
            ...q
          }
        });
        count++;
      }
    }
  }

  console.log(`\nSeeded ${count} quiz questions.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
