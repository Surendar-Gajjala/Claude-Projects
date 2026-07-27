import { NextFunction, Request, Response } from "express";
import { Role } from "../entities/user.entity";
import { AppError } from "../utils/app-error";

export function authorize(...allowedRoles: readonly Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AppError.unauthorized());
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(AppError.forbidden("You do not have permission to perform this action"));
      return;
    }

    next();
  };
}
