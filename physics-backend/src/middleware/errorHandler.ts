import { Request, Response, NextFunction } from "express";
import { config } from "../config";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error("Unhandled error:", err);
  res.status(500).json({
    message: config.nodeEnv === "production" ? "Internal server error" : err.message,
  });
}
