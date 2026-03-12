import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getClasses, getSubjects, getChapters, getVideos, getVideoById, getNotes, getQuestions,
  getSubjectContentCounts, getBoardPapers,
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

router.get("/classes", getClasses);
router.get("/classes/:id/subjects", getSubjects);
router.get("/subjects/:id/chapters", getChapters);
router.get("/subjects/:id/content-counts", getSubjectContentCounts);
router.get("/subjects/:id/board-papers", getBoardPapers);
router.get("/chapters/:id/videos", optionalAuth, getVideos);
router.get("/videos/:id", optionalAuth, getVideoById);
router.get("/chapters/:id/notes", getNotes);
router.get("/chapters/:id/questions", getQuestions);

export default router;
