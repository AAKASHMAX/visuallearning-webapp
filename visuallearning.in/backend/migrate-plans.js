const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const setting = await prisma.setting.findUnique({ where: { key: "plans_config" } });
  if (setting) {
    const config = JSON.parse(setting.value);
    for (const key in config) {
      if (config[key].amount !== undefined) {
        config[key].yearlyAmount = config[key].amount;
        config[key].durationYearly = config[key].duration || 365;
        
        // Calculate monthly
        if (key === 'ACADEMIC_PLUS') config[key].monthlyAmount = 89900;
        else if (key === 'ELITE_LEARNING') config[key].monthlyAmount = 159900;
        else config[key].monthlyAmount = 0;
        
        config[key].durationMonthly = 30;
        
        delete config[key].amount;
        delete config[key].duration;
        delete config[key].billingCycle;
      }
    }
    await prisma.setting.update({
      where: { key: "plans_config" },
      data: { value: JSON.stringify(config) }
    });
    console.log("Migrated plans_config successfully.");
  } else {
    console.log("No plans_config setting found, skipping migration.");
  }
}
run().finally(() => prisma.$disconnect());
