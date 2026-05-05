import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth";
import {
  getStats, getUsers, toggleBlockUser,
  createCourse, updateCourse, deleteCourse,
  createChapter, updateChapter, deleteChapter,
  createVideo, updateVideo, deleteVideo,
  createNote, updateNote, deleteNote,
  createQuestion, updateQuestion, deleteQuestion,
  getSubscriptions, grantSubscription, cancelSubscription,
  getSubscriptionPlans, createSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan,
  getCoupons, createCoupon, toggleCoupon, deleteCoupon,
  getAdminNotifications, createNotification, updateNotification, publishNotification, deleteNotification,
  getSettings, updateSettings, getAnalytics, getPublicSettings,
} from "../controllers/admin.controller";

const router = Router();

// Public
router.get("/public-settings", getPublicSettings);

// All admin routes below require auth + admin
router.use(authenticate, requireAdmin);

// Dashboard
router.get("/stats", getStats);
router.get("/analytics", getAnalytics);

// Users
router.get("/users", getUsers);
router.patch("/users/:id/block", toggleBlockUser);

// Courses
router.post("/courses", createCourse);
router.put("/courses/:id", updateCourse);
router.delete("/courses/:id", deleteCourse);

// Chapters
router.post("/chapters", createChapter);
router.put("/chapters/:id", updateChapter);
router.delete("/chapters/:id", deleteChapter);

// Videos
router.post("/videos", createVideo);
router.put("/videos/:id", updateVideo);
router.delete("/videos/:id", deleteVideo);

// Notes
router.post("/notes", createNote);
router.put("/notes/:id", updateNote);
router.delete("/notes/:id", deleteNote);

// Questions
router.post("/questions", createQuestion);
router.put("/questions/:id", updateQuestion);
router.delete("/questions/:id", deleteQuestion);

// Subscriptions
router.get("/subscriptions", getSubscriptions);
router.post("/subscriptions", grantSubscription);
router.delete("/subscriptions/:id", cancelSubscription);

// Subscription plans
router.get("/subscription-plans", getSubscriptionPlans);
router.post("/subscription-plans", createSubscriptionPlan);
router.put("/subscription-plans/:id", updateSubscriptionPlan);
router.delete("/subscription-plans/:id", deleteSubscriptionPlan);

// Coupons
router.get("/coupons", getCoupons);
router.post("/coupons", createCoupon);
router.patch("/coupons/:id/toggle", toggleCoupon);
router.delete("/coupons/:id", deleteCoupon);

// Notifications
router.get("/notifications", getAdminNotifications);
router.post("/notifications", createNotification);
router.put("/notifications/:id", updateNotification);
router.patch("/notifications/:id/publish", publishNotification);
router.delete("/notifications/:id", deleteNotification);

// Settings
router.get("/settings", getSettings);
router.put("/settings", updateSettings);

export default router;
