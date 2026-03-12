import nodemailer from "nodemailer";
import { config } from "../config";

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${config.frontendUrl}/auth/verify-email?token=${token}`;
  await transporter.sendMail({
    from: `"VisualLearning" <${config.smtp.user}>`,
    to: email,
    subject: "Verify your email - VisualLearning",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a5f;">Welcome to VisualLearning!</h2>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: #1e3a5f; text-decoration: none; border-radius: 8px; font-weight: bold;">Verify Email</a>
        <p style="color: #666; margin-top: 20px;">If the button doesn't work, copy and paste this URL:<br>${verifyUrl}</p>
        <p style="color: #999; font-size: 12px;">This link expires in 24 hours.</p>
      </div>
    `,
  });
}

export async function sendResetPasswordEmail(email: string, token: string) {
  const resetUrl = `${config.frontendUrl}/auth/forgot-password?token=${token}`;
  await transporter.sendMail({
    from: `"VisualLearning" <${config.smtp.user}>`,
    to: email,
    subject: "Reset your password - VisualLearning",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a5f;">Password Reset Request</h2>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: #1e3a5f; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
        <p style="color: #666; margin-top: 20px;">If you didn't request this, ignore this email.</p>
        <p style="color: #999; font-size: 12px;">This link expires in 1 hour.</p>
      </div>
    `,
  });
}
