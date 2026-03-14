import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  getPlans, createSubscriptionOrder, verifyPayment, getMySubscription,
  createOrderSchema, verifyPaymentSchema,
} from "../controllers/subscription.controller";

const router = Router();

router.get("/plans", getPlans);
// Temporary debug: check if Razorpay keys are configured
router.get("/debug-config", (_req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  res.json({ hasKeyId: !!keyId && keyId.length > 5, keyIdPrefix: keyId.substring(0, 12) + "...", hasSecret: !!(process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_KEY_SECRET.length > 5) });
});
router.get("/my-subscription", authenticate, getMySubscription);
router.post("/create-order", authenticate, validate(createOrderSchema), createSubscriptionOrder);
router.post("/verify-payment", authenticate, validate(verifyPaymentSchema), verifyPayment);

export default router;
