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

const app = express();

// Security & parsing
app.use(helmet());
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(compression());
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

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "VisualLearning API is running", timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`VisualLearning API running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

export default app;
