import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { success, error } from "../utils/apiResponse";

export const updateProgressSchema = z.object({
  videoId: z.string(),
  progress: z.number().min(0).max(100),
  completed: z.boolean().optional(),
});

export async function updateProgress(req: Request, res: Response) {
  try {
    const { videoId, progress: progressVal, completed } = req.body;

    const watchProgress = await prisma.watchProgress.upsert({
      where: { userId_videoId: { userId: req.user!.id, videoId } },
      update: { progress: progressVal, completed: completed ?? progressVal >= 95 },
      create: {
        userId: req.user!.id,
        videoId,
        progress: progressVal,
        completed: completed ?? progressVal >= 95,
      },
    });

    return success(res, watchProgress);
  } catch (e) {
    console.error("Update progress error:", e);
    return error(res, "Failed to update progress");
  }
}

export async function getProgress(req: Request, res: Response) {
  try {
    const { videoId } = req.params;
    const progress = await prisma.watchProgress.findUnique({
      where: { userId_videoId: { userId: req.user!.id, videoId } },
    });
    return success(res, progress);
  } catch (e) {
    console.error("Get progress error:", e);
    return error(res, "Failed to fetch progress");
  }
}

export async function getCompletedVideos(req: Request, res: Response) {
  try {
    const completed = await prisma.watchProgress.findMany({
      where: { userId: req.user!.id, completed: true },
      include: { video: { select: { id: true, title: true, chapterId: true } } },
    });
    return success(res, completed);
  } catch (e) {
    console.error("Get completed error:", e);
    return error(res, "Failed to fetch completed videos");
  }
}
