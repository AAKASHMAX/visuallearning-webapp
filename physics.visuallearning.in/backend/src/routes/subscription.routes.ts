import { Router } from "express";
import { getPlans, getPlanDetails, validateCoupon, getMySubscription, getMyCourses, createOrder, verifyPayment } from "../controllers/subscription.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/plans", getPlans);
router.get("/plans/:code/details", getPlanDetails);
router.get("/validate-coupon", authenticate, validateCoupon);
router.get("/my-subscription", authenticate, getMySubscription);
router.get("/my-courses", authenticate, getMyCourses);
router.post("/create-order", authenticate, createOrder);
router.post("/verify-payment", authenticate, verifyPayment);

export default router;
