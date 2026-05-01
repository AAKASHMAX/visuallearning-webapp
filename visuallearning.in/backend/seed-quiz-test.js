const { PrismaClient } = require("@prisma/client");

// Force the production database URL (override .env which may point to localhost)
const PROD_URL =
  "postgresql://neondb_owner:npg_qLi6vFODMz4k@ep-polished-cell-a18eh31p-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const DATABASE_URL = process.env.SEED_DATABASE_URL || PROD_URL;

// Set env var before PrismaClient init so it overrides .env file
process.env.DATABASE_URL = DATABASE_URL;

const prisma = new PrismaClient();

const CHAPTER_ID = "cmmos51yc0001uuz8ecig0bew";

const questions = [
  {
    questionText:
      "Two point charges of +3 \u00B5C and +3 \u00B5C are placed 30 cm apart in vacuum. What is the magnitude of the electrostatic force between them?",
    optionA: "0.9 N",
    optionB: "0.3 N",
    optionC: "2.7 N",
    optionD: "0.09 N",
    correctOption: "A",
    solution:
      "Using Coulomb's law: F = kq\u2081q\u2082/r\u00B2 = 9\u00D710\u2079 \u00D7 3\u00D710\u207B\u2076 \u00D7 3\u00D710\u207B\u2076 / (0.3)\u00B2 = 9\u00D710\u2079 \u00D7 9\u00D710\u207B\u00B9\u00B2 / 0.09 = 81\u00D710\u207B\u00B3 / 0.09 = 0.9 N.",
  },
  {
    questionText:
      "The SI unit of electric field intensity is:",
    optionA: "N/C",
    optionB: "C/N",
    optionC: "J/C",
    optionD: "N\u00B7m\u00B2/C",
    correctOption: "A",
    solution:
      "Electric field intensity E = F/q. Its SI unit is newton per coulomb (N/C), which is also equivalent to V/m.",
  },
  {
    questionText:
      "A charge q is placed at the centre of a cube. The total electric flux through the cube is:",
    optionA: "q/\u03B5\u2080",
    optionB: "q/6\u03B5\u2080",
    optionC: "6q/\u03B5\u2080",
    optionD: "q/4\u03B5\u2080",
    correctOption: "A",
    solution:
      "By Gauss's law, the total electric flux through any closed surface enclosing charge q is \u03A6 = q/\u03B5\u2080, regardless of the shape of the surface.",
  },
  {
    questionText:
      "The electric field at a point on the axial line of a short electric dipole at distance r from the centre varies as:",
    optionA: "1/r\u00B3",
    optionB: "1/r\u00B2",
    optionC: "1/r",
    optionD: "1/r\u2074",
    correctOption: "A",
    solution:
      "For a short dipole, the axial electric field is E = 2kp/r\u00B3, so it varies as 1/r\u00B3.",
  },
  {
    questionText:
      "Which of the following is NOT a property of electric charge?",
    optionA: "Charge is always a multiple of e/3",
    optionB: "Charge is conserved",
    optionC: "Charge is additive",
    optionD: "Charge is quantized",
    correctOption: "A",
    solution:
      "Charge is quantized in integral multiples of e (1.6\u00D710\u207B\u00B9\u2079 C), not e/3. Fractional charges (quarks) do not exist freely. Conservation, additivity and quantization are all valid properties.",
  },
  {
    questionText:
      "The electric flux through a surface area dS with electric field E at an angle \u03B8 to the normal is:",
    optionA: "E dS cos\u03B8",
    optionB: "E dS sin\u03B8",
    optionC: "E dS tan\u03B8",
    optionD: "E dS",
    correctOption: "A",
    solution:
      "Electric flux d\u03A6 = E\u0305 \u00B7 dS\u0305 = E dS cos\u03B8, where \u03B8 is the angle between the electric field and the outward normal to the surface.",
  },
  {
    questionText:
      "Two charges +q and \u2013q separated by distance 2a form a dipole. The dipole moment p is:",
    optionA: "q \u00D7 2a",
    optionB: "q \u00D7 a",
    optionC: "2q \u00D7 a",
    optionD: "q / 2a",
    correctOption: "A",
    solution:
      "Electric dipole moment p = q \u00D7 d, where d is the separation between the charges. Here d = 2a, so p = q \u00D7 2a. Its direction is from \u2013q to +q.",
  },
  {
    questionText:
      "According to the superposition principle, the net force on a charge due to multiple charges is:",
    optionA: "The vector sum of individual forces",
    optionB: "The scalar sum of individual forces",
    optionC: "The product of individual forces",
    optionD: "The average of individual forces",
    correctOption: "A",
    solution:
      "The superposition principle states that the net force on a charge is the vector sum of the forces exerted on it by each of the other charges independently.",
  },
  {
    questionText:
      "A uniformly charged infinite plane sheet has surface charge density \u03C3. The electric field near the sheet is:",
    optionA: "\u03C3/2\u03B5\u2080",
    optionB: "\u03C3/\u03B5\u2080",
    optionC: "2\u03C3/\u03B5\u2080",
    optionD: "\u03C3/4\u03B5\u2080",
    correctOption: "A",
    solution:
      "Using Gauss's law with a cylindrical Gaussian surface, the electric field due to an infinite plane sheet of charge is E = \u03C3/2\u03B5\u2080, directed perpendicular to the sheet.",
  },
  {
    questionText:
      "Coulomb's law is valid for:",
    optionA: "Point charges at rest",
    optionB: "Extended bodies in motion",
    optionC: "Magnetic poles only",
    optionD: "Charges in motion",
    correctOption: "A",
    solution:
      "Coulomb's law applies strictly to point charges that are stationary (at rest). For moving charges, the full electromagnetic force (Lorentz force) must be used.",
  },
  {
    questionText:
      "If the distance between two charges is halved, the electrostatic force between them becomes:",
    optionA: "4 times",
    optionB: "2 times",
    optionC: "8 times",
    optionD: "1/4 times",
    correctOption: "A",
    solution:
      "F \u221D 1/r\u00B2. When r becomes r/2, F becomes kq\u2081q\u2082/(r/2)\u00B2 = 4kq\u2081q\u2082/r\u00B2 = 4F. The force becomes 4 times the original.",
  },
  {
    questionText:
      "The electric field inside a charged spherical shell is:",
    optionA: "Zero",
    optionB: "\u03C3/\u03B5\u2080",
    optionC: "Proportional to distance from centre",
    optionD: "Inversely proportional to distance from centre",
    correctOption: "A",
    solution:
      "By Gauss's law, the electric field inside a uniformly charged spherical shell is zero because the enclosed charge within a Gaussian surface inside the shell is zero.",
  },
  {
    questionText:
      "An electric dipole placed in a uniform electric field E experiences:",
    optionA: "A torque but no net force",
    optionB: "A net force but no torque",
    optionC: "Both net force and torque",
    optionD: "Neither force nor torque",
    correctOption: "A",
    solution:
      "In a uniform electric field, the forces on +q and \u2013q are equal and opposite, so the net force is zero. However, they form a couple, producing a torque \u03C4 = p \u00D7 E.",
  },
  {
    questionText:
      "The value of permittivity of free space \u03B5\u2080 is approximately:",
    optionA: "8.85 \u00D7 10\u207B\u00B9\u00B2 C\u00B2N\u207B\u00B9m\u207B\u00B2",
    optionB: "8.85 \u00D7 10\u207B\u2079 C\u00B2N\u207B\u00B9m\u207B\u00B2",
    optionC: "9 \u00D7 10\u2079 Nm\u00B2C\u207B\u00B2",
    optionD: "1.6 \u00D7 10\u207B\u00B9\u2079 C",
    correctOption: "A",
    solution:
      "\u03B5\u2080 = 8.854 \u00D7 10\u207B\u00B9\u00B2 C\u00B2N\u207B\u00B9m\u207B\u00B2. Option C is the value of Coulomb's constant k, and option D is the elementary charge e.",
  },
  {
    questionText:
      "The torque on an electric dipole of moment p in a uniform electric field E is maximum when the angle between p and E is:",
    optionA: "90\u00B0",
    optionB: "0\u00B0",
    optionC: "180\u00B0",
    optionD: "45\u00B0",
    correctOption: "A",
    solution:
      "Torque \u03C4 = pE sin\u03B8. It is maximum when sin\u03B8 = 1, i.e., \u03B8 = 90\u00B0.",
  },
  {
    questionText:
      "Electric field lines never:",
    optionA: "Form closed loops",
    optionB: "Start from positive charges",
    optionC: "End on negative charges",
    optionD: "Exist in free space",
    correctOption: "A",
    solution:
      "Electric field lines always start from positive charges and end on negative charges (or extend to infinity). They never form closed loops because the electrostatic field is conservative.",
  },
  {
    questionText:
      "A charge Q is placed at the centre of a cube. The flux through one face of the cube is:",
    optionA: "Q/6\u03B5\u2080",
    optionB: "Q/\u03B5\u2080",
    optionC: "Q/4\u03B5\u2080",
    optionD: "Q/12\u03B5\u2080",
    correctOption: "A",
    solution:
      "Total flux through the cube = Q/\u03B5\u2080 (Gauss's law). By symmetry, each of the 6 faces receives equal flux = Q/6\u03B5\u2080.",
  },
  {
    questionText:
      "The electric field on the equatorial line of a short dipole at distance r is:",
    optionA: "kp/r\u00B3",
    optionB: "2kp/r\u00B3",
    optionC: "kp/r\u00B2",
    optionD: "2kp/r\u00B2",
    correctOption: "A",
    solution:
      "For a short dipole, the equatorial field is E = kp/r\u00B3, which is half the axial field (2kp/r\u00B3). The direction is antiparallel to the dipole moment.",
  },
  {
    questionText:
      "When a dielectric medium of dielectric constant K is introduced between two charges, the Coulomb force:",
    optionA: "Decreases by a factor of K",
    optionB: "Increases by a factor of K",
    optionC: "Remains unchanged",
    optionD: "Becomes zero",
    correctOption: "A",
    solution:
      "In a medium with dielectric constant K, the force becomes F = kq\u2081q\u2082/(Kr\u00B2), so the force decreases by a factor of K compared to vacuum.",
  },
  {
    questionText:
      "The electric field due to an infinitely long straight wire with linear charge density \u03BB at perpendicular distance r is:",
    optionA: "\u03BB/2\u03C0\u03B5\u2080r",
    optionB: "\u03BB/4\u03C0\u03B5\u2080r\u00B2",
    optionC: "2\u03BB/\u03C0\u03B5\u2080r",
    optionD: "\u03BB/\u03B5\u2080r",
    correctOption: "A",
    solution:
      "Using Gauss's law with a cylindrical Gaussian surface of length L and radius r: E \u00D7 2\u03C0rL = \u03BBL/\u03B5\u2080, giving E = \u03BB/2\u03C0\u03B5\u2080r.",
  },
  {
    questionText:
      "The work done in rotating an electric dipole from angle \u03B8\u2081 to \u03B8\u2082 in a uniform electric field E is:",
    optionA: "pE(cos\u03B8\u2081 \u2013 cos\u03B8\u2082)",
    optionB: "pE(cos\u03B8\u2082 \u2013 cos\u03B8\u2081)",
    optionC: "pE(sin\u03B8\u2082 \u2013 sin\u03B8\u2081)",
    optionD: "pE sin\u03B8\u2082",
    correctOption: "A",
    solution:
      "Work done W = \u2013\u0394U = \u2013(U\u2082 \u2013 U\u2081) = \u2013(\u2013pE cos\u03B8\u2082 + pE cos\u03B8\u2081) = pE(cos\u03B8\u2081 \u2013 cos\u03B8\u2082).",
  },
  {
    questionText:
      "A positive charge is placed at the centre of a hollow metallic sphere. The electric field inside the metallic shell (within the metal) is:",
    optionA: "Zero",
    optionB: "kQ/r\u00B2 directed outward",
    optionC: "\u03C3/\u03B5\u2080",
    optionD: "kQ/r\u00B2 directed inward",
    correctOption: "A",
    solution:
      "Inside the material of a conductor, the electric field is always zero under electrostatic conditions. The charges redistribute on the surfaces to ensure this.",
  },
  {
    questionText:
      "Two equal and opposite charges +q and \u2013q are separated by distance d. At the midpoint of the line joining them, the electric field is:",
    optionA: "8kq/d\u00B2 directed from +q to \u2013q",
    optionB: "Zero",
    optionC: "4kq/d\u00B2 directed from +q to \u2013q",
    optionD: "kq/d\u00B2 directed from \u2013q to +q",
    correctOption: "A",
    solution:
      "At the midpoint (distance d/2 from each), E due to +q = kq/(d/2)\u00B2 = 4kq/d\u00B2 (away from +q). E due to \u2013q = 4kq/d\u00B2 (toward \u2013q). Both point in the same direction (from +q to \u2013q), so net E = 8kq/d\u00B2.",
  },
  {
    questionText:
      "Gauss's law is applicable to:",
    optionA: "Any closed surface regardless of shape",
    optionB: "Only spherical surfaces",
    optionC: "Only cylindrical surfaces",
    optionD: "Only planar surfaces",
    correctOption: "A",
    solution:
      "Gauss's law \u222E E\u0305\u00B7dS\u0305 = q_enclosed/\u03B5\u2080 holds for any arbitrary closed surface (Gaussian surface). However, symmetric surfaces make calculations easier.",
  },
  {
    questionText:
      "The dimension of electric field is:",
    optionA: "[MLT\u207B\u00B3A\u207B\u00B9]",
    optionB: "[MLT\u207B\u00B2A\u207B\u00B9]",
    optionC: "[ML\u00B2T\u207B\u00B3A\u207B\u00B9]",
    optionD: "[MLT\u207B\u00B3A]",
    correctOption: "A",
    solution:
      "Electric field E = F/q. Dimensions of force = [MLT\u207B\u00B2], charge = [AT]. So E = [MLT\u207B\u00B2]/[AT] = [MLT\u207B\u00B3A\u207B\u00B9].",
  },
];

async function retry(fn, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === retries - 1) throw e;
      console.log(`\nRetrying (${i + 1}/${retries})... ${e.message.substring(0, 80)}`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

async function main() {
  console.log("Connecting to database...");

  // Warm up the connection
  await retry(() => prisma.chapter.findUnique({ where: { id: CHAPTER_ID } }));
  console.log("Connection established.");

  // Delete existing questions for this chapter
  const deleted = await retry(() =>
    prisma.question.deleteMany({ where: { chapterId: CHAPTER_ID } })
  );
  console.log(`Deleted ${deleted.count} existing questions for chapter ${CHAPTER_ID}`);

  // Create all 25 questions one by one
  let count = 0;
  for (const q of questions) {
    await retry(() =>
      prisma.question.create({
        data: {
          chapterId: CHAPTER_ID,
          ...q,
        },
      })
    );
    count++;
    process.stdout.write(`\rCreated ${count}/${questions.length} questions`);
  }

  console.log(`\n\n--- Summary ---`);
  console.log(`Chapter ID: ${CHAPTER_ID}`);
  console.log(`Questions created: ${count}`);
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Error seeding questions:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
