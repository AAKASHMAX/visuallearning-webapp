import { Router } from "express";
import { optionalAuth } from "../middleware/auth";
import { createFeedback } from "../controllers/feedback.controller";

const router = Router();

router.post("/", optionalAuth, createFeedback);

export default router;
