import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cron from "node-cron";
import { config } from "./config";
import { syncLeadsToSheet } from "./services/leads-sync.service";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth.routes";
import courseRoutes from "./routes/course.routes";
import subscriptionRoutes from "./routes/subscription.routes";
import progressRoutes from "./routes/progress.routes";
import adminRoutes from "./routes/admin.routes";
import feedbackRoutes from "./routes/feedback.routes";
import notificationRoutes from "./routes/notification.routes";
import telegramRoutes from "./routes/telegram.routes";
import affiliateRoutes from "./routes/affiliate.routes";
import mobileRoutes from "./mobile/routes";
import { prisma } from "./config/prisma";

const NEW_PLANS = {
  FOUNDATION_PASS: { amount: 0,       label: "Foundation Pass", duration: 365, enabled: true, classSelection: 0, billingCycle: "yearly" },
  ACADEMIC_PLUS:   { amount: 899900,  label: "Academic Plus",   duration: 365, enabled: true, classSelection: 0, billingCycle: "yearly" },
  ELITE_LEARNING:  { amount: 1599900, label: "Elite Learning",  duration: 365, enabled: true, classSelection: 0, billingCycle: "yearly" },
  FLEXI_PLAN:      { amount: 0,       label: "FlexiLearn",      duration: 365, enabled: true, classSelection: 0, billingCycle: "yearly" },
};

// Ensure DB always has the correct plan keys on startup
async function migratePlansConfig() {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: "plans_config" } });

    if (!setting) {
      // No record at all — create with new plans
      await prisma.setting.create({ data: { key: "plans_config", value: JSON.stringify(NEW_PLANS) } });
      console.log("✅ Plans config created with new plans");
      return;
    }

    let plans: Record<string, any> = {};
    try { plans = JSON.parse(setting.value); } catch { /* invalid JSON — replace */ }

    // Already has new keys — skip
    const hasNewKeys = ["FOUNDATION_PASS", "ACADEMIC_PLUS", "ELITE_LEARNING"].some((k) => k in plans);
    if (hasNewKeys) return;

    // Empty or has old keys — replace with new plans
    await prisma.setting.update({ where: { key: "plans_config" }, data: { value: JSON.stringify(NEW_PLANS) } });
    console.log("✅ Plans config migrated to Foundation Pass / Academic Plus / Elite Learning / FlexiLearn");
  } catch (e) {
    console.error("Plan migration error:", e);
  }
}

const app = express();

// Security & parsing
app.use(helmet());

const corsAllowedOrigins = new Set([
  config.frontendUrl,
  "http://localhost:3000",
  "https://visuallearning-webapp.vercel.app",
  "https://visuallearning.in",
  "https://www.visuallearning.in",
  "https://physics.visuallearning.in",
  "https://physics-visuallearning.vercel.app",
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (corsAllowedOrigins.has(origin)) return callback(null, true);
      // Next.js often runs on 3001+ when 3000 is taken; allow any local dev origin
      if (
        config.nodeEnv === "development" &&
        /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
      ) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(compression({ level: 6 }));
app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: "Too many requests, please try again later" },
});
app.use("/api/auth", limiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/telegram", telegramRoutes);
app.use("/api/affiliate", affiliateRoutes);

// Mobile app compatibility routes (separate from web API)
app.use("/api", mobileRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "VisualLearning API is running", timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Ensure default courses exist linked to plan keys
async function seedCourses() {
  try {
    const coursesToSeed = [
      { name: "Foundation Pass", slug: "foundation-pass", planKey: "FOUNDATION_PASS", accentColor: "#06b6d4", icon: "Sparkles", description: "Begin your science journey with curated introductory chapters" },
      { name: "Academic Plus", slug: "academic-plus", planKey: "ACADEMIC_PLUS", accentColor: "#3b82f6", icon: "GraduationCap", description: "Comprehensive coverage of Class 9-10 with selected 11-12 content" },
      { name: "Elite Learning", slug: "elite-learning", planKey: "ELITE_LEARNING", accentColor: "#8b5cf6", icon: "Crown", description: "Complete 9-12 Physics, Chemistry & Biology with advanced tools" },
    ];

    for (const c of coursesToSeed) {
      await prisma.course.upsert({
        where: { slug: c.slug },
        update: {
          planKey: c.planKey,
          icon: c.icon,
          accentColor: c.accentColor,
          description: c.description,
          name: c.name
        },
        create: c
      });
      console.log(`  Seeded/Updated course: ${c.name}`);
    }
  } catch (e) {
    console.error("Course seed error:", e);
  }
}

// Hourly append of new signups to the calling team's Google Sheet. Only runs
// when configured, so local/dev instances stay quiet.
function scheduleLeadsSync() {
  if (!process.env.LEADS_SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    console.log("Leads sync: not configured, skipping schedule");
    return;
  }
  cron.schedule("0 * * * *", async () => {
    try {
      const { added } = await syncLeadsToSheet();
      if (added > 0) console.log(`Leads sync: appended ${added} new signup(s)`);
    } catch (e: any) {
      console.error("Leads sync failed:", e?.message || e);
    }
  });
  console.log("Leads sync: scheduled hourly");
}

app.listen(config.port, async () => {
  console.log(`VisualLearning API running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  await migratePlansConfig();
  await seedCourses();
  scheduleLeadsSync();
});

export default app;
