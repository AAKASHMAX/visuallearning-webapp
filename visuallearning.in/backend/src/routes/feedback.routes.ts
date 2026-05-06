import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import { optionalAuth } from "../middleware/auth";
import { createFeedback } from "../controllers/feedback.controller";

const router = Router();

const feedbackSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters").optional().default("Website Feedback"),
  rating: z.number().min(1).max(5).optional(),
  pageUrl: z.string().max(500).optional().nullable(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

router.post("/", optionalAuth, validate(feedbackSchema), createFeedback);

export default router;
