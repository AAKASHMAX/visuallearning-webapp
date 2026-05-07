import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "5001"),
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "physics-jwt-secret-change-me",
  jwtExpiry: process.env.JWT_EXPIRY || "30d",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3001",
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  },
  resendApiKey: process.env.RESEND_API_KEY || "",
  fromEmail: process.env.FROM_EMAIL || "noreply@visuallearning.in",
};

export const PLANS: Record<string, { name: string; price: number; duration: number }> = {
  BRIDGE_YEARLY: { name: "Bridge Yearly", price: 9990, duration: 365 },
  BASIC_YEARLY: { name: "Basic Yearly", price: 2499, duration: 365 },
  ADVANCE_YEARLY: { name: "Advance Yearly", price: 3999, duration: 365 },
};
