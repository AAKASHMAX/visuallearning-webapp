import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../config/prisma";
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

router.get("/debug/seed", async (req, res) => {
  try {
    const coursesToSeed = [
      { name: "Foundation Pass", slug: "foundation-pass", planKey: "FOUNDATION_PASS", accentColor: "#06b6d4", icon: "Sparkles", description: "Begin your science journey with curated introductory chapters" },
      { name: "Academic Plus", slug: "academic-plus", planKey: "ACADEMIC_PLUS", accentColor: "#3b82f6", icon: "GraduationCap", description: "Comprehensive coverage of Class 9-10 with selected 11-12 content" },
      { name: "Elite Learning", slug: "elite-learning", planKey: "ELITE_LEARNING", accentColor: "#8b5cf6", icon: "Crown", description: "Complete 9-12 Physics, Chemistry & Biology with advanced tools" },
    ];
    const results = [];
    for (const c of coursesToSeed) {
      const result = await prisma.course.upsert({
        where: { slug: c.slug },
        update: {
          planKey: c.planKey,
          icon: c.icon,
          accentColor: c.accentColor,
          description: c.description,
          name: c.name
        },
        create: c
      });
      results.push(result);
    }
    res.json({ success: true, results });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message, stack: e.stack });
  }
});

export default router;
