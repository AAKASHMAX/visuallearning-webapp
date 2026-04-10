import { Request, Response } from "express";
import { mobileSuccess, mobileError } from "../utils/response";

// POST /api/feedback — forward to existing feedback handler
export async function postFeedback(req: Request, res: Response) {
  try {
    const { sendFeedbackEmail } = await import("../../utils/email");
    const { name, email, subject, message } = req.body;
    await sendFeedbackEmail(name || "", email || "", subject || "App Feedback", message || "");
    return mobileSuccess(res, null, "Feedback submitted successfully");
  } catch (e) {
    console.error("Mobile postFeedback error:", e);
    return mobileError(res, "Failed to submit feedback");
  }
}

// GET /api/feedback — return empty list (mobile shows user's feedback list)
export async function getFeedbackList(_req: Request, res: Response) {
  return mobileSuccess(res, []);
}

// POST /api/favourite — stub (favourites not in current DB)
export async function addFavourite(_req: Request, res: Response) {
  return mobileSuccess(res, null, "Added to favourites");
}

// POST /api/favourite/remove-favourite — stub
export async function removeFavourite(_req: Request, res: Response) {
  return mobileSuccess(res, null, "Removed from favourites");
}

// GET /api/favourite/favourite-video/:id — stub
export async function getFavouriteVideos(_req: Request, res: Response) {
  return mobileSuccess(res, []);
}

// POST /api/users/fcm-token-user — stub (FCM token save)
export async function saveFcmToken(_req: Request, res: Response) {
  return mobileSuccess(res, null, "Token saved");
}

// GET /api/users/notification-list — stub
export async function getNotificationList(_req: Request, res: Response) {
  return mobileSuccess(res, []);
}
