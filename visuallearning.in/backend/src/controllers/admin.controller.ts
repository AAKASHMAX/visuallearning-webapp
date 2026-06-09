import { Request, Response } from "express";
import { z } from "zod";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "../config/prisma";
import { config } from "../config";
import { success, error } from "../utils/apiResponse";
import { cacheInvalidate } from "../utils/cache";

// --- Cloudinary setup ---
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

// --- Schemas ---
export const classSchema = z.object({ name: z.string().min(1), order: z.number().int().optional() });
export const subjectSchema = z.object({ 
  classId: z.string(), 
  name: z.string().min(1), 
  icon: z.string().optional(),
  price: z.number().int().min(0).optional(),
});
export const chapterSchema = z.object({ subjectId: z.string(), name: z.string().min(1), order: z.number().int().optional() });
export const videoSchema = z.object({
  chapterId: z.string(), title: z.string().min(1),
  youtubeVideoId: z.string().optional().default(""),
  vimeoVideoId: z.string().optional().nullable(),
  language: z.string().optional(),
  duration: z.string().optional(), order: z.number().int().optional(), isFree: z.boolean().optional(),
  type: z.string().optional(),
});
export const noteSchema = z.object({ chapterId: z.string(), title: z.string().min(1), pdfUrl: z.string().min(1), htmlContent: z.string().optional().nullable(), cssContent: z.string().optional().nullable() });
export const boardPaperSchema = z.object({
  subjectId: z.string(), year: z.number().int(), title: z.string().min(1), pdfUrl: z.string().min(1), order: z.number().int().optional(),
});
export const questionSchema = z.object({
  chapterId: z.string(), questionText: z.string().min(1),
  optionA: z.string(), optionB: z.string(), optionC: z.string(), optionD: z.string(),
  correctOption: z.enum(["A", "B", "C", "D"]), solution: z.string().optional(),
});
export const courseSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  accentColor: z.string().optional(),
  icon: z.string().optional(),
  planKey: z.string().optional().nullable(),
  vimeoVideoId: z.string().optional().nullable(),
});

// --- Dashboard Stats ---
export async function getStats(_req: Request, res: Response) {
  try {
    const [totalUsers, activeSubscriptions, totalRevenue, totalVideos, recentUsers] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.subscription.count({ where: { status: "ACTIVE", expiryDate: { gt: new Date() } } }),
      prisma.subscription.aggregate({ _sum: { amount: true }, where: { status: "ACTIVE" } }),
      prisma.video.count(),
      prisma.user.findMany({
        where: { role: "STUDENT" },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, name: true, email: true, createdAt: true },
      }),
    ]);

    return success(res, {
      totalUsers,
      activeSubscriptions,
      totalRevenue: (totalRevenue._sum.amount || 0) / 100,
      totalVideos,
      recentUsers,
    });
  } catch (e) {
    console.error("Stats error:", e);
    return error(res, "Failed to fetch stats");
  }
}

// --- User Management ---
export async function getAllUsers(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || "";

    const where = {
      role: "STUDENT" as const,
      ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { email: { contains: search, mode: "insensitive" as const } }] } : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, blocked: true, emailVerified: true, createdAt: true },
      }),
      prisma.user.count({ where }),
    ]);

    // Get subscription status for each user
    const userIds = users.map((u) => u.id);
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: { in: userIds }, status: "ACTIVE", expiryDate: { gt: new Date() } },
      select: { userId: true, plan: true, expiryDate: true },
    });
    const subMap = new Map(subscriptions.map((s) => [s.userId, s]));

    const usersWithSub = users.map((u) => ({ ...u, subscription: subMap.get(u.id) || null }));

    return success(res, { users: usersWithSub, total, page, totalPages: Math.ceil(total / limit) });
  } catch (e) {
    console.error("Get users error:", e);
    return error(res, "Failed to fetch users");
  }
}

export async function toggleBlockUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return error(res, "User not found", 404);
    if (user.role === "ADMIN") return error(res, "Cannot block an admin", 400);

    const updated = await prisma.user.update({
      where: { id },
      data: { blocked: !user.blocked },
      select: { id: true, name: true, blocked: true },
    });
    return success(res, updated, updated.blocked ? "User blocked" : "User unblocked");
  } catch (e) {
    console.error("Toggle block error:", e);
    return error(res, "Failed to update user");
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!user) return error(res, "User not found", 404);
    if (user.role === "ADMIN") return error(res, "Cannot delete an admin", 400);

    await prisma.user.delete({ where: { id } });
    cacheInvalidate(`access:${id}:`);

    return success(res, { id: user.id, email: user.email }, `${user.name || user.email} deleted permanently`);
  } catch (e: any) {
    console.error("Delete user error:", e);
    return error(res, e.code === "P2025" ? "User not found" : "Failed to delete user");
  }
}

// --- CRUD Helpers ---
async function crudCreate(model: any, data: any, res: Response) {
  try {
    const result = await model.create({ data });
    return success(res, result, "Created successfully", 201);
  } catch (e: any) {
    console.error("Create error:", e);
    return error(res, e.code === "P2002" ? "Already exists" : "Failed to create");
  }
}

async function crudUpdate(model: any, id: string, data: any, res: Response) {
  try {
    // Strip fields that should not be sent to Prisma update
    const { id: _id, createdAt, updatedAt, chapter, subject, class: cls, videos, notes, questions, ...cleanData } = data;
    const result = await model.update({ where: { id }, data: cleanData });
    return success(res, result, "Updated successfully");
  } catch (e: any) {
    console.error("Update error:", e);
    return error(res, e.code === "P2025" ? "Not found" : "Failed to update");
  }
}

async function crudDelete(model: any, id: string, res: Response) {
  try {
    await model.delete({ where: { id } });
    return success(res, null, "Deleted successfully");
  } catch (e: any) {
    console.error("Delete error:", e);
    return error(res, e.code === "P2025" ? "Not found" : "Failed to delete");
  }
}

// --- Classes ---
export async function addClass(req: Request, res: Response) { return crudCreate(prisma.class, req.body, res); }
export async function updateClass(req: Request, res: Response) { return crudUpdate(prisma.class, req.params.id, req.body, res); }
export async function deleteClass(req: Request, res: Response) { return crudDelete(prisma.class, req.params.id, res); }

// --- Subjects ---
export async function addSubject(req: Request, res: Response) { return crudCreate(prisma.subject, req.body, res); }
export async function updateSubject(req: Request, res: Response) { return crudUpdate(prisma.subject, req.params.id, req.body, res); }
export async function deleteSubject(req: Request, res: Response) { return crudDelete(prisma.subject, req.params.id, res); }

export async function toggleSubjectAccess(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const subject = await prisma.subject.findUnique({ where: { id } });
    if (!subject) return error(res, "Subject not found", 404);

    const updated = await prisma.subject.update({
      where: { id },
      data: { enabled: !subject.enabled },
      include: { class: true },
    });
    // Invalidate cached subjects for this class
    cacheInvalidate(`subjects:${subject.classId}`);
    return success(res, updated, `${updated.name} ${updated.enabled ? "enabled" : "disabled"}`);
  } catch (e) {
    console.error("Toggle subject access error:", e);
    return error(res, "Failed to toggle subject access");
  }
}

export async function getSubjectAccessList(_req: Request, res: Response) {
  try {
    const classes = await prisma.class.findMany({
      orderBy: { order: "asc" },
      include: {
        subjects: {
          select: { id: true, name: true, icon: true, enabled: true, price: true },
        },
      },
    });
    return success(res, classes);
  } catch (e) {
    console.error("Get subject access list error:", e);
    return error(res, "Failed to fetch subject access list");
  }
}

// --- Chapters ---
export async function addChapter(req: Request, res: Response) { return crudCreate(prisma.chapter, req.body, res); }
export async function updateChapter(req: Request, res: Response) { return crudUpdate(prisma.chapter, req.params.id, req.body, res); }
export async function deleteChapter(req: Request, res: Response) { return crudDelete(prisma.chapter, req.params.id, res); }

// --- Videos ---
export async function getChapterVideos(req: Request, res: Response) {
  try {
    const videos = await prisma.video.findMany({
      where: { chapterId: req.params.chapterId },
      orderBy: { order: "asc" },
    });
    return success(res, videos);
  } catch (e) {
    return error(res, "Failed to fetch videos");
  }
}

function cleanVideoData(data: any) {
  const { id, createdAt, updatedAt, chapter, ...cleanData } = data;
  return {
    ...cleanData,
    title: String(cleanData.title || "").replace(/^\s*\d+([.)]|[-:]|\s)+\s*/, "").trim(),
    type: "ANIMATED_VIDEO",
  };
}

export async function addVideo(req: Request, res: Response) { return crudCreate(prisma.video, cleanVideoData(req.body), res); }
export async function updateVideo(req: Request, res: Response) { return crudUpdate(prisma.video, req.params.id, cleanVideoData(req.body), res); }
export async function deleteVideo(req: Request, res: Response) { return crudDelete(prisma.video, req.params.id, res); }

// --- File Upload (Cloudinary) ---
export async function uploadPdf(req: Request, res: Response) {
  try {
    const file = req.file;
    if (!file) return error(res, "No file uploaded", 400);

    const folder = req.body.folder || "notes";
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "raw",
      folder,
      use_filename: true,
      unique_filename: true,
    });

    // Clean up temp file
    const fs = await import("fs");
    fs.unlink(file.path, () => {});

    return success(res, { url: result.secure_url, publicId: result.public_id }, "File uploaded successfully");
  } catch (e) {
    console.error("Upload error:", e);
    return error(res, "Failed to upload file");
  }
}

// --- HTML Notes Upload ---
export async function uploadHtmlNote(req: Request, res: Response) {
  try {
    const fs = await import("fs");
    const path = await import("path");
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const htmlFile = files?.html?.[0];
    const cssFile = files?.css?.[0];
    const pdfFile = files?.pdf?.[0];
    const imageFiles = files?.images || [];

    if (!htmlFile) return error(res, "HTML file is required", 400);

    const folder = req.body.folder || "notes-html";

    // 1. Upload images to Cloudinary and build URL map
    const imageUrlMap: Record<string, string> = {};
    for (const img of imageFiles) {
      const ext = path.extname(img.originalname).toLowerCase();
      const isSvg = ext === ".svg";
      const result = await cloudinary.uploader.upload(img.path, {
        resource_type: isSvg ? "raw" : "image",
        folder: `${folder}/images`,
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      });
      imageUrlMap[img.originalname] = result.secure_url;
      fs.unlink(img.path, () => {});
    }

    // 2. Read HTML and rewrite image paths
    let htmlContent = fs.readFileSync(htmlFile.path, "utf-8");
    // Replace ../images/filename references with Cloudinary URLs
    htmlContent = htmlContent.replace(/(?:\.\.\/images\/|images\/)([^"'\s)]+)/g, (_match, filename) => {
      return imageUrlMap[filename] || _match;
    });
    // Strip <head>...</head>, <html>, <body>, <!DOCTYPE> tags — keep only inner body content
    htmlContent = htmlContent
      .replace(/<!DOCTYPE[^>]*>/i, "")
      .replace(/<html[^>]*>/i, "")
      .replace(/<\/html>/i, "")
      .replace(/<head[\s\S]*?<\/head>/i, "")
      .replace(/<body[^>]*>/i, "")
      .replace(/<\/body>/i, "")
      .trim();

    fs.unlink(htmlFile.path, () => {});

    // 3. Read CSS if provided
    let cssContent: string | null = null;
    if (cssFile) {
      cssContent = fs.readFileSync(cssFile.path, "utf-8");
      fs.unlink(cssFile.path, () => {});
    }

    // 4. Upload PDF if provided
    let pdfUrl: string | null = null;
    if (pdfFile) {
      const pdfResult = await cloudinary.uploader.upload(pdfFile.path, {
        resource_type: "raw",
        folder,
        use_filename: true,
        unique_filename: true,
      });
      pdfUrl = pdfResult.secure_url;
      fs.unlink(pdfFile.path, () => {});
    }

    return success(res, {
      htmlContent,
      cssContent,
      pdfUrl,
      imagesUploaded: Object.keys(imageUrlMap).length,
    }, "HTML note processed successfully");
  } catch (e) {
    console.error("HTML note upload error:", e);
    return error(res, "Failed to process HTML note");
  }
}

// --- Notes ---
export async function addNote(req: Request, res: Response) { return crudCreate(prisma.note, req.body, res); }
export async function updateNote(req: Request, res: Response) { return crudUpdate(prisma.note, req.params.id, req.body, res); }
export async function deleteNote(req: Request, res: Response) { return crudDelete(prisma.note, req.params.id, res); }

// --- Questions ---
export async function addQuestion(req: Request, res: Response) { return crudCreate(prisma.question, req.body, res); }
export async function updateQuestion(req: Request, res: Response) { return crudUpdate(prisma.question, req.params.id, req.body, res); }
export async function deleteQuestion(req: Request, res: Response) { return crudDelete(prisma.question, req.params.id, res); }

// --- Board Papers ---
export async function addBoardPaper(req: Request, res: Response) { return crudCreate(prisma.boardPaper, req.body, res); }
export async function updateBoardPaper(req: Request, res: Response) { return crudUpdate(prisma.boardPaper, req.params.id, req.body, res); }
export async function deleteBoardPaper(req: Request, res: Response) { return crudDelete(prisma.boardPaper, req.params.id, res); }

// --- Courses ---
export async function getAllCourses(_req: Request, res: Response) {
  try {
    const courses = await prisma.course.findMany({
      include: { _count: { select: { chapters: true } } },
      orderBy: { createdAt: "desc" },
    });
    return success(res, courses);
  } catch (e) {
    return error(res, "Failed to fetch courses");
  }
}

export async function addCourse(req: Request, res: Response) { return crudCreate(prisma.course, req.body, res); }
export async function updateCourse(req: Request, res: Response) { return crudUpdate(prisma.course, req.params.id, req.body, res); }
export async function deleteCourse(req: Request, res: Response) { return crudDelete(prisma.course, req.params.id, res); }

export async function getCourseWithChapters(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        chapters: {
          include: {
            chapter: {
              include: { subject: { include: { class: true } } }
            }
          },
          orderBy: { order: "asc" }
        }
      }
    });
    if (!course) return error(res, "Course not found", 404);
    return success(res, course);
  } catch (e) {
    return error(res, "Failed to fetch course details");
  }
}

export async function getChaptersList(req: Request, res: Response) {
  try {
    const chapters = await prisma.chapter.findMany({
      include: {
        subject: {
          include: { class: true }
        },
        _count: {
          select: { videos: true, notes: true, questions: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    return success(res, chapters);
  } catch (e) {
    return error(res, "Failed to fetch chapters list");
  }
}

export async function addChapterToCourse(req: Request, res: Response) {
  try {
    const { id } = req.params; // courseId
    const { chapterId, order } = req.body;
    
    const result = await prisma.courseChapter.create({
      data: { courseId: id, chapterId, order: order || 0 }
    });
    return success(res, result, "Chapter added to course", 201);
  } catch (e: any) {
    console.error("Add chapter to course error:", e);
    return error(res, e.code === "P2002" ? "Chapter already in course" : "Failed to add chapter");
  }
}

export async function removeChapterFromCourse(req: Request, res: Response) {
  try {
    const { id, chapterId } = req.params;
    await prisma.courseChapter.delete({
      where: { courseId_chapterId: { courseId: id, chapterId } }
    });
    return success(res, null, "Chapter removed from course");
  } catch (e) {
    return error(res, "Failed to remove chapter");
  }
}

export async function getChaptersGroupedBySubject(_req: Request, res: Response) {
  try {
    const classes = await prisma.class.findMany({
      include: {
        subjects: {
          include: {
            chapters: {
              orderBy: { order: "asc" }
            }
          }
        }
      },
      orderBy: { order: "asc" }
    });
    return success(res, classes);
  } catch (e) {
    return error(res, "Failed to fetch chapters");
  }
}

// --- Subscriptions Management ---
export const grantSubscriptionSchema = z.object({
  userId: z.string(),
  courseId: z.string().optional(),
  plan: z.string().optional(),
  classesAccess: z.array(z.string()).optional(),
  subjectsAccess: z.array(z.string()).optional(),
  durationDays: z.number().int().min(1),
  amount: z.number().int().min(0).optional(),
});

export const updateSubscriptionSchema = z.object({
  plan: z.string().optional(),
  courseId: z.string().optional().nullable(),
  classesAccess: z.array(z.string()).optional(),
  subjectsAccess: z.array(z.string()).optional(),
  status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED"]).optional(),
  expiryDate: z.string().optional(),
});

export async function getAllSubscriptions(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string || "";

    const where = status ? { status: status as any } : {};

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          course: { select: { id: true, name: true, slug: true, planKey: true, accentColor: true, icon: true } },
        },
      }),
      prisma.subscription.count({ where }),
    ]);

    return success(res, { subscriptions, total, page, totalPages: Math.ceil(total / limit) });
  } catch (e) {
    console.error("Get subscriptions error:", e);
    return error(res, "Failed to fetch subscriptions");
  }
}

export async function grantSubscription(req: Request, res: Response) {
  try {
    const { userId, courseId, plan, classesAccess, subjectsAccess, durationDays, amount } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return error(res, "User not found", 404);

    const course = courseId
      ? await prisma.course.findUnique({
          where: { id: courseId },
          include: {
            chapters: {
              include: { chapter: { select: { subjectId: true, subject: { select: { classId: true } } } } },
            },
          },
        })
      : null;

    if (courseId && !course) return error(res, "Course not found", 404);

    const resolvedPlan = course?.planKey || plan || course?.slug;
    if (!resolvedPlan) return error(res, "Select a course plan", 400);

    let resolvedClasses = classesAccess || [];
    let resolvedSubjects = subjectsAccess || [];

    let assignedCourseId: string | null = course?.id || null;
    const planConfig = course ? null : await getAdminPlanConfig(resolvedPlan);

    if (course) {
      resolvedClasses = Array.from(new Set(course.chapters.map((cc) => cc.chapter.subject.classId)));
      resolvedSubjects = Array.from(new Set(course.chapters.map((cc) => cc.chapter.subjectId)));
    } else if (resolvedPlan === "FLEXI_PLAN") {
      if (resolvedSubjects.length > 0) {
        const subjects = await prisma.subject.findMany({
          where: { id: { in: resolvedSubjects } },
          select: { classId: true },
        });
        resolvedClasses = Array.from(new Set(subjects.map((s) => s.classId)));
      }
    } else if (planConfig?.unitType === "subject") {
      if (!resolvedSubjects.length) return error(res, "Select at least one subject", 400);
      const resolved = await resolveProfessionalSubjectAccess(resolvedSubjects);
      if (!resolved.subjectIds.length) return error(res, "No matching subjects found", 400);
      resolvedSubjects = resolved.subjectIds;
      resolvedClasses = resolved.classIds;
      assignedCourseId = null;
    } else if (planConfig?.unitType === "class") {
      if (!resolvedClasses.length) return error(res, "Select at least one class", 400);
      const validClassCount = await prisma.class.count({ where: { id: { in: resolvedClasses } } });
      if (validClassCount !== resolvedClasses.length) return error(res, "Invalid class selection", 400);
      resolvedClasses = Array.from(new Set(resolvedClasses));
      resolvedSubjects = [];
      assignedCourseId = null;
    } else {
      const matchingCourse = await prisma.course.findFirst({ where: { planKey: resolvedPlan } });
      if (matchingCourse) {
        assignedCourseId = matchingCourse.id;
        const courseChapters = await prisma.courseChapter.findMany({
          where: { courseId: matchingCourse.id },
          include: { chapter: { select: { subjectId: true, subject: { select: { classId: true } } } } },
        });
        resolvedClasses = Array.from(new Set(courseChapters.map((cc) => cc.chapter.subject.classId)));
        resolvedSubjects = Array.from(new Set(courseChapters.map((cc) => cc.chapter.subjectId)));
      } else if (resolvedClasses.length === 0) {
        const allClasses = await prisma.class.findMany({ select: { id: true } });
        resolvedClasses = allClasses.map((c) => c.id);
      }
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + durationDays);

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        plan: resolvedPlan,
        courseId: assignedCourseId,
        classesAccess: resolvedClasses,
        subjectsAccess: resolvedSubjects,
        expiryDate,
        status: "ACTIVE",
        amount: amount || 0,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, name: true, slug: true, planKey: true, accentColor: true, icon: true } },
      },
    });

    cacheInvalidate(`access:${userId}:`);
    return success(res, subscription, "Course plan assigned successfully", 201);
  } catch (e) {
    console.error("Grant subscription error:", e);
    return error(res, "Failed to grant subscription");
  }
}

export async function updateSubscription(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { plan, courseId, classesAccess, subjectsAccess, status: newStatus, expiryDate } = req.body;

    const existing = await prisma.subscription.findUnique({ where: { id } });
    if (!existing) return error(res, "Subscription not found", 404);

    const updateData: any = {};
    if (plan) updateData.plan = plan;
    if (courseId !== undefined) updateData.courseId = courseId || null;
    if (classesAccess) updateData.classesAccess = classesAccess;
    if (subjectsAccess) updateData.subjectsAccess = subjectsAccess;
    if (newStatus) updateData.status = newStatus;
    if (expiryDate) updateData.expiryDate = new Date(expiryDate);

    const subscription = await prisma.subscription.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, name: true, slug: true, planKey: true, accentColor: true, icon: true } },
      },
    });

    cacheInvalidate(`access:${existing.userId}:`);
    return success(res, subscription, "Subscription updated");
  } catch (e) {
    console.error("Update subscription error:", e);
    return error(res, "Failed to update subscription");
  }
}

export async function cancelSubscription(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const existing = await prisma.subscription.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!existing) return error(res, "Subscription not found", 404);

    const result = await prisma.subscription.updateMany({
      where: {
        userId: existing.userId,
        status: "ACTIVE",
      },
      data: { status: "CANCELLED" },
    });

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, name: true, slug: true, planKey: true, accentColor: true, icon: true } },
      },
    });

    cacheInvalidate(`access:${existing.userId}:`);
    return success(res, { subscription, cancelled: result.count }, `Cancelled ${result.count} active subscription${result.count === 1 ? "" : "s"} for this user`);
  } catch (e: any) {
    console.error("Cancel subscription error:", e);
    return error(res, "Failed to cancel");
  }
}

export async function clearAllSubscriptions(_req: Request, res: Response) {
  try {
    const result = await prisma.subscription.deleteMany({});
    return success(res, { deleted: result.count }, `Deleted ${result.count} subscriptions`);
  } catch (e) {
    console.error("Clear subscriptions error:", e);
    return error(res, "Failed to clear subscriptions");
  }
}

// --- Settings Management ---
const DEFAULT_SETTINGS: Record<string, string> = {
  enabled_languages: JSON.stringify([
    { key: "ENGLISH", label: "English" },
    { key: "HINDI", label: "Hindi" },
    { key: "MARATHI", label: "Marathi" },
    { key: "TAMIL", label: "Tamil" },
    { key: "TELUGU", label: "Telugu" },
  ]),
  plans_config: JSON.stringify({
    SINGLE_CLASS: { monthlyAmount: 19900, yearlyAmount: 149900, label: "Single Class", durationMonthly: 30, durationYearly: 365, enabled: true, classSelection: 1, unitType: "fixed" },
    DUAL_CLASS:   { monthlyAmount: 34900, yearlyAmount: 249900, label: "Dual Class",   durationMonthly: 30, durationYearly: 365, enabled: true, classSelection: 2, unitType: "fixed" },
    FULL_ACCESS:  { monthlyAmount: 49900, yearlyAmount: 349900, label: "Full Access",  durationMonthly: 30, durationYearly: 365, enabled: true, classSelection: 0, unitType: "fixed" },
  }),
  contact_info: JSON.stringify({
    companyName: "VISUALLEARNING AI PRIVATE LIMITED",
    address: "4th floor, Balaji Business center, Pune-Mumbai Highway, National Highway 4, next to hotel Spice Court, Baner, Pune, Maharashtra 411045",
    phone: "9718154204",
    email: "visuallearning247@gmail.com",
  }),
};

const AUDIENCE_PLAN_DEFAULTS: Record<string, any> = {
  SINGLE_CLASS: { monthlyAmount: 19900, yearlyAmount: 149900, label: "Single Class", durationMonthly: 30, durationYearly: 365, enabled: true, classSelection: 1, unitType: "fixed" },
  DUAL_CLASS: { monthlyAmount: 34900, yearlyAmount: 249900, label: "Dual Class", durationMonthly: 30, durationYearly: 365, enabled: true, classSelection: 2, unitType: "fixed" },
  FULL_ACCESS: { monthlyAmount: 49900, yearlyAmount: 349900, label: "Full Access", durationMonthly: 30, durationYearly: 365, enabled: true, classSelection: 0, unitType: "fixed" },
};

function mergeAudiencePlanDefaults(plans: Record<string, any>) {
  return { ...AUDIENCE_PLAN_DEFAULTS, ...plans };
}

function normalizeSubjectKeys(items: string[] = []) {
  const allowed = ["physics", "chemistry", "biology"];
  return Array.from(new Set(items.map((item) => item.toLowerCase()).filter((item) => allowed.includes(item))));
}

async function resolveProfessionalSubjectAccess(items: string[] = []) {
  const keys = normalizeSubjectKeys(items);
  const subjects = keys.length > 0
    ? await prisma.subject.findMany({
        where: {
          OR: keys.map((key) => ({ name: { contains: key, mode: "insensitive" } })),
          enabled: true,
        },
        select: { id: true, classId: true },
      })
    : await prisma.subject.findMany({
        where: { id: { in: items }, enabled: true },
        select: { id: true, classId: true },
      });

  return {
    subjectIds: subjects.map((subject) => subject.id),
    classIds: Array.from(new Set(subjects.map((subject) => subject.classId))),
  };
}

async function getAdminPlanConfig(planKey: string): Promise<{ unitType?: "fixed" | "class" | "subject" } | null> {
  const setting = await prisma.setting.findUnique({ where: { key: "plans_config" } });
  const plans = setting ? mergeAudiencePlanDefaults(JSON.parse(setting.value)) : mergeAudiencePlanDefaults({});
  return plans[planKey] || null;
}

async function getSetting(key: string): Promise<string> {
  const setting = await prisma.setting.findUnique({ where: { key } });
  return setting?.value || DEFAULT_SETTINGS[key] || "";
}

export async function getSettings(_req: Request, res: Response) {
  try {
    const [enabledLanguages, plansConfig, contactInfo] = await Promise.all([
      getSetting("enabled_languages"),
      getSetting("plans_config"),
      getSetting("contact_info"),
    ]);

    return success(res, {
      enabledLanguages: JSON.parse(enabledLanguages),
      plansConfig: mergeAudiencePlanDefaults(JSON.parse(plansConfig)),
      contactInfo: JSON.parse(contactInfo),
    });
  } catch (e) {
    console.error("Get settings error:", e);
    return error(res, "Failed to fetch settings");
  }
}

export async function updateLanguageSettings(req: Request, res: Response) {
  try {
    const { enabledLanguages } = req.body;
    if (!Array.isArray(enabledLanguages) || enabledLanguages.length === 0) {
      return error(res, "At least one language must be enabled", 400);
    }
    // Ensure ENGLISH is always present
    const hasEnglish = enabledLanguages.some((l: any) => (typeof l === "string" ? l : l.key) === "ENGLISH");
    if (!hasEnglish) {
      enabledLanguages.unshift({ key: "ENGLISH", label: "English" });
    }

    await prisma.setting.upsert({
      where: { key: "enabled_languages" },
      update: { value: JSON.stringify(enabledLanguages) },
      create: { key: "enabled_languages", value: JSON.stringify(enabledLanguages) },
    });

    return success(res, { enabledLanguages }, "Language settings updated");
  } catch (e) {
    console.error("Update language settings error:", e);
    return error(res, "Failed to update language settings");
  }
}

export async function updatePlanSettings(req: Request, res: Response) {
  try {
    const { plansConfig } = req.body;
    if (!plansConfig || typeof plansConfig !== "object") {
      return error(res, "Invalid plans configuration", 400);
    }

    await prisma.setting.upsert({
      where: { key: "plans_config" },
      update: { value: JSON.stringify(plansConfig) },
      create: { key: "plans_config", value: JSON.stringify(plansConfig) },
    });

    cacheInvalidate("plans");
    cacheInvalidate("courses-list");
    return success(res, { plansConfig }, "Plan settings updated");
  } catch (e) {
    console.error("Update plan settings error:", e);
    return error(res, "Failed to update plan settings");
  }
}

export async function updateContactInfo(req: Request, res: Response) {
  try {
    const { contactInfo } = req.body;
    if (!contactInfo || typeof contactInfo !== "object") {
      return error(res, "Invalid contact info", 400);
    }

    await prisma.setting.upsert({
      where: { key: "contact_info" },
      update: { value: JSON.stringify(contactInfo) },
      create: { key: "contact_info", value: JSON.stringify(contactInfo) },
    });

    return success(res, { contactInfo }, "Contact info updated");
  } catch (e) {
    console.error("Update contact info error:", e);
    return error(res, "Failed to update contact info");
  }
}

// --- Public settings (no auth needed) ---
export async function getPublicSettings(_req: Request, res: Response) {
  try {
    const [enabledLanguages, plansConfig, contactInfo] = await Promise.all([
      getSetting("enabled_languages"),
      getSetting("plans_config"),
      getSetting("contact_info"),
    ]);

    const rawLanguages = JSON.parse(enabledLanguages);
    // Normalize: support both old format (string[]) and new format ({key, label}[])
    const languages = rawLanguages.map((l: any) =>
      typeof l === "string" ? { key: l, label: l.charAt(0) + l.slice(1).toLowerCase() } : l
    );

    const plans = mergeAudiencePlanDefaults(JSON.parse(plansConfig));

    // Only return enabled plans to the public
    const enabledPlans = Object.entries(plans)
      .filter(([_, v]: [string, any]) => v.enabled)
      .map(([key, v]: [string, any]) => ({
        id: key,
        name: v.label,
        price: ((v.yearlyAmount !== undefined ? v.yearlyAmount : v.amount || 0) / 100),
        duration: `${v.durationYearly !== undefined ? v.durationYearly : v.duration || 365} days`,
        classSelection: v.classSelection || 0,
        enabled: v.enabled,
      }));

    return success(res, { languages, plans: enabledPlans, contactInfo: JSON.parse(contactInfo) });
  } catch (e) {
    console.error("Get public settings error:", e);
    return error(res, "Failed to fetch settings");
  }
}

// --- Subscription Settings ---
export async function getSubscriptionSettings(_req: Request, res: Response) {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: "subscription_settings" } });
    const data = setting ? JSON.parse(setting.value) : { upgradeDiscountPercent: 0 };
    return success(res, data);
  } catch (e) {
    console.error("Get subscription settings error:", e);
    return error(res, "Failed to fetch subscription settings");
  }
}

export async function updateSubscriptionSettings(req: Request, res: Response) {
  try {
    const { upgradeDiscountPercent } = req.body;
    if (typeof upgradeDiscountPercent !== "number" || upgradeDiscountPercent < 0 || upgradeDiscountPercent > 100) {
      return error(res, "Upgrade discount must be between 0 and 100", 400);
    }
    const value = JSON.stringify({ upgradeDiscountPercent });
    await prisma.setting.upsert({
      where: { key: "subscription_settings" },
      update: { value },
      create: { key: "subscription_settings", value },
    });
    return success(res, { upgradeDiscountPercent }, "Subscription settings updated");
  } catch (e) {
    console.error("Update subscription settings error:", e);
    return error(res, "Failed to update subscription settings");
  }
}

// --- Coupon Management ---
export const couponSchema = z.object({
  code: z.string().min(3).max(30),
  discountPercent: z.number().int().min(1).max(100),
  maxUses: z.number().int().min(0).optional(),
  validUntil: z.string(),
  applicablePlans: z.array(z.string()).optional(),
});

export async function getAllCoupons(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.coupon.count(),
    ]);

    return success(res, { coupons, total, page, totalPages: Math.ceil(total / limit) });
  } catch (e) {
    console.error("Get coupons error:", e);
    return error(res, "Failed to fetch coupons");
  }
}

export async function createCoupon(req: Request, res: Response) {
  try {
    const { code, discountPercent, maxUses, validUntil, applicablePlans } = req.body;
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase().replace(/[^A-Z0-9]/g, ""),
        discountPercent,
        maxUses: maxUses || 0,
        validUntil: new Date(validUntil),
        applicablePlans: applicablePlans || [],
      },
    });
    return success(res, coupon, "Coupon created successfully", 201);
  } catch (e: any) {
    console.error("Create coupon error:", e);
    return error(res, e.code === "P2002" ? "Coupon code already exists" : "Failed to create coupon");
  }
}

export async function toggleCoupon(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) return error(res, "Coupon not found", 404);
    const updated = await prisma.coupon.update({
      where: { id },
      data: { active: !coupon.active },
    });
    return success(res, updated, updated.active ? "Coupon activated" : "Coupon deactivated");
  } catch (e) {
    console.error("Toggle coupon error:", e);
    return error(res, "Failed to update coupon");
  }
}

export async function deleteCoupon(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await prisma.coupon.delete({ where: { id } });
    return success(res, null, "Coupon deleted");
  } catch (e: any) {
    console.error("Delete coupon error:", e);
    return error(res, e.code === "P2025" ? "Coupon not found" : "Failed to delete coupon");
  }
}

// --- Analytics ---
export async function getMostWatched(_req: Request, res: Response) {
  try {
    const videos = await prisma.watchProgress.groupBy({
      by: ["videoId"],
      _count: { videoId: true },
      orderBy: { _count: { videoId: "desc" } },
      take: 10,
    });

    const videoIds = videos.map((v) => v.videoId);
    const videoDetails = await prisma.video.findMany({
      where: { id: { in: videoIds } },
      include: { chapter: { include: { subject: { include: { class: true } } } } },
    });

    const result = videos.map((v) => ({
      ...videoDetails.find((d) => d.id === v.videoId),
      watchCount: v._count.videoId,
    }));

    return success(res, result);
  } catch (e) {
    console.error("Most watched error:", e);
    return error(res, "Failed to fetch analytics");
  }
}

export async function getRevenueByMonth(_req: Request, res: Response) {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const subscriptions = await prisma.subscription.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { amount: true, createdAt: true },
    });

    const revenueByMonth: Record<string, number> = {};
    subscriptions.forEach((s) => {
      const key = `${s.createdAt.getFullYear()}-${String(s.createdAt.getMonth() + 1).padStart(2, "0")}`;
      revenueByMonth[key] = (revenueByMonth[key] || 0) + s.amount / 100;
    });

    return success(res, revenueByMonth);
  } catch (e) {
    console.error("Revenue error:", e);
    return error(res, "Failed to fetch revenue data");
  }
}
