import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import * as authCtrl from "../controllers/auth.controller";
import * as courseCtrl from "../controllers/course.controller";
import * as subCtrl from "../controllers/subscription.controller";
import * as miscCtrl from "../controllers/misc.controller";

const router = Router();

// Optional auth middleware — attaches user if token present, continues otherwise
const optionalAuth = (req: any, res: any, next: any) => {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    return authenticate(req, res, next);
  }
  next();
};

// ============ AUTH ============
router.post("/users/login", authCtrl.login);
router.post("/users/register", authCtrl.register);
router.post("/users/google-login", authCtrl.googleLogin);
router.post("/users/forgot-password", authCtrl.forgotPassword);
router.post("/users/logout", authCtrl.logout);

// ============ COURSES ============
router.get("/category", courseCtrl.getCategory);
router.get("/class", courseCtrl.getClassList);
router.get("/class/class-detail/:id", courseCtrl.getClassDetail);
router.get("/subject/:id", courseCtrl.getClassDetail); // same handler, subject uses class ID
router.get("/video/video-list/:id", optionalAuth, courseCtrl.getVideoList);
router.get("/notes-pdf/:id", courseCtrl.getNotesPdf);
router.get("/test-paper/:id", courseCtrl.getTestPaper);
router.get("/quiz/quiz-detail/:id", courseCtrl.getQuizDetail); // must be before /quiz/:id
router.get("/quiz/:id", courseCtrl.getQuizList);
router.post("/video/search", courseCtrl.searchVideos);
router.get("/organization", courseCtrl.getOrganization);

// ============ SUBSCRIPTIONS ============
router.get("/subscription-plan", optionalAuth, subCtrl.getSubscriptionPlans);
router.get("/subscription-plan/validate-coupon", subCtrl.validateCouponCode);
router.get("/subscription-plan/user-subcription/:id", authenticate, subCtrl.getUserSubscription);
router.post("/subscription-plan/generate-order-id", authenticate, subCtrl.generateOrderId);
router.post("/subscription-plan/purchase-plan", authenticate, subCtrl.purchasePlan);
router.get("/subscription-plan/cancel-plan/:id", authenticate, subCtrl.cancelPlan);

// ============ MISC ============
// Note: POST /feedback is handled by web feedback routes (returns both status & success)
router.get("/feedback", miscCtrl.getFeedbackList);
router.post("/favourite", miscCtrl.addFavourite);
router.post("/favourite/remove-favourite", miscCtrl.removeFavourite);
router.get("/favourite/favourite-video/:id", miscCtrl.getFavouriteVideos);
router.post("/users/fcm-token-user", miscCtrl.saveFcmToken);
router.get("/users/notification-list", miscCtrl.getNotificationList);

export default router;
