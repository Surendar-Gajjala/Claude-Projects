import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import { AppError } from "../utils/app-error";

export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query
      });

      if (parsed.body !== undefined) {
        req.body = parsed.body;
      }
      if (parsed.params !== undefined) {
        req.params = parsed.params;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
        next(AppError.badRequest("Validation failed", messages));
        return;
      }
      next(error);
    }
  };
}
