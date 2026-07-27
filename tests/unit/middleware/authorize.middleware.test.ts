import { NextFunction, Request, Response } from "express";
import { authorize } from "../../../src/middleware/authorize.middleware";
import { Role } from "../../../src/entities/user.entity";

describe("authorize middleware", () => {
  const res = {} as Response;
  let next: NextFunction;

  beforeEach(() => {
    next = jest.fn();
  });

  it("calls next() with a 401 AppError when req.user is missing", () => {
    const req = {} as Request;

    authorize(Role.ADMIN)(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it("calls next() with a 403 AppError when the role is not allowed", () => {
    const req = { user: { sub: "u1", email: "a@example.com", role: Role.EMPLOYEE } } as Request;

    authorize(Role.ADMIN)(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });

  it("calls next() with no arguments when the role is allowed", () => {
    const req = { user: { sub: "u1", email: "a@example.com", role: Role.ADMIN } } as Request;

    authorize(Role.ADMIN, Role.EMPLOYEE)(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });
});
