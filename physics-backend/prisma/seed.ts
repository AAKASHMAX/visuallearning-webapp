import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@physicslab.in" },
    update: {},
    create: {
      name: "Physics Admin",
      email: "admin@physicslab.in",
      password: hashedPassword,
      role: "ADMIN",
      emailVerified: true,
    },
  });

  // Create default settings
  const defaultSettings = [
    {
      key: "plans_config",
      value: JSON.stringify({
        FREE: { name: "Free", price: 0, duration: 0, features: ["First chapter free", "Selected animations", "Basic notes"] },
        BASIC: { name: "Basic", price: 299, duration: 30, features: ["All animated videos", "Complete notes", "MCQ quizzes", "Progress tracking"] },
        ADVANCE: { name: "Advance", price: 499, duration: 30, features: ["Everything in Basic", "Expert lectures", "Virtual labs", "Board papers", "Priority support"] },
      }),
    },
    {
      key: "contact_info",
      value: JSON.stringify({
        email: "support@visuallearning.in",
        phone: "",
        address: "India",
      }),
    },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log("Seed completed!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
