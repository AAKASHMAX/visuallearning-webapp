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
  smtp: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  plans: {
    MONTHLY: { amount: 49900, label: "Monthly Plan", duration: 30 },
    YEARLY: { amount: 399900, label: "Yearly Plan", duration: 365 },
    SINGLE_CLASS: { amount: 29900, label: "Single Class Plan", duration: 365 },
    MULTI_CLASS: { amount: 49900, label: "Multi Class Pack", duration: 365 },
    FULL_ACCESS: { amount: 69900, label: "Full Access Plan", duration: 365 },
  },
};
