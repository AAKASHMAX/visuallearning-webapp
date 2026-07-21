import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  getPlans, createSubscriptionOrder, verifyPayment, getMySubscription,
  createOrderSchema, verifyPaymentSchema, validateCouponCode, startTrial, getTrialStatus,
} from "../controllers/subscription.controller";
import { handleRazorpayWebhook } from "../controllers/webhook.controller";

const router = Router();

router.get("/plans", getPlans);
router.get("/validate-coupon", authenticate, validateCouponCode);
router.get("/my-subscription", authenticate, getMySubscription);
router.get("/trial-status", authenticate, getTrialStatus);
router.post("/start-trial", authenticate, startTrial);
router.post("/create-order", authenticate, validate(createOrderSchema), createSubscriptionOrder);
router.post("/verify-payment", authenticate, validate(verifyPaymentSchema), verifyPayment);
router.post("/webhook", handleRazorpayWebhook);

export default router;
