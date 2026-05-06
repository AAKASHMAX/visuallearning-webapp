import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { error, success } from "../utils/apiResponse";
import { sendFeedbackEmail } from "../utils/email";

function cleanText(value: unknown, maxLength: number) {
  return String(value || "").trim().slice(0, maxLength);
}

function normalizeRating(value: unknown) {
  const rating = Number(value);
  if (!Number.isFinite(rating)) return null;
  return Math.min(5, Math.max(1, Math.round(rating)));
}

export async function createFeedback(req: Request, res: Response) {
  try {
    const name = cleanText(req.body.name || req.user?.name, 80);
    const email = cleanText(req.body.email || req.user?.email, 120).toLowerCase();
    const subject = cleanText(req.body.subject || "Website Feedback", 160);
    const message = cleanText(req.body.message, 1500);
    const pageUrl = cleanText(req.body.pageUrl, 500) || null;
    const rating = normalizeRating(req.body.rating);

    const feedback = await prisma.feedback.create({
      data: {
        name,
        email,
        subject,
        message,
        pageUrl,
        rating,
        userId: req.user?.id,
      },
    });

    try {
      await sendFeedbackEmail(name, email, subject, message);
    } catch (mailError) {
      console.error("Feedback email error:", mailError);
    }

    res.json({
      success: true,
      status: true,
      message: "Feedback submitted successfully! We'll get back to you soon.",
      data: { id: feedback.id },
    });
  } catch (error) {
    console.error("Feedback submit error:", error);
    res.status(500).json({ success: false, status: false, message: "Failed to submit feedback. Please try again later." });
  }
}

export async function getFeedbacks(req: Request, res: Response) {
  try {
    const status = String(req.query.status || "all");
    const where = status === "unread" ? { isRead: false } : {};

    const feedback = await prisma.feedback.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return success(res, feedback);
  } catch {
    return error(res, "Failed to load feedback");
  }
}

export async function markFeedbackRead(req: Request, res: Response) {
  try {
    const feedback = await prisma.feedback.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });

    return success(res, feedback, "Feedback marked as read");
  } catch {
    return error(res, "Failed to update feedback");
  }
}

export async function deleteFeedback(req: Request, res: Response) {
  try {
    await prisma.feedback.delete({ where: { id: req.params.id } });
    return success(res, null, "Feedback deleted");
  } catch {
    return error(res, "Failed to delete feedback");
  }
}
