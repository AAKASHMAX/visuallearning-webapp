import { Response } from "express";

// Mobile API uses { status, message, data/user } format instead of web's { success, message, data }
export function mobileSuccess(res: Response, data: any, message = "Success", statusCode = 200) {
  return res.status(statusCode).json({ status: true, message, data });
}

export function mobileError(res: Response, message = "Internal Server Error", statusCode = 500) {
  return res.status(statusCode).json({ status: false, message });
}
