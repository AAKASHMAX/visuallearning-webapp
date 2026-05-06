import { Router } from "express";
import {
  getCourses, getCoursesByTier, getCourseById, getChapterVideos, getVideoById,
  getChapterNotes, getChapterQuestions, updateProgress
} from "../controllers/course.controller";
import { authenticate, optionalAuth } from "../middleware/auth";

const router = Router();

router.get("/courses", getCourses);
router.get("/courses/tier/:tier", optionalAuth, getCoursesByTier);
router.get("/courses/:id", optionalAuth, getCourseById);
router.get("/chapters/:id/videos", optionalAuth, getChapterVideos);
router.get("/videos/:id", optionalAuth, getVideoById);
router.get("/chapters/:id/notes", optionalAuth, getChapterNotes);
router.get("/chapters/:id/questions", optionalAuth, getChapterQuestions);
router.post("/progress/update", authenticate, updateProgress);

export default router;
