const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SUBJECT_ID = 'cmmn2f3sr005tuuks95qzztap'; // Class 11 Physics

const physicalWorldQuestions = [
  {
    questionText: "Physics is the study of:",
    optionA: "Living organisms and their interactions",
    optionB: "Nature and natural phenomena",
    optionC: "Chemical reactions and compounds",
    optionD: "Earth's geological features only",
    correctOption: "B",
    solution: "Physics is the branch of science that deals with the study of nature and natural phenomena, including matter, energy, force, and motion."
  },
  {
    questionText: "Which of the following is a fundamental force of nature?",
    optionA: "Friction",
    optionB: "Tension",
    optionC: "Gravitational force",
    optionD: "Viscous force",
    correctOption: "C",
    solution: "There are four fundamental forces of nature: gravitational, electromagnetic, strong nuclear, and weak nuclear. Friction, tension, and viscous force are derived forces."
  },
  {
    questionText: "The weakest fundamental force in nature is:",
    optionA: "Electromagnetic force",
    optionB: "Strong nuclear force",
    optionC: "Weak nuclear force",
    optionD: "Gravitational force",
    correctOption: "D",
    solution: "Gravitational force is the weakest of the four fundamental forces, but it has an infinite range and is always attractive, making it dominant at large scales."
  },
  {
    questionText: "Which branch of physics deals with the study of heat and temperature?",
    optionA: "Optics",
    optionB: "Thermodynamics",
    optionC: "Electrodynamics",
    optionD: "Mechanics",
    correctOption: "B",
    solution: "Thermodynamics is the branch of physics that deals with the study of heat, temperature, and their relation to energy and work."
  },
  {
    questionText: "The strong nuclear force acts between:",
    optionA: "Electrons and protons",
    optionB: "Protons and neutrons (nucleons)",
    optionC: "Atoms and molecules",
    optionD: "Planets and stars",
    correctOption: "B",
    solution: "The strong nuclear force acts between nucleons (protons and neutrons) and is responsible for binding them together inside the nucleus."
  },
  {
    questionText: "Which of the following scientists proposed the heliocentric model of the solar system?",
    optionA: "Ptolemy",
    optionB: "Aristotle",
    optionC: "Copernicus",
    optionD: "Archimedes",
    correctOption: "C",
    solution: "Nicolaus Copernicus proposed the heliocentric model, which places the Sun at the centre of the solar system with the planets revolving around it."
  },
  {
    questionText: "The range of the strong nuclear force is approximately:",
    optionA: "Infinite",
    optionB: "10⁻¹⁵ m",
    optionC: "10⁻¹⁰ m",
    optionD: "10⁻² m",
    correctOption: "B",
    solution: "The strong nuclear force has a very short range of about 10⁻¹⁵ m (about the size of a nucleus). Beyond this range, it rapidly falls to zero."
  },
  {
    questionText: "Which of the following is NOT a branch of classical physics?",
    optionA: "Mechanics",
    optionB: "Thermodynamics",
    optionC: "Quantum mechanics",
    optionD: "Electromagnetism",
    correctOption: "C",
    solution: "Quantum mechanics is a branch of modern physics, not classical physics. Classical physics includes mechanics, thermodynamics, electromagnetism, and optics."
  },
  {
    questionText: "The unification of electricity and magnetism was achieved by:",
    optionA: "Isaac Newton",
    optionB: "James Clerk Maxwell",
    optionC: "Albert Einstein",
    optionD: "Niels Bohr",
    correctOption: "B",
    solution: "James Clerk Maxwell unified electricity and magnetism into the theory of electromagnetism through his famous Maxwell's equations."
  },
  {
    questionText: "The law of inertia was proposed by:",
    optionA: "Archimedes",
    optionB: "Galileo Galilei",
    optionC: "Albert Einstein",
    optionD: "Michael Faraday",
    correctOption: "B",
    solution: "Galileo Galilei first proposed the law of inertia, which was later refined by Newton as his first law of motion."
  },
  {
    questionText: "Which conservation law is a consequence of the homogeneity of time?",
    optionA: "Conservation of momentum",
    optionB: "Conservation of angular momentum",
    optionC: "Conservation of energy",
    optionD: "Conservation of charge",
    correctOption: "C",
    solution: "According to Noether's theorem, the homogeneity of time (time translation symmetry) leads to the conservation of energy."
  },
  {
    questionText: "Conservation of linear momentum is related to the symmetry of:",
    optionA: "Homogeneity of time",
    optionB: "Isotropy of space",
    optionC: "Homogeneity of space",
    optionD: "Isotropy of time",
    correctOption: "C",
    solution: "Conservation of linear momentum arises from the homogeneity of space, meaning the laws of physics do not change from one point to another in space."
  },
  {
    questionText: "The electromagnetic force is:",
    optionA: "Always attractive",
    optionB: "Always repulsive",
    optionC: "Both attractive and repulsive",
    optionD: "Neither attractive nor repulsive",
    correctOption: "C",
    solution: "The electromagnetic force can be both attractive (between unlike charges) and repulsive (between like charges), unlike gravity which is always attractive."
  },
  {
    questionText: "Which of the following phenomena is explained by quantum mechanics?",
    optionA: "Planetary motion",
    optionB: "Photoelectric effect",
    optionC: "Projectile motion",
    optionD: "Tidal waves",
    correctOption: "B",
    solution: "The photoelectric effect is explained by quantum mechanics (Einstein's photon theory). Classical physics fails to explain this phenomenon."
  },
  {
    questionText: "The hypothesis that all matter has a wave nature was proposed by:",
    optionA: "Max Planck",
    optionB: "Louis de Broglie",
    optionC: "Werner Heisenberg",
    optionD: "Erwin Schrödinger",
    correctOption: "B",
    solution: "Louis de Broglie proposed in 1924 that all matter has wave-like properties, with wavelength λ = h/p, where h is Planck's constant and p is momentum."
  },
  {
    questionText: "Which of the following is an example of a macroscopic domain of physics?",
    optionA: "Nuclear reactions",
    optionB: "Behaviour of electrons in atoms",
    optionC: "Motion of planets around the Sun",
    optionD: "Radioactive decay",
    correctOption: "C",
    solution: "The macroscopic domain includes phenomena at large scales like planetary motion, mechanics of machines, and fluid dynamics. Nuclear reactions and atomic behavior belong to the microscopic domain."
  },
  {
    questionText: "The technology of producing ultra-high magnetic fields is an application of:",
    optionA: "Optics",
    optionB: "Thermodynamics",
    optionC: "Superconductivity",
    optionD: "Nuclear physics",
    correctOption: "C",
    solution: "Superconductivity allows the creation of ultra-high magnetic fields using superconducting coils that carry large currents without any resistance."
  },
  {
    questionText: "Which fundamental force is responsible for beta decay?",
    optionA: "Gravitational force",
    optionB: "Electromagnetic force",
    optionC: "Strong nuclear force",
    optionD: "Weak nuclear force",
    correctOption: "D",
    solution: "Beta decay is mediated by the weak nuclear force. In beta decay, a neutron transforms into a proton (or vice versa) with the emission of an electron/positron and a neutrino."
  },
  {
    questionText: "The scientific method involves:",
    optionA: "Only theoretical predictions",
    optionB: "Only experimental observations",
    optionC: "Systematic observations, controlled experiments, qualitative and quantitative reasoning",
    optionD: "Philosophical arguments only",
    correctOption: "C",
    solution: "The scientific method involves systematic observations, controlled experiments, qualitative and quantitative reasoning, mathematical modeling, prediction, and verification."
  },
  {
    questionText: "Albert Einstein received the Nobel Prize for his explanation of:",
    optionA: "Theory of relativity",
    optionB: "Photoelectric effect",
    optionC: "Brownian motion",
    optionD: "Mass-energy equivalence",
    correctOption: "B",
    solution: "Einstein received the Nobel Prize in Physics in 1921 for his explanation of the photoelectric effect, not for the theory of relativity."
  },
  {
    questionText: "Which of the following is an example of the reductionism approach in physics?",
    optionA: "Studying the weather as a whole system",
    optionB: "Understanding thermodynamics from the laws of mechanics applied to molecules",
    optionC: "Observing the behaviour of a flock of birds",
    optionD: "Studying ecosystems",
    correctOption: "B",
    solution: "Reductionism is the approach of understanding complex phenomena by breaking them down into simpler parts. Deriving thermodynamic laws from molecular mechanics is a classic example."
  },
  {
    questionText: "The gravitational force between two bodies is:",
    optionA: "Always repulsive",
    optionB: "Both attractive and repulsive",
    optionC: "Always attractive",
    optionD: "Zero for large distances",
    correctOption: "C",
    solution: "Gravitational force is always attractive. It acts between all objects with mass and never repels, though it becomes weaker with increasing distance."
  },
  {
    questionText: "Which Indian scientist made significant contributions to the field of Astrophysics and was awarded the Nobel Prize?",
    optionA: "C.V. Raman",
    optionB: "S. Chandrasekhar",
    optionC: "Homi Bhabha",
    optionD: "Satyendra Nath Bose",
    correctOption: "B",
    solution: "Subrahmanyan Chandrasekhar won the Nobel Prize in Physics in 1983 for his theoretical studies on the structure and evolution of stars (Chandrasekhar limit)."
  },
  {
    questionText: "C.V. Raman was awarded the Nobel Prize for his work on:",
    optionA: "Quantum mechanics",
    optionB: "Scattering of light (Raman Effect)",
    optionC: "Superconductivity",
    optionD: "Nuclear physics",
    correctOption: "B",
    solution: "C.V. Raman won the Nobel Prize in Physics in 1930 for his discovery of the Raman Effect, which involves the inelastic scattering of light by molecules."
  },
  {
    questionText: "Which of the following best describes the scope of physics?",
    optionA: "It covers only large-scale phenomena like planetary motion",
    optionB: "It covers only subatomic phenomena",
    optionC: "It covers phenomena from subatomic to cosmological scales",
    optionD: "It covers only phenomena that can be directly observed",
    correctOption: "C",
    solution: "Physics has an incredibly wide scope, covering phenomena from the smallest subatomic particles (10⁻¹⁵ m) to the entire observable universe (10²⁶ m)."
  }
];

async function main() {
  try {
    // Step 1: Check if "Physical World" chapter exists
    const existingChapters = await prisma.chapter.findMany({
      where: { subjectId: SUBJECT_ID },
      orderBy: { order: 'asc' }
    });

    console.log(`Found ${existingChapters.length} existing chapters.`);

    let physicalWorldChapter = existingChapters.find(c => c.name === 'Physical World');

    if (!physicalWorldChapter) {
      console.log('Creating "Physical World" chapter...');

      // Shift all existing chapters' order up by 1 to make room for Physical World at order 1
      for (const ch of existingChapters) {
        await prisma.chapter.update({
          where: { id: ch.id },
          data: { order: ch.order + 1 }
        });
      }
      console.log('Shifted existing chapters order by +1');

      // Create Physical World as chapter 1
      physicalWorldChapter = await prisma.chapter.create({
        data: {
          subjectId: SUBJECT_ID,
          name: 'Physical World',
          order: 1
        }
      });
      console.log(`Created "Physical World" chapter with id: ${physicalWorldChapter.id}`);
    } else {
      console.log(`"Physical World" chapter already exists with id: ${physicalWorldChapter.id}`);
    }

    // Step 2: Check existing questions for this chapter
    const existingQuestions = await prisma.question.count({
      where: { chapterId: physicalWorldChapter.id }
    });

    if (existingQuestions >= 25) {
      console.log(`Chapter "Physical World" already has ${existingQuestions} questions. Skipping.`);
    } else {
      if (existingQuestions > 0) {
        console.log(`Deleting ${existingQuestions} existing questions for fresh seed...`);
        await prisma.question.deleteMany({ where: { chapterId: physicalWorldChapter.id } });
      }

      // Seed questions
      console.log(`Seeding 25 questions for "Physical World"...`);
      const questionsToCreate = physicalWorldQuestions.map(q => ({
        ...q,
        chapterId: physicalWorldChapter.id
      }));

      await prisma.question.createMany({ data: questionsToCreate });
      console.log('Successfully seeded 25 questions for "Physical World".');
    }

    // Step 3: Verify all chapters and counts
    console.log('\n--- Verification ---');
    const allChapters = await prisma.chapter.findMany({
      where: { subjectId: SUBJECT_ID },
      orderBy: { order: 'asc' },
      include: { _count: { select: { questions: true } } }
    });

    let totalQuestions = 0;
    allChapters.forEach(ch => {
      console.log(`Ch ${ch.order}: ${ch.name} - ${ch._count.questions} questions`);
      totalQuestions += ch._count.questions;
    });
    console.log(`\nTotal: ${allChapters.length} chapters, ${totalQuestions} questions`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
