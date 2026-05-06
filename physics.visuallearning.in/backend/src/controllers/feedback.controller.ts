import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();

function cleanText(value: unknown, maxLength: number) {
  return String(value || "").trim().slice(0, maxLength);
}

function normalizeRating(value: unknown) {
  const rating = Number(value);
  if (!Number.isFinite(rating)) return null;
  return Math.min(5, Math.max(1, Math.round(rating)));
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function createFeedback(req: AuthRequest, res: Response) {
  try {
    const name = cleanText(req.body.name || req.user?.name, 80);
    const email = cleanText(req.body.email || req.user?.email, 120).toLowerCase();
    const message = cleanText(req.body.message, 1500);
    const pageUrl = cleanText(req.body.pageUrl, 500) || null;
    const rating = normalizeRating(req.body.rating);

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email, and feedback are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    const feedback = await prisma.feedback.create({
      data: {
        name,
        email,
        message,
        pageUrl,
        rating,
        userId: req.user?.id,
      },
    });

    res.status(201).json({ message: "Feedback submitted", id: feedback.id });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit feedback" });
  }
}

export async function getFeedbacks(req: AuthRequest, res: Response) {
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

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Failed to load feedback" });
  }
}

export async function markFeedbackRead(req: AuthRequest, res: Response) {
  try {
    const feedback = await prisma.feedback.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Failed to update feedback" });
  }
}

export async function deleteFeedback(req: AuthRequest, res: Response) {
  try {
    await prisma.feedback.delete({ where: { id: req.params.id } });
    res.json({ message: "Feedback deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete feedback" });
  }
}
