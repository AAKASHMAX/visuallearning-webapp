import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getMyNotifications, markMyNotificationsRead } from "../controllers/notification.controller";

const router = Router();

router.use(authenticate);

router.get("/", getMyNotifications);
router.post("/mark-read", markMyNotificationsRead);

export default router;
