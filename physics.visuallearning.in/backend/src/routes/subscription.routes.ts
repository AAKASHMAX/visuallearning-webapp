import { Router } from "express";
import { getPlans, validateCoupon, getMySubscription, createOrder, verifyPayment } from "../controllers/subscription.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/plans", getPlans);
router.get("/validate-coupon", authenticate, validateCoupon);
router.get("/my-subscription", authenticate, getMySubscription);
router.post("/create-order", authenticate, createOrder);
router.post("/verify-payment", authenticate, verifyPayment);

export default router;
