import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getNotifications, markNotificationsRead } from "../controllers/notification.controller";

const router = Router();

router.get("/", authenticate, getNotifications);
router.post("/mark-read", authenticate, markNotificationsRead);

export default router;
