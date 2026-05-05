import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();

export async function getNotifications(req: AuthRequest, res: Response) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { isPublished: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 50,
      include: {
        reads: {
          where: { userId: req.user!.id },
          select: { id: true },
        },
      },
    });

    const formatted = notifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      publishedAt: notification.publishedAt,
      createdAt: notification.createdAt,
      read: notification.reads.length > 0,
    }));

    res.json({
      notifications: formatted,
      unreadCount: formatted.filter((notification) => !notification.read).length,
      total: formatted.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
}

export async function markNotificationsRead(req: AuthRequest, res: Response) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { isPublished: true },
      select: { id: true },
    });

    if (notifications.length > 0) {
      await prisma.notificationRead.createMany({
        data: notifications.map((notification) => ({
          userId: req.user!.id,
          notificationId: notification.id,
        })),
        skipDuplicates: true,
      });
    }

    res.json({ message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark notifications as read" });
  }
}
