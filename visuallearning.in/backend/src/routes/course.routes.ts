import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticate } from "../middleware/auth";
import {
  getClasses, getSubjects, getChapters, getVideos, getVideoById, getNotes, getQuestions,
  getSubjectContentCounts, getBoardPapers, getCourseBySlug, getSubjectPricing, getCourses,
  requestNoteDownload, sendNoteDownload,
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

// PDF downloads: a signed-in request gets a short-lived link, which the browser then opens.
// Per student: plenty for studying, slows anyone trying to download everything.
const downloadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => req.user?.id || req.ip || "unknown",
  validate: { xForwardedForHeader: false },
  message: { success: false, message: "Too many downloads at once. Please try again in a few minutes." },
});
router.post("/notes/:id/download", authenticate, downloadLimiter, requestNoteDownload);
router.get("/notes/:id/file", sendNoteDownload);

export default router;
