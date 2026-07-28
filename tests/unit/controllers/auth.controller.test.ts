import { NextFunction } from "express";
import { Role } from "@prisma/client";
import { AuthController } from "../../../src/controllers/auth.controller";
import { AuthService } from "../../../src/services/auth.service";
import { AppError } from "../../../src/utils/app-error";
import { createMockRequest, createMockResponse } from "./test-helpers";

jest.mock("../../../src/services/auth.service");

describe("AuthController", () => {
  let authService: jest.Mocked<AuthService>;
  let controller: AuthController;
  let next: NextFunction;

  beforeEach(() => {
    authService = new AuthService() as jest.Mocked<AuthService>;
    controller = new AuthController(authService);
    next = jest.fn();
  });

  it("login responds with 200 and the auth result on success", async () => {
    const req = createMockRequest({ body: { email: "a@example.com", password: "secret" } });
    const res = createMockResponse();
    authService.login.mockResolvedValue({
      token: "jwt-token",
      user: { id: "u1", email: "a@example.com", role: Role.EMPLOYEE, createdAt: new Date(), updatedAt: new Date() }
    });

    await controller.login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: expect.objectContaining({ token: "jwt-token" }) })
    );
  });

  it("login forwards errors to next()", async () => {
    const req = createMockRequest({ body: { email: "a@example.com", password: "wrong" } });
    const res = createMockResponse();
    const error = AppError.unauthorized("Invalid email or password");
    authService.login.mockRejectedValue(error);

    await controller.login(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("register responds with 201 and the created user", async () => {
    const req = createMockRequest({ body: { email: "new@example.com", password: "secret", role: Role.EMPLOYEE } });
    const res = createMockResponse();
    authService.register.mockResolvedValue({
      id: "u2",
      email: "new@example.com",
      role: Role.EMPLOYEE,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await controller.register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: expect.objectContaining({ email: "new@example.com" }) })
    );
  });

  it("update responds with 200 and the updated user on success", async () => {
    const req = createMockRequest({ params: { id: "u1" }, body: { role: Role.ADMIN } });
    const res = createMockResponse();
    authService.updateUser.mockResolvedValue({
      id: "u1",
      email: "a@example.com",
      role: Role.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await controller.update(req, res, next);

    expect(authService.updateUser).toHaveBeenCalledWith("u1", { role: Role.ADMIN });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: expect.objectContaining({ role: Role.ADMIN }) })
    );
  });

  it("update forwards errors to next()", async () => {
    const req = createMockRequest({ params: { id: "missing" }, body: { email: "a@example.com" } });
    const res = createMockResponse();
    const error = AppError.notFound("User not found");
    authService.updateUser.mockRejectedValue(error);

    await controller.update(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("remove responds with 200 after deleting the user", async () => {
    const req = createMockRequest({ params: { id: "u1" } });
    const res = createMockResponse();
    authService.deleteUser.mockResolvedValue(undefined);

    await controller.remove(req, res, next);

    expect(authService.deleteUser).toHaveBeenCalledWith("u1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: null }));
  });

  it("remove forwards errors to next()", async () => {
    const req = createMockRequest({ params: { id: "missing" } });
    const res = createMockResponse();
    const error = AppError.notFound("User not found");
    authService.deleteUser.mockRejectedValue(error);

    await controller.remove(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
