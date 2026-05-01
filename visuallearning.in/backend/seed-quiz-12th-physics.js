const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const chapters = getChapters();
  
  for (const chapter of chapters) {
    console.log('
Processing: ' + chapter.name);
    
    // Delete existing questions for this chapter
    const deleted = await prisma.question.deleteMany({ where: { chapterId: chapter.id } });
    console.log('  Deleted ' + deleted.count + ' existing questions');
    
    // Insert new questions
    const data = chapter.questions.map(q => ({
      chapterId: chapter.id,
      questionText: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctOption: q.correctOption,
      solution: q.solution
    }));
    
    const result = await prisma.question.createMany({ data });
    console.log('  Inserted ' + result.count + ' questions');
  }
  
  console.log('
Done! All chapters seeded successfully.');
}

function getChapters() {
  return [