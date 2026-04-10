import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { hashPassword, comparePassword } from "../../utils/password";
import { generateToken } from "../../utils/jwt";
import { mobileSuccess, mobileError } from "../utils/response";

// Helper: format user for mobile response
async function formatUserForMobile(user: any, token: string) {
  const sub = await prisma.subscription.findFirst({
    where: { userId: user.id, status: "ACTIVE", expiryDate: { gt: new Date() } },
    orderBy: { expiryDate: "desc" },
  });

  return {
    user_id: user.id,
    full_name: user.name,
    email: user.email,
    mobile: "",
    referral_code: null,
    is_subscribe: sub ? 1 : 0,
    expiry_date: sub ? sub.expiryDate.toISOString() : null,
    token,
    role: user.role,
  };
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return mobileError(res, "Email and password required", 400);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return mobileError(res, "Invalid email or password", 401);
    if (user.blocked) return mobileError(res, "Your account has been blocked", 403);

    const valid = await comparePassword(password, user.password);
    if (!valid) return mobileError(res, "Invalid email or password", 401);

    const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name });
    const mobileUser = await formatUserForMobile(user, token);

    return res.json({ status: true, message: "Login successful", user: mobileUser });
  } catch (e) {
    console.error("Mobile login error:", e);
    return mobileError(res, "Login failed");
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { full_name, email, password, name } = req.body;
    const userName = full_name || name;
    if (!userName || !email || !password) return mobileError(res, "Name, email and password required", 400);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return mobileError(res, "Email already registered", 409);

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({ data: { name: userName, email, password: hashed } });

    const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name });
    const mobileUser = await formatUserForMobile(user, token);

    return res.status(201).json({ status: true, message: "Account created successfully", user: mobileUser });
  } catch (e) {
    console.error("Mobile register error:", e);
    return mobileError(res, "Failed to create account");
  }
}

export async function googleLogin(req: Request, res: Response) {
  try {
    const { email, full_name, name } = req.body;
    const userName = full_name || name || "User";
    if (!email) return mobileError(res, "Email is required", 400);

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Auto-create account for Google login
      const hashed = await hashPassword(Math.random().toString(36).slice(-12));
      user = await prisma.user.create({
        data: { name: userName, email, password: hashed, emailVerified: true },
      });
    }
    if (user.blocked) return mobileError(res, "Your account has been blocked", 403);

    const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name });
    const mobileUser = await formatUserForMobile(user, token);

    return res.json({ status: true, message: "Login successful", user: mobileUser });
  } catch (e) {
    console.error("Mobile google login error:", e);
    return mobileError(res, "Google login failed");
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) return mobileError(res, "Email is required", 400);

    // Always return success (don't leak whether email exists)
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const crypto = await import("crypto");
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 3600000);
      await prisma.user.update({ where: { id: user.id }, data: { resetToken, resetTokenExpiry } });

      try {
        const { sendResetPasswordEmail } = await import("../../utils/email");
        await sendResetPasswordEmail(email, resetToken);
      } catch (e) {
        console.error("Failed to send reset email:", e);
      }
    }

    return mobileSuccess(res, null, "If the email exists, a reset link has been sent");
  } catch (e) {
    console.error("Mobile forgot password error:", e);
    return mobileError(res, "Failed to process request");
  }
}

export async function logout(_req: Request, res: Response) {
  // JWT-based auth — no server-side session to clear
  return mobileSuccess(res, null, "Logged out successfully");
}
