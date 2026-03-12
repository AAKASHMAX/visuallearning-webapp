import { Request, Response } from "express";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { hashPassword, comparePassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
import { success, error } from "../utils/apiResponse";
import { sendVerificationEmail, sendResetPasswordEmail } from "../utils/email";

export const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
});

export async function signup(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return error(res, "Email already registered", 409);

    const hashed = await hashPassword(password);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: { name, email, password: hashed, verificationToken },
    });

    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (e) {
      console.error("Failed to send verification email:", e);
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name });

    return success(res, {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    }, "Account created successfully", 201);
  } catch (e) {
    console.error("Signup error:", e);
    return error(res, "Failed to create account");
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return error(res, "Invalid email or password", 401);
    if (user.blocked) return error(res, "Your account has been blocked", 403);

    const valid = await comparePassword(password, user.password);
    if (!valid) return error(res, "Invalid email or password", 401);

    const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name });

    return success(res, {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, emailVerified: user.emailVerified },
    }, "Login successful");
  } catch (e) {
    console.error("Login error:", e);
    return error(res, "Login failed");
  }
}

export async function verifyEmail(req: Request, res: Response) {
  try {
    const { token } = req.query;
    if (!token || typeof token !== "string") return error(res, "Invalid token", 400);

    const user = await prisma.user.findFirst({ where: { verificationToken: token } });
    if (!user) return error(res, "Invalid or expired verification token", 400);

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null },
    });

    return success(res, null, "Email verified successfully");
  } catch (e) {
    console.error("Verify email error:", e);
    return error(res, "Verification failed");
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return success(res, null, "If the email exists, a reset link has been sent");

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    try {
      await sendResetPasswordEmail(email, resetToken);
    } catch (e) {
      console.error("Failed to send reset email:", e);
    }

    return success(res, null, "If the email exists, a reset link has been sent");
  } catch (e) {
    console.error("Forgot password error:", e);
    return error(res, "Failed to process request");
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, password } = req.body;

    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
    });
    if (!user) return error(res, "Invalid or expired reset token", 400);

    const hashed = await hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetToken: null, resetTokenExpiry: null },
    });

    return success(res, null, "Password reset successfully");
  } catch (e) {
    console.error("Reset password error:", e);
    return error(res, "Failed to reset password");
  }
}

export async function getProfile(req: Request, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true, emailVerified: true, createdAt: true },
    });
    if (!user) return error(res, "User not found", 404);

    const subscription = await prisma.subscription.findFirst({
      where: { userId: user.id, status: "ACTIVE", expiryDate: { gt: new Date() } },
      orderBy: { expiryDate: "desc" },
    });

    return success(res, { ...user, subscription });
  } catch (e) {
    console.error("Get profile error:", e);
    return error(res, "Failed to fetch profile");
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const { name } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name },
      select: { id: true, name: true, email: true, role: true },
    });
    return success(res, user, "Profile updated");
  } catch (e) {
    console.error("Update profile error:", e);
    return error(res, "Failed to update profile");
  }
}
