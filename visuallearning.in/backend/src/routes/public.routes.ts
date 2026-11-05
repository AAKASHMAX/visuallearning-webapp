import { Router, Request } from "express";
import rateLimit from "express-rate-limit";
import { getPublicDoc } from "../controllers/public.controller";

const router = Router();

// The app doesn't set "trust proxy", so req.ip is Render's proxy for every visitor. Key the limit on
// the visitor's own address instead, so one busy classroom can't lock everyone else out.
function visitorKey(req: Request) {
  const header = (name: string) => {
    const value = req.headers[name];
    return (Array.isArray(value) ? value[0] : value || "").split(",")[0].trim();
  };
  return header("cf-connecting-ip") || header("true-client-ip") || header("x-forwarded-for") || req.ip || "unknown";
}

// Generous for people reading (one request per page), but slows anyone downloading every document.
const publicLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: visitorKey,
  validate: { xForwardedForHeader: false },
  message: { success: false, message: "Too many requests, please try again in a few minutes" },
});

router.get("/docs/:kind/:slug", publicLimiter, getPublicDoc);

export default router;
