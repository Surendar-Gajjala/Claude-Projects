import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(AppError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}
