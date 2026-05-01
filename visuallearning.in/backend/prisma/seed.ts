import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@visuallearning.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@visuallearning.com",
      password: adminPassword,
      role: "ADMIN",
      emailVerified: true,
    },
  });
  console.log("Admin user created:", admin.email);

  // Create demo student
  const studentPassword = await bcrypt.hash("student123", 12);
  await prisma.user.upsert({
    where: { email: "student@demo.com" },
    update: {},
    create: {
      name: "Demo Student",
      email: "student@demo.com",
      password: studentPassword,
      role: "STUDENT",
      emailVerified: true,
    },
  });
  console.log("Demo student created");

  // Create classes
  const classData = [
    { name: "Class 9", order: 9 },
    { name: "Class 10", order: 10 },
    { name: "Class 11", order: 11 },
    { name: "Class 12", order: 12 },
  ];

  const classes: Record<string, string> = {};
  for (const c of classData) {
    const created = await prisma.class.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
    classes[c.name] = created.id;
  }
  console.log("Classes created");

  // Create subjects for each class
  const subjectNames = ["Physics", "Chemistry", "Biology", "Mathematics"];
  const subjectIcons: Record<string, string> = {
    Physics: "atom",
    Chemistry: "flask-conical",
    Biology: "dna",
    Mathematics: "calculator",
  };

  for (const className of Object.keys(classes)) {
    for (const subName of subjectNames) {
      const subject = await prisma.subject.upsert({
        where: {
          classId_name: { classId: classes[className], name: subName },
        },
        update: {},
        create: {
          classId: classes[className],
          name: subName,
          icon: subjectIcons[subName],
        },
      });

      // Create sample chapters for each subject
      const chapterNames = getChapters(subName, className);
      for (let i = 0; i < chapterNames.length; i++) {
        const chapter = await prisma.chapter.create({
          data: {
            subjectId: subject.id,
            name: chapterNames[i],
            order: i + 1,
          },
        });

        // Create sample videos for first 2 chapters
        if (i < 2) {
          await prisma.video.createMany({
            data: [
              {
                chapterId: chapter.id,
                title: `${chapterNames[i]} - Introduction`,
                youtubeVideoId: "dQw4w9WgXcQ",
                duration: "15:30",
                order: 1,
                isFree: i === 0,
              },
              {
                chapterId: chapter.id,
                title: `${chapterNames[i]} - Concepts & Theory`,
                youtubeVideoId: "dQw4w9WgXcQ",
                duration: "22:45",
                order: 2,
                isFree: false,
              },
              {
                chapterId: chapter.id,
                title: `${chapterNames[i]} - Problem Solving`,
                youtubeVideoId: "dQw4w9WgXcQ",
                duration: "18:10",
                order: 3,
                isFree: false,
              },
            ],
          });

          // Create sample note
          await prisma.note.create({
            data: {
              chapterId: chapter.id,
              title: `${chapterNames[i]} - Notes PDF`,
              pdfUrl: "/notes/sample.pdf",
            },
          });

          // Create sample questions
          await prisma.question.createMany({
            data: [
              {
                chapterId: chapter.id,
                questionText: `Sample question 1 for ${chapterNames[i]}`,
                optionA: "Option A",
                optionB: "Option B",
                optionC: "Option C",
                optionD: "Option D",
                correctOption: "A",
                solution: "This is the detailed solution for question 1.",
              },
              {
                chapterId: chapter.id,
                questionText: `Sample question 2 for ${chapterNames[i]}`,
                optionA: "Option A",
                optionB: "Option B",
                optionC: "Option C",
                optionD: "Option D",
                correctOption: "B",
                solution: "This is the detailed solution for question 2.",
              },
            ],
          });
        }
      }
    }
  }

  console.log("Subjects, chapters, videos, notes, and questions created");
  console.log("Seeding complete!");
}

function getChapters(subject: string, className: string): string[] {
  const chapters: Record<string, Record<string, string[]>> = {
    Physics: {
      "Class 9": ["Motion", "Force and Laws of Motion", "Gravitation", "Work and Energy", "Sound"],
      "Class 10": ["Light - Reflection", "Light - Refraction", "Human Eye", "Electricity", "Magnetic Effects of Current"],
      "Class 11": ["Units and Measurements", "Motion in a Straight Line", "Motion in a Plane", "Laws of Motion", "Work, Energy and Power"],
      "Class 12": ["Electric Charges and Fields", "Electrostatic Potential", "Current Electricity", "Moving Charges and Magnetism", "Electromagnetic Induction"],
    },
    Chemistry: {
      "Class 9": ["Matter in Our Surroundings", "Is Matter Around Us Pure", "Atoms and Molecules", "Structure of the Atom"],
      "Class 10": ["Chemical Reactions", "Acids, Bases and Salts", "Metals and Non-metals", "Carbon and its Compounds", "Periodic Classification"],
      "Class 11": ["Some Basic Concepts", "Structure of Atom", "Classification of Elements", "Chemical Bonding", "Thermodynamics"],
      "Class 12": ["Solutions", "Electrochemistry", "Chemical Kinetics", "Surface Chemistry", "Coordination Compounds"],
    },
    Biology: {
      "Class 9": ["The Fundamental Unit of Life", "Tissues", "Diversity in Living Organisms", "Improvement in Food Resources"],
      "Class 10": ["Life Processes", "Control and Coordination", "How do Organisms Reproduce", "Heredity and Evolution"],
      "Class 11": ["The Living World", "Biological Classification", "Plant Kingdom", "Animal Kingdom", "Cell Structure"],
      "Class 12": ["Reproduction in Organisms", "Human Reproduction", "Reproductive Health", "Principles of Inheritance", "Molecular Basis of Inheritance"],
    },
    Mathematics: {
      "Class 9": ["Number Systems", "Polynomials", "Coordinate Geometry", "Linear Equations", "Triangles"],
      "Class 10": ["Real Numbers", "Polynomials", "Pair of Linear Equations", "Quadratic Equations", "Arithmetic Progressions"],
      "Class 11": ["Sets", "Relations and Functions", "Trigonometric Functions", "Complex Numbers", "Linear Inequalities"],
      "Class 12": ["Relations and Functions", "Inverse Trigonometric Functions", "Matrices", "Determinants", "Continuity and Differentiability"],
    },
  };

  return chapters[subject]?.[className] ?? ["Chapter 1", "Chapter 2", "Chapter 3"];
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
