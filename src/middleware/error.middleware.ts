import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error";
import { errorResponse } from "../utils/api-response";
import { logger } from "../config/logger";
import { env } from "../config/env";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    logger.warn(`${req.method} ${req.originalUrl} -> ${err.statusCode}: ${err.message}`);
    res.status(err.statusCode).json(errorResponse(err.message, err.errors));
    return;
  }

  logger.error(`${req.method} ${req.originalUrl} -> 500: ${err.message}`, { stack: err.stack });

  const message = env.isProduction ? "Internal server error" : err.message;
  res.status(500).json(errorResponse(message));
}
