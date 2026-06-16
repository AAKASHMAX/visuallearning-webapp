import { Router } from "express";
import { getPlans, getPlanDetails, getPaymentConfig, validateCoupon, getMySubscription, getMyCourses, createOrder, verifyPayment, activateFreePlan, createSubscription, verifySubscription, cancelSubscription } from "../controllers/subscription.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/plans", getPlans);
router.get("/plans/:code/details", getPlanDetails);
router.get("/payment-config", getPaymentConfig);
router.get("/validate-coupon", authenticate, validateCoupon);
router.get("/my-subscription", authenticate, getMySubscription);
router.get("/my-courses", authenticate, getMyCourses);
router.post("/create-order", authenticate, createOrder);
router.post("/verify-payment", authenticate, verifyPayment);
router.post("/activate-free", authenticate, activateFreePlan);

// Recurring (auto-renewal) subscriptions
router.post("/create-subscription", authenticate, createSubscription);
router.post("/verify-subscription", authenticate, verifySubscription);
router.post("/cancel-subscription", authenticate, cancelSubscription);
// Note: POST /webhook is mounted in index.ts (needs the raw body)

export default router;
