import { NextFunction } from "express";
import { LeaveStatus, LeaveType } from "@prisma/client";
import { LeaveController } from "../../../src/controllers/leave.controller";
import { LeaveService } from "../../../src/services/leave.service";
import { Role } from "../../../src/entities/user.entity";
import { createMockRequest, createMockResponse } from "./test-helpers";

jest.mock("../../../src/services/leave.service");

describe("LeaveController", () => {
  let leaveService: jest.Mocked<LeaveService>;
  let controller: LeaveController;
  let next: NextFunction;

  const fakeLeave = {
    id: "leave-1",
    employeeId: "emp-1",
    leaveType: LeaveType.SICK,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-01-02"),
    reason: "Flu",
    status: LeaveStatus.PENDING,
    reviewedByUserId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    leaveService = new LeaveService() as jest.Mocked<LeaveService>;
    controller = new LeaveController(leaveService);
    next = jest.fn();
  });

  it("create uses req.user to build the requester context", async () => {
    const req = createMockRequest({
      body: { leaveType: LeaveType.SICK, startDate: new Date(), endDate: new Date(), reason: "Flu" },
      user: { sub: "user-1", email: "a@example.com", role: Role.EMPLOYEE }
    });
    const res = createMockResponse();
    leaveService.createLeaveRequest.mockResolvedValue(fakeLeave);

    await controller.create(req, res, next);

    expect(leaveService.createLeaveRequest).toHaveBeenCalledWith(req.body, {
      userId: "user-1",
      role: Role.EMPLOYEE
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("create calls next() with unauthorized when req.user is missing", async () => {
    const req = createMockRequest({ body: {} });
    const res = createMockResponse();

    await controller.create(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it("review passes params.id and body.status through to the service", async () => {
    const req = createMockRequest({
      params: { id: "leave-1" },
      body: { status: LeaveStatus.APPROVED },
      user: { sub: "admin-1", email: "admin@example.com", role: Role.ADMIN }
    });
    const res = createMockResponse();
    leaveService.reviewLeaveRequest.mockResolvedValue({ ...fakeLeave, status: LeaveStatus.APPROVED });

    await controller.review(req, res, next);

    expect(leaveService.reviewLeaveRequest).toHaveBeenCalledWith("leave-1", LeaveStatus.APPROVED, "admin-1");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("listAll returns all leave requests", async () => {
    const req = createMockRequest();
    const res = createMockResponse();
    leaveService.listAllLeaveRequests.mockResolvedValue([fakeLeave]);

    await controller.listAll(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: [fakeLeave] }));
  });

  it("review calls next() with unauthorized when req.user is missing", async () => {
    const req = createMockRequest({ params: { id: "leave-1" }, body: { status: LeaveStatus.APPROVED } });
    const res = createMockResponse();

    await controller.review(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it("listMine calls next() with unauthorized when req.user is missing", async () => {
    const req = createMockRequest();
    const res = createMockResponse();

    await controller.listMine(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it("listMine returns the caller's own leave requests", async () => {
    const req = createMockRequest({ user: { sub: "user-1", email: "a@example.com", role: Role.EMPLOYEE } });
    const res = createMockResponse();
    leaveService.listOwnLeaveRequests.mockResolvedValue([fakeLeave]);

    await controller.listMine(req, res, next);

    expect(leaveService.listOwnLeaveRequests).toHaveBeenCalledWith("user-1");
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: [fakeLeave] }));
  });
});
