import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getMyAffiliate, applyAffiliate } from "../controllers/affiliate.controller";

const router = Router();

// User-facing affiliate endpoints (the admin ones live under /api/admin).
router.get("/me", authenticate, getMyAffiliate);
router.post("/apply", authenticate, applyAffiliate);

export default router;
