import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { updateProgress, getProgress, getCompletedVideos, updateProgressSchema } from "../controllers/progress.controller";

const router = Router();

router.post("/update", authenticate, validate(updateProgressSchema), updateProgress);
router.get("/completed", authenticate, getCompletedVideos);
router.get("/:videoId", authenticate, getProgress);

export default router;
