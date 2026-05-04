const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.setting.findUnique({where: {key: 'plans_config'}})
  .then(r => console.log(JSON.stringify(JSON.parse(r.value), null, 2)))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
