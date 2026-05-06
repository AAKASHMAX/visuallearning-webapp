import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requireAdmin } from "../middleware/admin";
import { validate } from "../middleware/validate";
import {
  getStats, getAllUsers, toggleBlockUser, deleteUser,
  addClass, updateClass, deleteClass, classSchema,
  addSubject, updateSubject, deleteSubject, subjectSchema, toggleSubjectAccess, getSubjectAccessList,
  addChapter, updateChapter, deleteChapter, chapterSchema,
  getChapterVideos, addVideo, updateVideo, deleteVideo, videoSchema,
  addNote, deleteNote, noteSchema,
  addQuestion, updateQuestion, deleteQuestion, questionSchema,
  addBoardPaper, updateBoardPaper, deleteBoardPaper, boardPaperSchema,
  getAllCourses, addCourse, updateCourse, deleteCourse, getCourseWithChapters, addChapterToCourse, removeChapterFromCourse, getChaptersGroupedBySubject, courseSchema,
  getChaptersList,
  getMostWatched, getRevenueByMonth,
  getAllSubscriptions, grantSubscription, updateSubscription, cancelSubscription,
  grantSubscriptionSchema, updateSubscriptionSchema,
  getSettings, updateLanguageSettings, updatePlanSettings, updateContactInfo,
  getPublicSettings,
  getSubscriptionSettings, updateSubscriptionSettings,
  getAllCoupons, createCoupon, toggleCoupon, deleteCoupon, couponSchema,
  clearAllSubscriptions,
} from "../controllers/admin.controller";
import {
  getAllNotifications, createNotification, updateNotification, toggleNotificationPublish, deleteNotification, notificationSchema,
} from "../controllers/notification.controller";
import { deleteFeedback, getFeedbacks, markFeedbackRead } from "../controllers/feedback.controller";

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
router.delete("/users/:id", deleteUser);

// Notifications
router.get("/notifications", getAllNotifications);
router.post("/notifications", validate(notificationSchema), createNotification);
router.put("/notifications/:id", validate(notificationSchema), updateNotification);
router.patch("/notifications/:id/toggle", toggleNotificationPublish);
router.delete("/notifications/:id", deleteNotification);

// Feedback
router.get("/feedback", getFeedbacks);
router.patch("/feedback/:id/read", markFeedbackRead);
router.delete("/feedback/:id", deleteFeedback);

// Subscriptions
router.get("/subscriptions", getAllSubscriptions);
router.post("/subscriptions", validate(grantSubscriptionSchema), grantSubscription);
router.post("/subscriptions/clear", clearAllSubscriptions);
router.delete("/subscriptions", clearAllSubscriptions);
router.put("/subscriptions/:id", updateSubscription);
router.delete("/subscriptions/:id", cancelSubscription);

// Settings
router.get("/settings", getSettings);
router.put("/settings/languages", updateLanguageSettings);
router.put("/settings/plans", updatePlanSettings);
router.put("/settings/contact", updateContactInfo);

// Subscription Settings (upgrade discount)
router.get("/settings/subscription", getSubscriptionSettings);
router.put("/settings/subscription", updateSubscriptionSettings);

// Coupons
router.get("/coupons", getAllCoupons);
router.post("/coupons", validate(couponSchema), createCoupon);
router.patch("/coupons/:id/toggle", toggleCoupon);
router.delete("/coupons/:id", deleteCoupon);

// Classes
router.post("/classes", validate(classSchema), addClass);
router.put("/classes/:id", updateClass);
router.delete("/classes/:id", deleteClass);

// Subjects
router.get("/subjects/access", getSubjectAccessList);
router.post("/subjects", validate(subjectSchema), addSubject);
router.put("/subjects/:id", updateSubject);
router.patch("/subjects/:id/toggle-access", toggleSubjectAccess);
router.delete("/subjects/:id", deleteSubject);

// Chapters
router.post("/chapters", validate(chapterSchema), addChapter);
router.put("/chapters/:id", updateChapter);
router.delete("/chapters/:id", deleteChapter);

// Videos
router.get("/videos/chapter/:chapterId", getChapterVideos);
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

// Board Papers
router.post("/board-papers", validate(boardPaperSchema), addBoardPaper);
router.put("/board-papers/:id", updateBoardPaper);
router.delete("/board-papers/:id", deleteBoardPaper);

// Courses
router.get("/courses", getAllCourses);
router.post("/courses", validate(courseSchema), addCourse);
router.get("/courses/:id", getCourseWithChapters);
router.put("/courses/:id", updateCourse);
router.delete("/courses/:id", deleteCourse);
router.post("/courses/:id/chapters", addChapterToCourse);
router.delete("/courses/:id/chapters/:chapterId", removeChapterFromCourse);
router.get("/courses-data/chapters", getChaptersGroupedBySubject);
router.get("/chapters-list", getChaptersList);

// Analytics
router.get("/analytics/most-watched", getMostWatched);
router.get("/analytics/revenue", getRevenueByMonth);

export default router;
