import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { error } from "../utils/apiResponse";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return error(res, "Authentication required", 401);
  }

  try {
    const token = header.split(" ")[1];
    const decoded = verifyToken(token);
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role as any, name: decoded.name };
    next();
  } catch {
    return error(res, "Invalid or expired token", 401);
  }
}
