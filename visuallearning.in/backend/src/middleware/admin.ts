import { Request, Response, NextFunction } from "express";
import { error } from "../utils/apiResponse";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "ADMIN") {
    return error(res, "Admin access required", 403);
  }
  next();
}
