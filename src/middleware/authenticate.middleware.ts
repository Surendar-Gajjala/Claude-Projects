import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt.util";
import { AppError } from "../utils/app-error";

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    next(AppError.unauthorized("Missing or invalid Authorization header"));
    return;
  }

  const token = header.slice("Bearer ".length);

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(AppError.unauthorized("Invalid or expired token"));
  }
}
