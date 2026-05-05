const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.subscription.count();
  console.log(`Found ${count} subscriptions. Deleting all...`);
  const result = await prisma.subscription.deleteMany({});
  console.log(`Deleted ${result.count} subscriptions.`);
  const verify = await prisma.subscription.count();
  console.log(`Remaining subscriptions: ${verify}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .then(() => prisma.$disconnect());
