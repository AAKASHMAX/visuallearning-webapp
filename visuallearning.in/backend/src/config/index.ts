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
  smtp: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  plans: {
    FOUNDATION_PASS: { monthlyAmount: 0, yearlyAmount: 0,             label: "Foundation Pass", durationMonthly: 30, durationYearly: 365 },
    ACADEMIC_PLUS:   { monthlyAmount: 89900, yearlyAmount: 899900,    label: "Academic Plus",   durationMonthly: 30, durationYearly: 365 },
    ELITE_LEARNING:  { monthlyAmount: 159900, yearlyAmount: 1599900,  label: "Elite Learning",  durationMonthly: 30, durationYearly: 365 },
    FLEXI_PLAN:      { monthlyAmount: 0, yearlyAmount: 0,             label: "FlexiLearn",      durationMonthly: 30, durationYearly: 365 },
  },
};
