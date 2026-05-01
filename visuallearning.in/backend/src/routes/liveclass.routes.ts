import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requireAdmin } from "../middleware/admin";
import { requireAdminOrTeacher } from "../middleware/teacher";
import { validate } from "../middleware/validate";
import {
  createLiveClass, createLiveClassSchema,
  updateLiveClass, updateLiveClassSchema,
  deleteLiveClass,
  goLive, goLiveSchema,
  endLiveClass,
  getTeacherToken,
  getMyLiveClasses,
  addLiveClassAccess, addAccessSchema,
  removeLiveClassAccess,
  getLiveClassAccessList,
  searchUsers,
  getActiveLiveClasses,
  joinLiveClass,
  getAllLiveClasses,
  getAllTeachers,
  addTeacher, addTeacherSchema,
  removeTeacher,
  adminDeleteLiveClass,
} from "../controllers/liveclass.controller";

const router = Router();

router.use(authenticate);

// --- Student routes ---
router.get("/active", getActiveLiveClasses);
router.get("/join/:id", joinLiveClass);

// --- Teacher routes ---
router.get("/my-classes", requireAdminOrTeacher, getMyLiveClasses);
router.post("/", requireAdminOrTeacher, validate(createLiveClassSchema), createLiveClass);
router.put("/:id", requireAdminOrTeacher, validate(updateLiveClassSchema), updateLiveClass);
router.delete("/:id", requireAdminOrTeacher, deleteLiveClass);
router.post("/:id/go-live", requireAdminOrTeacher, validate(goLiveSchema), goLive);
router.post("/:id/end", requireAdminOrTeacher, endLiveClass);
router.get("/:id/token", requireAdminOrTeacher, getTeacherToken);
router.get("/:id/access", requireAdminOrTeacher, getLiveClassAccessList);
router.post("/:id/access", requireAdminOrTeacher, validate(addAccessSchema), addLiveClassAccess);
router.delete("/:id/access/:userId", requireAdminOrTeacher, removeLiveClassAccess);
router.get("/search-users", requireAdminOrTeacher, searchUsers);

// --- Admin routes ---
router.get("/all", requireAdmin, getAllLiveClasses);
router.get("/teachers", requireAdmin, getAllTeachers);
router.post("/teachers", requireAdmin, validate(addTeacherSchema), addTeacher);
router.delete("/teachers/:id", requireAdmin, removeTeacher);
router.delete("/admin/:id", requireAdmin, adminDeleteLiveClass);

export default router;
