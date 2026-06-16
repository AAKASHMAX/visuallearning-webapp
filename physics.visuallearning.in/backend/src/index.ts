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
import adminRoutes from "./routes/admin.routes";
import notificationRoutes from "./routes/notification.routes";
import feedbackRoutes from "./routes/feedback.routes";
import { handleRazorpayWebhook } from "./controllers/webhook.controller";

const app = express();

// Security & parsing
app.use(helmet());
app.use(cors({
  origin: [
    config.frontendUrl,
    "https://physics.visuallearning.in",
    "https://physics-visuallearning.vercel.app",
  ],
  credentials: true,
}));
app.use(compression({ level: 6 }));
app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));

// Razorpay webhook needs the RAW body for signature verification, so it must be
// registered before express.json() parses (and discards) the raw bytes.
app.post("/api/subscription/webhook", express.raw({ type: "*/*" }), handleRazorpayWebhook);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "physics-backend" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", courseRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", adminRoutes);

// Error handling
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Physics API server running on port ${config.port}`);
});
