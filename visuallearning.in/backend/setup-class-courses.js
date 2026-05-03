const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const configStr = await prisma.setting.findUnique({ where: { key: 'plans_config' } });
  if (!configStr) throw new Error('plans_config not found');
  
  let config = JSON.parse(configStr.value);
  
  // Add new class plans
  config.CLASS_9 = { amount: 599900, label: 'Class 9 Plan', duration: 365, enabled: true, classSelection: 0, billingCycle: 'yearly' };
  config.CLASS_10 = { amount: 699900, label: 'Class 10 Plan', duration: 365, enabled: true, classSelection: 0, billingCycle: 'yearly' };
  config.CLASS_11 = { amount: 899900, label: 'Class 11 Plan', duration: 365, enabled: true, classSelection: 0, billingCycle: 'yearly' };
  config.CLASS_12 = { amount: 999900, label: 'Class 12 Plan', duration: 365, enabled: true, classSelection: 0, billingCycle: 'yearly' };
  
  // Remove FlexiPlan
  delete config.FLEXI_PLAN;
  
  await prisma.setting.update({
    where: { key: 'plans_config' },
    data: { value: JSON.stringify(config) }
  });
  
  const classes = await prisma.class.findMany();
  
  for (const cls of classes) {
    const slug = cls.name.toLowerCase().replace(/ /g, '-');
    const planKey = cls.name.toUpperCase().replace(/ /g, '_');
    
    const course = await prisma.course.upsert({
      where: { slug },
      update: { 
        name: cls.name + ' Plan',
        planKey 
      },
      create: { 
        name: cls.name + ' Plan', 
        slug, 
        description: 'Complete 3D animated course for ' + cls.name, 
        accentColor: '#3b82f6', 
        planKey, 
        icon: 'GraduationCap' 
      }
    });
    
    // Link chapters of this class to the course
    const chapters = await prisma.chapter.findMany({
      where: { subject: { classId: cls.id } }
    });
    
    await prisma.courseChapter.deleteMany({ where: { courseId: course.id } });
    
    if (chapters.length > 0) {
      await prisma.courseChapter.createMany({
        data: chapters.map((ch, idx) => ({
          courseId: course.id,
          chapterId: ch.id,
          order: idx
        }))
      });
    }
  }
  
  console.log('Courses created and chapters linked');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
