import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth.routes";
import courseRoutes from "./routes/course.routes";
import subscriptionRoutes from "./routes/subscription.routes";
import progressRoutes from "./routes/progress.routes";
import adminRoutes from "./routes/admin.routes";
import feedbackRoutes from "./routes/feedback.routes";
import liveclassRoutes from "./routes/liveclass.routes";
import studentGroupRoutes from "./routes/studentgroup.routes";
import mobileRoutes from "./mobile/routes";
import { prisma } from "./config/prisma";

// Migrate old plan keys → new Foundation Pass / Academic Plus / Elite Learning / FlexiLearn
async function migratePlansConfig() {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: "plans_config" } });
    if (!setting) return;
    const plans = JSON.parse(setting.value) as Record<string, any>;
    const OLD_KEYS = ["SINGLE_CLASS", "MULTI_CLASS", "FULL_ACCESS", "MONTHLY", "YEARLY", "LIVE_CLASS"];
    if (!OLD_KEYS.some((k) => k in plans)) return; // already migrated

    const newPlans = {
      FOUNDATION_PASS: { amount: 0,       label: "Foundation Pass", duration: 365, enabled: true, classSelection: 0, billingCycle: "yearly" },
      ACADEMIC_PLUS:   { amount: 899900,  label: "Academic Plus",   duration: 365, enabled: true, classSelection: 0, billingCycle: "yearly" },
      ELITE_LEARNING:  { amount: 1599900, label: "Elite Learning",  duration: 365, enabled: true, classSelection: 0, billingCycle: "yearly" },
      FLEXI_PLAN:      { amount: 0,       label: "FlexiLearn",      duration: 365, enabled: true, classSelection: 0, billingCycle: "yearly" },
    };
    await prisma.setting.update({ where: { key: "plans_config" }, data: { value: JSON.stringify(newPlans) } });
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
// app.use("/api/live-classes", liveclassRoutes);
// app.use("/api/student-groups", studentGroupRoutes);

// Mobile app compatibility routes (separate from web API)
app.use("/api", mobileRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "VisualLearning API is running", timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

app.listen(config.port, async () => {
  console.log(`VisualLearning API running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  await migratePlansConfig();
});

export default app;
