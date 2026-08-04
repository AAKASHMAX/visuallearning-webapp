import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "5000"),
  nodeEnv: process.env.NODE_ENV || "development",
  jwt: {
    secret: process.env.JWT_SECRET || "default-secret-change-me",
    expiry: process.env.JWT_EXPIRY || "7d",
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  },
  resendApiKey: process.env.RESEND_API_KEY || "",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || "",
    botUsername: process.env.TELEGRAM_BOT_USERNAME || "",
    channel: process.env.TELEGRAM_CHANNEL || "@visuallearning3D",
    // Shared secret Telegram echoes back on every webhook call (set when we register the webhook).
    webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET || "",
    // Public base URL of this backend (Render sets RENDER_EXTERNAL_URL automatically).
    publicUrl: process.env.RENDER_EXTERNAL_URL || process.env.PUBLIC_API_URL || "",
  },
  smtp: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "dvtuf1zqn",
    apiKey: process.env.CLOUDINARY_API_KEY || "727822633118353",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "D41LANrVz7TTgOiGFMs4gfNIEpg",
  },
  // Only the three class-count plans remain. Prices live in the plans_config
  // Setting (admin-editable); defaults are in subscription.controller.
  plans: {} as Record<string, { monthlyAmount: number; yearlyAmount: number; label: string; durationMonthly: number; durationYearly: number }>,
};
