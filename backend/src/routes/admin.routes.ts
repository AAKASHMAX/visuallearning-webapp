import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requireAdmin } from "../middleware/admin";
import { validate } from "../middleware/validate";
import {
  getStats, getAllUsers, toggleBlockUser,
  addClass, updateClass, deleteClass, classSchema,
  addSubject, updateSubject, deleteSubject, subjectSchema,
  addChapter, updateChapter, deleteChapter, chapterSchema,
  addVideo, updateVideo, deleteVideo, videoSchema,
  addNote, deleteNote, noteSchema,
  addQuestion, updateQuestion, deleteQuestion, questionSchema,
  getMostWatched, getRevenueByMonth,
  getAllSubscriptions, grantSubscription, updateSubscription, cancelSubscription,
  grantSubscriptionSchema, updateSubscriptionSchema,
  getSettings, updateLanguageSettings, updatePlanSettings,
  getPublicSettings,
} from "../controllers/admin.controller";

const router = Router();

// Public settings endpoint (no auth)
router.get("/public-settings", getPublicSettings);

// All other routes require admin auth
router.use(authenticate, requireAdmin);

// Dashboard
router.get("/stats", getStats);

// Users
router.get("/users", getAllUsers);
router.patch("/users/:id/block", toggleBlockUser);

// Subscriptions
router.get("/subscriptions", getAllSubscriptions);
router.post("/subscriptions", validate(grantSubscriptionSchema), grantSubscription);
router.put("/subscriptions/:id", updateSubscription);
router.delete("/subscriptions/:id", cancelSubscription);

// Settings
router.get("/settings", getSettings);
router.put("/settings/languages", updateLanguageSettings);
router.put("/settings/plans", updatePlanSettings);

// Classes
router.post("/classes", validate(classSchema), addClass);
router.put("/classes/:id", updateClass);
router.delete("/classes/:id", deleteClass);

// Subjects
router.post("/subjects", validate(subjectSchema), addSubject);
router.put("/subjects/:id", updateSubject);
router.delete("/subjects/:id", deleteSubject);

// Chapters
router.post("/chapters", validate(chapterSchema), addChapter);
router.put("/chapters/:id", updateChapter);
router.delete("/chapters/:id", deleteChapter);

// Videos
router.post("/videos", validate(videoSchema), addVideo);
router.put("/videos/:id", updateVideo);
router.delete("/videos/:id", deleteVideo);

// Notes
router.post("/notes", validate(noteSchema), addNote);
router.delete("/notes/:id", deleteNote);

// Questions
router.post("/questions", validate(questionSchema), addQuestion);
router.put("/questions/:id", updateQuestion);
router.delete("/questions/:id", deleteQuestion);

// Analytics
router.get("/analytics/most-watched", getMostWatched);
router.get("/analytics/revenue", getRevenueByMonth);

export default router;
