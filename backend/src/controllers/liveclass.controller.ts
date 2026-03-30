import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { success, error } from "../utils/apiResponse";
import { createRoom, disableRoom, generateAuthToken } from "../utils/hms";
import { sendLiveClassNotificationEmail, sendLiveClassScheduledEmail } from "../utils/email";

// --- Schemas ---

export const createLiveClassSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  scheduledAt: z.string().datetime().optional(),
  notifyTarget: z.enum(["ALL", "SUBSCRIBED"]).default("ALL"),
});

export const updateLiveClassSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(1000).optional(),
  scheduledAt: z.string().datetime().optional(),
  notifyTarget: z.enum(["ALL", "SUBSCRIBED"]).optional(),
});

export const goLiveSchema = z.object({
  notifyTarget: z.enum(["ALL", "SUBSCRIBED"]).default("ALL"),
});

export const addAccessSchema = z.object({
  userIds: z.array(z.string()).min(1),
});

export const addTeacherSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

// --- Teacher: Create a live class ---

export async function createLiveClass(req: Request, res: Response) {
  try {
    const { title, description, scheduledAt, notifyTarget } = req.body;

    const liveClass = await prisma.liveClass.create({
      data: {
        title,
        description,
        teacherId: req.user!.id,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        notifyTarget,
      },
      include: { teacher: { select: { id: true, name: true, email: true } } },
    });

    // Send scheduled notification emails if scheduledAt is provided
    if (scheduledAt) {
      sendScheduleNotifications(notifyTarget, liveClass.title, new Date(scheduledAt), liveClass.teacher.name);
    }

    return success(res, liveClass, "Live class created", 201);
  } catch (e) {
    console.error("Create live class error:", e);
    return error(res, "Failed to create live class");
  }
}

// --- Teacher: Go live (creates 100ms room + starts class) ---

export async function goLive(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { notifyTarget } = req.body;

    const liveClass = await prisma.liveClass.findFirst({
      where: { id, teacherId: req.user!.id },
    });

    if (!liveClass) return error(res, "Live class not found", 404);
    if (liveClass.status === "LIVE") return error(res, "Already live", 400);
    if (liveClass.status === "ENDED") return error(res, "Class has already ended", 400);

    // Create 100ms room
    const hmsRoomId = await createRoom(`live-${id}-${Date.now()}`);

    const updated = await prisma.liveClass.update({
      where: { id },
      data: {
        status: "LIVE",
        hmsRoomId,
        startedAt: new Date(),
        notifyTarget,
      },
      include: { teacher: { select: { id: true, name: true, email: true } } },
    });

    // Generate teacher token
    const teacherToken = generateAuthToken(hmsRoomId, req.user!.id, "host");

    // Send live notifications in background
    sendLiveNotifications(id, notifyTarget, updated.title, updated.teacher.name);

    return success(res, { ...updated, token: teacherToken }, "You are now live!");
  } catch (e) {
    console.error("Go live error:", e);
    return error(res, "Failed to go live");
  }
}

// --- Teacher: End live class ---

export async function endLiveClass(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const liveClass = await prisma.liveClass.findFirst({
      where: { id, teacherId: req.user!.id },
    });

    if (!liveClass) return error(res, "Live class not found", 404);
    if (liveClass.status !== "LIVE") return error(res, "Class is not live", 400);

    // Disable the 100ms room
    if (liveClass.hmsRoomId) {
      try { await disableRoom(liveClass.hmsRoomId); } catch (e) { console.error("Failed to disable room:", e); }
    }

    const updated = await prisma.liveClass.update({
      where: { id },
      data: { status: "ENDED", endedAt: new Date() },
    });

    return success(res, updated, "Live class ended");
  } catch (e) {
    console.error("End live class error:", e);
    return error(res, "Failed to end live class");
  }
}

// --- Teacher: Get token to rejoin (if page refreshed while live) ---

export async function getTeacherToken(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const liveClass = await prisma.liveClass.findFirst({
      where: { id, teacherId: req.user!.id, status: "LIVE" },
    });

    if (!liveClass || !liveClass.hmsRoomId) return error(res, "No active live class", 404);

    const token = generateAuthToken(liveClass.hmsRoomId, req.user!.id, "host");
    return success(res, { token, hmsRoomId: liveClass.hmsRoomId });
  } catch (e) {
    console.error("Get teacher token error:", e);
    return error(res, "Failed to get token");
  }
}

// --- Teacher: Update live class ---

export async function updateLiveClass(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const liveClass = await prisma.liveClass.findFirst({
      where: { id, teacherId: req.user!.id },
    });

    if (!liveClass) return error(res, "Live class not found", 404);
    if (liveClass.status === "LIVE") return error(res, "Cannot update while live", 400);

    const updated = await prisma.liveClass.update({
      where: { id },
      data: {
        ...req.body,
        scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : liveClass.scheduledAt,
      },
    });

    return success(res, updated, "Live class updated");
  } catch (e) {
    console.error("Update live class error:", e);
    return error(res, "Failed to update live class");
  }
}

// --- Teacher: Delete live class ---

export async function deleteLiveClass(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const liveClass = await prisma.liveClass.findFirst({
      where: { id, teacherId: req.user!.id },
    });

    if (!liveClass) return error(res, "Live class not found", 404);
    if (liveClass.status === "LIVE") return error(res, "Cannot delete while live", 400);

    await prisma.liveClass.delete({ where: { id } });
    return success(res, null, "Live class deleted");
  } catch (e) {
    console.error("Delete live class error:", e);
    return error(res, "Failed to delete live class");
  }
}

// --- Teacher: Get my live classes ---

export async function getMyLiveClasses(req: Request, res: Response) {
  try {
    const classes = await prisma.liveClass.findMany({
      where: { teacherId: req.user!.id },
      include: {
        teacher: { select: { id: true, name: true } },
        _count: { select: { accessList: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return success(res, classes);
  } catch (e) {
    console.error("Get my live classes error:", e);
    return error(res, "Failed to fetch live classes");
  }
}

// --- Teacher: Add users to live class access ---

export async function addLiveClassAccess(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { userIds } = req.body;

    const liveClass = await prisma.liveClass.findFirst({
      where: { id, teacherId: req.user!.id },
    });

    if (!liveClass) return error(res, "Live class not found", 404);

    const existing = await prisma.liveClassAccess.findMany({
      where: { liveClassId: id, userId: { in: userIds } },
      select: { userId: true },
    });
    const existingIds = new Set(existing.map((e) => e.userId));
    const newUserIds = userIds.filter((uid: string) => !existingIds.has(uid));

    if (newUserIds.length > 0) {
      await prisma.liveClassAccess.createMany({
        data: newUserIds.map((userId: string) => ({ liveClassId: id, userId })),
      });
    }

    return success(res, { added: newUserIds.length }, "Users added to live class");
  } catch (e) {
    console.error("Add access error:", e);
    return error(res, "Failed to add users");
  }
}

// --- Teacher: Remove user from live class access ---

export async function removeLiveClassAccess(req: Request, res: Response) {
  try {
    const { id, userId } = req.params;

    const liveClass = await prisma.liveClass.findFirst({
      where: { id, teacherId: req.user!.id },
    });

    if (!liveClass) return error(res, "Live class not found", 404);

    await prisma.liveClassAccess.deleteMany({
      where: { liveClassId: id, userId },
    });

    return success(res, null, "User removed from live class");
  } catch (e) {
    console.error("Remove access error:", e);
    return error(res, "Failed to remove user");
  }
}

// --- Teacher: Get access list for a live class ---

export async function getLiveClassAccessList(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const liveClass = await prisma.liveClass.findFirst({
      where: { id, teacherId: req.user!.id },
    });

    if (!liveClass) return error(res, "Live class not found", 404);

    const accessList = await prisma.liveClassAccess.findMany({
      where: { liveClassId: id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return success(res, accessList);
  } catch (e) {
    console.error("Get access list error:", e);
    return error(res, "Failed to fetch access list");
  }
}

// --- Teacher: Search users ---

export async function searchUsers(req: Request, res: Response) {
  try {
    const { q } = req.query;
    if (!q || typeof q !== "string" || q.length < 2) {
      return error(res, "Search query must be at least 2 characters", 400);
    }

    const users = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        blocked: false,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, email: true },
      take: 20,
    });

    return success(res, users);
  } catch (e) {
    console.error("Search users error:", e);
    return error(res, "Failed to search users");
  }
}

// --- Student: Get available/active live classes ---

export async function getActiveLiveClasses(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    const activeSubscription = await prisma.subscription.findFirst({
      where: { userId, status: "ACTIVE", expiryDate: { gt: new Date() } },
    });

    const isSubscribed = !!activeSubscription;

    const classes = await prisma.liveClass.findMany({
      where: {
        status: { in: ["LIVE", "SCHEDULED"] },
        OR: [
          { notifyTarget: "ALL" },
          ...(isSubscribed ? [{ notifyTarget: "SUBSCRIBED" as const }] : []),
          { accessList: { some: { userId } } },
        ],
      },
      include: {
        teacher: { select: { id: true, name: true } },
        accessList: { where: { userId }, select: { id: true } },
      },
      orderBy: [{ status: "asc" }, { scheduledAt: "asc" }],
    });

    const result = classes.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      status: c.status,
      scheduledAt: c.scheduledAt,
      startedAt: c.startedAt,
      teacher: c.teacher,
      hasAccess: isSubscribed || c.accessList.length > 0 || c.notifyTarget === "ALL",
    }));

    return success(res, { classes: result, isSubscribed });
  } catch (e) {
    console.error("Get active live classes error:", e);
    return error(res, "Failed to fetch live classes");
  }
}

// --- Student: Join live class (get 100ms token) ---

export async function joinLiveClass(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const liveClass = await prisma.liveClass.findUnique({
      where: { id },
      include: {
        teacher: { select: { id: true, name: true } },
        accessList: { where: { userId }, select: { id: true } },
      },
    });

    if (!liveClass) return error(res, "Live class not found", 404);
    if (liveClass.status !== "LIVE") return error(res, "This class is not live yet", 400);
    if (!liveClass.hmsRoomId) return error(res, "Room not ready", 400);

    // Check access
    const activeSubscription = await prisma.subscription.findFirst({
      where: { userId, status: "ACTIVE", expiryDate: { gt: new Date() } },
    });

    const hasAccess = !!activeSubscription || liveClass.accessList.length > 0 || liveClass.notifyTarget === "ALL";

    if (!hasAccess) {
      return error(res, "You don't have access to this live class. Please subscribe or contact your teacher.", 403);
    }

    const token = generateAuthToken(liveClass.hmsRoomId, userId, "guest");

    return success(res, {
      token,
      roomId: liveClass.hmsRoomId,
      title: liveClass.title,
      teacher: liveClass.teacher,
    });
  } catch (e) {
    console.error("Join live class error:", e);
    return error(res, "Failed to join live class");
  }
}

// --- Admin: Get all live classes ---

export async function getAllLiveClasses(req: Request, res: Response) {
  try {
    const classes = await prisma.liveClass.findMany({
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        _count: { select: { accessList: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return success(res, classes);
  } catch (e) {
    console.error("Get all live classes error:", e);
    return error(res, "Failed to fetch live classes");
  }
}

// --- Admin: Get all teachers ---

export async function getAllTeachers(req: Request, res: Response) {
  try {
    const teachers = await prisma.user.findMany({
      where: { role: "TEACHER" },
      select: {
        id: true, name: true, email: true, blocked: true, createdAt: true,
        _count: { select: { liveClasses: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return success(res, teachers);
  } catch (e) {
    console.error("Get teachers error:", e);
    return error(res, "Failed to fetch teachers");
  }
}

// --- Admin: Add teacher ---

export async function addTeacher(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      if (existing.role === "TEACHER") return error(res, "User is already a teacher", 409);
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: { role: "TEACHER" },
        select: { id: true, name: true, email: true, role: true },
      });
      return success(res, updated, "User promoted to teacher", 200);
    }

    const { hashPassword } = await import("../utils/password");
    const hashed = await hashPassword(password);

    const teacher = await prisma.user.create({
      data: { name, email, password: hashed, role: "TEACHER", emailVerified: true },
      select: { id: true, name: true, email: true, role: true },
    });

    return success(res, teacher, "Teacher added", 201);
  } catch (e) {
    console.error("Add teacher error:", e);
    return error(res, "Failed to add teacher");
  }
}

// --- Admin: Remove teacher ---

export async function removeTeacher(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return error(res, "User not found", 404);
    if (user.role !== "TEACHER") return error(res, "User is not a teacher", 400);

    await prisma.user.update({ where: { id }, data: { role: "STUDENT" } });
    return success(res, null, "Teacher removed (demoted to student)");
  } catch (e) {
    console.error("Remove teacher error:", e);
    return error(res, "Failed to remove teacher");
  }
}

// --- Admin: Delete any live class ---

export async function adminDeleteLiveClass(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const liveClass = await prisma.liveClass.findUnique({ where: { id } });
    if (!liveClass) return error(res, "Live class not found", 404);

    if (liveClass.hmsRoomId) {
      try { await disableRoom(liveClass.hmsRoomId); } catch {}
    }

    await prisma.liveClass.delete({ where: { id } });
    return success(res, null, "Live class deleted");
  } catch (e) {
    console.error("Admin delete live class error:", e);
    return error(res, "Failed to delete live class");
  }
}

// --- Notification helpers ---

async function sendLiveNotifications(liveClassId: string, target: string, title: string, teacherName: string) {
  try {
    let users;
    if (target === "SUBSCRIBED") {
      const subscriptions = await prisma.subscription.findMany({
        where: { status: "ACTIVE", expiryDate: { gt: new Date() } },
        select: { userId: true },
        distinct: ["userId"],
      });
      const userIds = subscriptions.map((s) => s.userId);
      users = await prisma.user.findMany({
        where: { id: { in: userIds }, blocked: false },
        select: { email: true, name: true },
      });
    } else {
      users = await prisma.user.findMany({
        where: { role: "STUDENT", blocked: false },
        select: { email: true, name: true },
      });
    }

    // Also include users with explicit access
    const accessUsers = await prisma.liveClassAccess.findMany({
      where: { liveClassId },
      include: { user: { select: { email: true, name: true } } },
    });

    const allEmails = new Set<string>();
    const emailList: { email: string; name: string }[] = [];

    for (const u of users) {
      if (!allEmails.has(u.email)) { allEmails.add(u.email); emailList.push(u); }
    }
    for (const a of accessUsers) {
      if (!allEmails.has(a.user.email)) { allEmails.add(a.user.email); emailList.push(a.user); }
    }

    for (let i = 0; i < emailList.length; i += 10) {
      const batch = emailList.slice(i, i + 10);
      await Promise.allSettled(
        batch.map((u) => sendLiveClassNotificationEmail(u.email, u.name, title, teacherName))
      );
    }
    console.log(`Sent live notifications to ${emailList.length} users`);
  } catch (e) {
    console.error("Failed to send live notifications:", e);
  }
}

async function sendScheduleNotifications(target: string, title: string, scheduledAt: Date, teacherName: string) {
  try {
    let users;
    if (target === "SUBSCRIBED") {
      const subscriptions = await prisma.subscription.findMany({
        where: { status: "ACTIVE", expiryDate: { gt: new Date() } },
        select: { userId: true },
        distinct: ["userId"],
      });
      const userIds = subscriptions.map((s) => s.userId);
      users = await prisma.user.findMany({
        where: { id: { in: userIds }, blocked: false },
        select: { email: true, name: true },
      });
    } else {
      users = await prisma.user.findMany({
        where: { role: "STUDENT", blocked: false },
        select: { email: true, name: true },
      });
    }

    for (let i = 0; i < users.length; i += 10) {
      const batch = users.slice(i, i + 10);
      await Promise.allSettled(
        batch.map((u) => sendLiveClassScheduledEmail(u.email, u.name, title, scheduledAt, teacherName))
      );
    }
    console.log(`Sent schedule notifications to ${users.length} users`);
  } catch (e) {
    console.error("Failed to send schedule notifications:", e);
  }
}
