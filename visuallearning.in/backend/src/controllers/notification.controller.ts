import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { success, error } from "../utils/apiResponse";

export const notificationSchema = z.object({
  title: z.string().min(2).max(120),
  message: z.string().min(2).max(2000),
  type: z.enum(["INFO", "SUCCESS", "WARNING", "ALERT"]).optional(),
  linkUrl: z.string().url().optional().nullable().or(z.literal("")),
  published: z.boolean().optional(),
});

function cleanNotificationData(body: any, wasPublished = false) {
  const published = !!body.published;
  return {
    title: body.title,
    message: body.message,
    type: body.type || "INFO",
    linkUrl: body.linkUrl || null,
    published,
    publishedAt: published ? (wasPublished ? undefined : new Date()) : null,
  };
}

export async function getMyNotifications(req: Request, res: Response) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { published: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 50,
      include: {
        reads: {
          where: { userId: req.user!.id },
          select: { id: true, readAt: true },
        },
      },
    });

    const mapped = notifications.map(({ reads, ...notification }) => ({
      ...notification,
      read: reads.length > 0,
      readAt: reads[0]?.readAt || null,
    }));

    return success(res, {
      notifications: mapped,
      unreadCount: mapped.filter((n) => !n.read).length,
    });
  } catch (e) {
    console.error("Get notifications error:", e);
    return error(res, "Failed to fetch notifications");
  }
}

export async function markMyNotificationsRead(req: Request, res: Response) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { published: true },
      select: { id: true },
    });

    if (notifications.length > 0) {
      await prisma.notificationRead.createMany({
        data: notifications.map((notification) => ({
          notificationId: notification.id,
          userId: req.user!.id,
        })),
        skipDuplicates: true,
      });
    }

    return success(res, { marked: notifications.length }, "Notifications marked as read");
  } catch (e) {
    console.error("Mark notifications read error:", e);
    return error(res, "Failed to mark notifications as read");
  }
}

export async function getAllNotifications(_req: Request, res: Response) {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { reads: true } } },
    });
    return success(res, notifications);
  } catch (e) {
    console.error("Admin get notifications error:", e);
    return error(res, "Failed to fetch notifications");
  }
}

export async function createNotification(req: Request, res: Response) {
  try {
    const notification = await prisma.notification.create({
      data: cleanNotificationData(req.body),
    });
    return success(res, notification, "Notification created", 201);
  } catch (e) {
    console.error("Create notification error:", e);
    return error(res, "Failed to create notification");
  }
}

export async function updateNotification(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const existing = await prisma.notification.findUnique({ where: { id } });
    if (!existing) return error(res, "Notification not found", 404);

    const notification = await prisma.notification.update({
      where: { id },
      data: cleanNotificationData(req.body, existing.published),
    });
    return success(res, notification, "Notification updated");
  } catch (e) {
    console.error("Update notification error:", e);
    return error(res, "Failed to update notification");
  }
}

export async function toggleNotificationPublish(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const existing = await prisma.notification.findUnique({ where: { id } });
    if (!existing) return error(res, "Notification not found", 404);

    const notification = await prisma.notification.update({
      where: { id },
      data: {
        published: !existing.published,
        publishedAt: existing.published ? null : new Date(),
      },
    });

    return success(res, notification, notification.published ? "Notification published" : "Notification unpublished");
  } catch (e) {
    console.error("Toggle notification error:", e);
    return error(res, "Failed to update notification");
  }
}

export async function deleteNotification(req: Request, res: Response) {
  try {
    await prisma.notification.delete({ where: { id: req.params.id } });
    return success(res, null, "Notification deleted");
  } catch (e: any) {
    console.error("Delete notification error:", e);
    return error(res, e.code === "P2025" ? "Notification not found" : "Failed to delete notification");
  }
}
