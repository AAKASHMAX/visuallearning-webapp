import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { error } from "../utils/apiResponse";

export function validate(schema: ZodSchema, source: "body" | "params" | "query" = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const messages = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
      return error(res, "Validation failed", 400, messages);
    }
    req[source] = result.data;
    next();
  };
}
