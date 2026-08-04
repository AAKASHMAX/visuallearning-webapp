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

// The only offered plans are the three class-count plans.
const KEEP_PLAN_KEYS = ["SINGLE_CLASS", "DUAL_CLASS", "FULL_ACCESS"];

// Self-heal plans_config on startup: keep only the three class plans (preserving
// their admin-set prices) and drop any legacy keys, so retired plans can't
// reappear in the admin panel or checkout.
async function migratePlansConfig() {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: "plans_config" } });
    let plans: Record<string, any> = {};
    if (setting) { try { plans = JSON.parse(setting.value); } catch { /* replace */ } }

    const cleaned: Record<string, any> = {};
    for (const k of KEEP_PLAN_KEYS) if (plans[k]) cleaned[k] = plans[k];

    if (JSON.stringify(cleaned) !== JSON.stringify(plans)) {
      await prisma.setting.upsert({
        where: { key: "plans_config" },
        update: { value: JSON.stringify(cleaned) },
        create: { key: "plans_config", value: JSON.stringify(cleaned) },
      });
      console.log("✅ plans_config cleaned to Single / Dual / Full Access only");
    }
  } catch (e) {
    console.error("Plan config cleanup error:", e);
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
  scheduleLeadsSync();
});

export default app;
