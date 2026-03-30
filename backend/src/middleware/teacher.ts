import { Request, Response, NextFunction } from "express";
import { error } from "../utils/apiResponse";

export function requireTeacher(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "TEACHER") {
    return error(res, "Teacher access required", 403);
  }
  next();
}

export function requireAdminOrTeacher(req: Request, res: Response, next: NextFunction) {
  if (!req.user || (req.user.role !== "ADMIN" && req.user.role !== "TEACHER")) {
    return error(res, "Admin or Teacher access required", 403);
  }
  next();
}
