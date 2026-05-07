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
        FREE: { name: "Free Trial", price: 0, duration: 30, features: ["30-day access", "Selected animations", "Basic notes"] },
        BASIC_YEARLY: { name: "Basic Yearly", price: 2990, duration: 365, features: ["All animated videos", "Complete notes", "MCQ quizzes", "Progress tracking"] },
        ADVANCE_YEARLY: { name: "Advance Yearly", price: 4990, duration: 365, features: ["Everything in Basic", "Expert lectures", "Virtual labs", "Board papers", "Priority support"] },
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
