import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { error } from "../utils/apiResponse";

export async function requireSubscription(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return error(res, "Authentication required", 401);

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: req.user.id,
      status: "ACTIVE",
      expiryDate: { gt: new Date() },
    },
  });

  if (!subscription) {
    return error(res, "Active subscription required to access this content", 403);
  }

  next();
}
