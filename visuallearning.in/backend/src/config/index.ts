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
  hms: {
    accessKey: process.env.HMS_ACCESS_KEY || "",
    secret: process.env.HMS_SECRET || "",
    templateId: process.env.HMS_TEMPLATE_ID || "",
  },
  plans: {
    FOUNDATION_PASS: { amount: 0,       label: "Foundation Pass", duration: 365, billingCycle: "yearly" },
    ACADEMIC_PLUS:   { amount: 899900,  label: "Academic Plus",   duration: 365, billingCycle: "yearly" },
    ELITE_LEARNING:  { amount: 1599900, label: "Elite Learning",  duration: 365, billingCycle: "yearly" },
    FLEXI_PLAN:      { amount: 0,       label: "FlexiLearn",      duration: 365, billingCycle: "yearly" },
  },
};
