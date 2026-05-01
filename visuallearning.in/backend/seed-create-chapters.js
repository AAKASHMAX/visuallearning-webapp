const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Chemistry - missing chapters 13, 14
  const chemSubjectId = 'cmmn2f639006juuksesekwzap';
  const missingChemChapters = [
    { name: 'States of Matter', order: 13, subjectId: chemSubjectId },
    { name: 'Hydrogen', order: 14, subjectId: chemSubjectId },
  ];

  // Biology - missing chapters 6-22
  const bioSubjectId = 'cmmn2f8dp0079uuksl7k4wqxg';
  const missingBioChapters = [
    { name: 'Anatomy of Flowering Plants', order: 6, subjectId: bioSubjectId },
    { name: 'Structural Organisation in Animals', order: 7, subjectId: bioSubjectId },
    { name: 'Cell: The Unit of Life', order: 8, subjectId: bioSubjectId },
    { name: 'Biomolecules', order: 9, subjectId: bioSubjectId },
    { name: 'Cell Cycle and Cell Division', order: 10, subjectId: bioSubjectId },
    { name: 'Photosynthesis in Higher Plants', order: 11, subjectId: bioSubjectId },
    { name: 'Respiration in Plants', order: 12, subjectId: bioSubjectId },
    { name: 'Plant Growth and Development', order: 13, subjectId: bioSubjectId },
    { name: 'Breathing and Exchange of Gases', order: 14, subjectId: bioSubjectId },
    { name: 'Body Fluids and Circulation', order: 15, subjectId: bioSubjectId },
    { name: 'Excretory Products and their Elimination', order: 16, subjectId: bioSubjectId },
    { name: 'Locomotion and Movement', order: 17, subjectId: bioSubjectId },
    { name: 'Neural Control and Coordination', order: 18, subjectId: bioSubjectId },
    { name: 'Chemical Coordination and Integration', order: 19, subjectId: bioSubjectId },
    { name: 'Transport in Plants', order: 20, subjectId: bioSubjectId },
    { name: 'Mineral Nutrition', order: 21, subjectId: bioSubjectId },
    { name: 'Digestion and Absorption', order: 22, subjectId: bioSubjectId },
  ];

  const allChapters = [...missingChemChapters, ...missingBioChapters];

  for (const ch of allChapters) {
    const created = await prisma.chapter.create({ data: ch });
    console.log('Created:', ch.name, '| id:', created.id);
  }

  console.log('\nDone creating', allChapters.length, 'chapters');
}

main().catch(console.error).finally(() => prisma.$disconnect());
