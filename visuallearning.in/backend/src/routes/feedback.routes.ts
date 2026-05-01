import { Router, Request, Response } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import { sendFeedbackEmail } from "../utils/email";

const router = Router();

const feedbackSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

router.post("/", validate(feedbackSchema), async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;
    await sendFeedbackEmail(name, email, subject, message);
    res.json({ success: true, status: true, message: "Feedback submitted successfully! We'll get back to you soon." });
  } catch (error) {
    console.error("Feedback email error:", error);
    res.status(500).json({ success: false, status: false, message: "Failed to submit feedback. Please try again later." });
  }
});

export default router;
