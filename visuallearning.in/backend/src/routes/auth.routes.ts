import { Router } from "express";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import {
  signup, login, verifyEmail, forgotPassword, resetPassword, getProfile, updateProfile,
  signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, updateProfileSchema,
} from "../controllers/auth.controller";

const router = Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.get("/verify-email", verifyEmail);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, validate(updateProfileSchema), updateProfile);

export default router;
