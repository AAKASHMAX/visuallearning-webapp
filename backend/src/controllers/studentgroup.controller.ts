import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { success, error } from "../utils/apiResponse";

export const createGroupSchema = z.object({
  name: z.string().min(2).max(100),
});

export const addMembersSchema = z.object({
  userIds: z.array(z.string()).min(1),
});

// Get all groups (admin/teacher)
export async function getStudentGroups(req: Request, res: Response) {
  try {
    const groups = await prisma.studentGroup.findMany({
      where: { createdBy: req.user!.id },
      include: {
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return success(res, groups);
  } catch (e) {
    console.error("Get student groups error:", e);
    return error(res, "Failed to fetch student groups");
  }
}

// Create group
export async function createStudentGroup(req: Request, res: Response) {
  try {
    const { name } = req.body;
    const group = await prisma.studentGroup.create({
      data: { name, createdBy: req.user!.id },
      include: { _count: { select: { members: true } } },
    });
    return success(res, group, "Student group created", 201);
  } catch (e) {
    console.error("Create student group error:", e);
    return error(res, "Failed to create student group");
  }
}

// Update group name
export async function updateStudentGroup(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const group = await prisma.studentGroup.findFirst({ where: { id, createdBy: req.user!.id } });
    if (!group) return error(res, "Group not found", 404);
    const updated = await prisma.studentGroup.update({
      where: { id },
      data: { name },
      include: { _count: { select: { members: true } } },
    });
    return success(res, updated, "Group updated");
  } catch (e) {
    console.error("Update student group error:", e);
    return error(res, "Failed to update group");
  }
}

// Delete group
export async function deleteStudentGroup(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const group = await prisma.studentGroup.findFirst({ where: { id, createdBy: req.user!.id } });
    if (!group) return error(res, "Group not found", 404);
    await prisma.studentGroup.delete({ where: { id } });
    return success(res, null, "Group deleted");
  } catch (e) {
    console.error("Delete student group error:", e);
    return error(res, "Failed to delete group");
  }
}

// Get group with members
export async function getGroupMembers(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const group = await prisma.studentGroup.findFirst({
      where: { id, createdBy: req.user!.id },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!group) return error(res, "Group not found", 404);
    return success(res, group);
  } catch (e) {
    console.error("Get group members error:", e);
    return error(res, "Failed to fetch group members");
  }
}

// Add members to group
export async function addGroupMembers(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { userIds } = req.body;
    const group = await prisma.studentGroup.findFirst({ where: { id, createdBy: req.user!.id } });
    if (!group) return error(res, "Group not found", 404);

    const existing = await prisma.studentGroupMember.findMany({
      where: { groupId: id, userId: { in: userIds } },
      select: { userId: true },
    });
    const existingIds = new Set(existing.map((e) => e.userId));
    const newUserIds = userIds.filter((uid: string) => !existingIds.has(uid));

    if (newUserIds.length > 0) {
      await prisma.studentGroupMember.createMany({
        data: newUserIds.map((userId: string) => ({ groupId: id, userId })),
      });
    }
    return success(res, { added: newUserIds.length }, "Members added");
  } catch (e) {
    console.error("Add group members error:", e);
    return error(res, "Failed to add members");
  }
}

// Remove member from group
export async function removeGroupMember(req: Request, res: Response) {
  try {
    const { id, userId } = req.params;
    const group = await prisma.studentGroup.findFirst({ where: { id, createdBy: req.user!.id } });
    if (!group) return error(res, "Group not found", 404);
    await prisma.studentGroupMember.deleteMany({ where: { groupId: id, userId } });
    return success(res, null, "Member removed");
  } catch (e) {
    console.error("Remove group member error:", e);
    return error(res, "Failed to remove member");
  }
}
