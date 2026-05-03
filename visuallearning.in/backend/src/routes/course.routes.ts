import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getClasses, getSubjects, getChapters, getVideos, getVideoById, getNotes, getQuestions,
  getSubjectContentCounts, getBoardPapers, getCourseBySlug, getSubjectPricing, getCourses,
} from "../controllers/course.controller";

const router = Router();

// Optional auth - some routes check subscription status
const optionalAuth = (req: any, res: any, next: any) => {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    return authenticate(req, res, next);
  }
  next();
};

router.get("/list", getCourses);
router.get("/classes", getClasses);
router.get("/classes/:id/subjects", getSubjects);
router.get("/subjects/:id/chapters", getChapters);
router.get("/subjects/:id/content-counts", getSubjectContentCounts);
router.get("/subjects/:id/board-papers", optionalAuth, getBoardPapers);
router.get("/chapters/:id/videos", optionalAuth, getVideos);
router.get("/videos/:id", optionalAuth, getVideoById);
router.get("/chapters/:id/notes", optionalAuth, getNotes);
router.get("/chapters/:id/questions", optionalAuth, getQuestions);
router.get("/course-content/:slug", optionalAuth, getCourseBySlug);
router.get("/pricing/subjects", getSubjectPricing);

export default router;
