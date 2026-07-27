import { EmployeeStatus, LeaveStatus, LeaveType } from "@prisma/client";
import { LeaveService } from "../../../src/services/leave.service";
import { LeaveRepository } from "../../../src/repositories/leave.repository";
import { EmployeeRepository } from "../../../src/repositories/employee.repository";
import { Role } from "../../../src/entities/user.entity";

jest.mock("../../../src/repositories/leave.repository");
jest.mock("../../../src/repositories/employee.repository");

describe("LeaveService", () => {
  let leaveRepository: jest.Mocked<LeaveRepository>;
  let employeeRepository: jest.Mocked<EmployeeRepository>;
  let service: LeaveService;

  const fakeEmployee = {
    id: "emp-1",
    userId: "user-1",
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
    phone: null,
    jobTitle: "Engineer",
    salary: "50000",
    status: EmployeeStatus.ACTIVE,
    hireDate: new Date(),
    departmentId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

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

  const baseDto = {
    leaveType: LeaveType.SICK,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-01-02"),
    reason: "Flu"
  };

  beforeEach(() => {
    leaveRepository = new LeaveRepository() as jest.Mocked<LeaveRepository>;
    employeeRepository = new EmployeeRepository() as jest.Mocked<EmployeeRepository>;
    service = new LeaveService(leaveRepository, employeeRepository);
  });

  describe("createLeaveRequest", () => {
    it("resolves the employee from the requester's userId when role is EMPLOYEE", async () => {
      employeeRepository.findByUserId.mockResolvedValue(fakeEmployee);
      employeeRepository.findById.mockResolvedValue(fakeEmployee);
      leaveRepository.create.mockResolvedValue(fakeLeave);

      const result = await service.createLeaveRequest(baseDto, { userId: "user-1", role: Role.EMPLOYEE });

      expect(leaveRepository.create).toHaveBeenCalledWith({ ...baseDto, employeeId: "emp-1" });
      expect(result).toEqual(fakeLeave);
    });

    it("throws forbidden when an EMPLOYEE requests leave for a different employeeId", async () => {
      employeeRepository.findByUserId.mockResolvedValue(fakeEmployee);

      await expect(
        service.createLeaveRequest(
          { ...baseDto, employeeId: "someone-else" },
          { userId: "user-1", role: Role.EMPLOYEE }
        )
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it("throws bad request when an EMPLOYEE has no linked employee profile", async () => {
      employeeRepository.findByUserId.mockResolvedValue(null);

      await expect(
        service.createLeaveRequest(baseDto, { userId: "user-1", role: Role.EMPLOYEE })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("requires employeeId when the requester is an ADMIN", async () => {
      await expect(
        service.createLeaveRequest(baseDto, { userId: "admin-1", role: Role.ADMIN })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("allows an ADMIN to create a leave request for a specific employeeId", async () => {
      employeeRepository.findById.mockResolvedValue(fakeEmployee);
      leaveRepository.create.mockResolvedValue(fakeLeave);

      const result = await service.createLeaveRequest(
        { ...baseDto, employeeId: "emp-1" },
        { userId: "admin-1", role: Role.ADMIN }
      );

      expect(result).toEqual(fakeLeave);
    });

    it("throws bad request when the resolved employeeId does not exist", async () => {
      employeeRepository.findById.mockResolvedValue(null);

      await expect(
        service.createLeaveRequest({ ...baseDto, employeeId: "emp-1" }, { userId: "admin-1", role: Role.ADMIN })
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  describe("listOwnLeaveRequests", () => {
    it("throws bad request when no employee profile is linked", async () => {
      employeeRepository.findByUserId.mockResolvedValue(null);

      await expect(service.listOwnLeaveRequests("user-1")).rejects.toMatchObject({ statusCode: 400 });
    });

    it("returns the employee's own leave requests", async () => {
      employeeRepository.findByUserId.mockResolvedValue(fakeEmployee);
      leaveRepository.findByEmployeeId.mockResolvedValue([fakeLeave]);

      const result = await service.listOwnLeaveRequests("user-1");

      expect(leaveRepository.findByEmployeeId).toHaveBeenCalledWith("emp-1");
      expect(result).toEqual([fakeLeave]);
    });
  });

  describe("listAllLeaveRequests", () => {
    it("returns all leave requests from the repository", async () => {
      leaveRepository.findAll.mockResolvedValue([fakeLeave]);

      await expect(service.listAllLeaveRequests()).resolves.toEqual([fakeLeave]);
    });
  });

  describe("reviewLeaveRequest", () => {
    it("throws 404 when the leave request does not exist", async () => {
      leaveRepository.findById.mockResolvedValue(null);

      await expect(
        service.reviewLeaveRequest("missing", LeaveStatus.APPROVED, "admin-1")
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("throws conflict when the leave request was already reviewed", async () => {
      leaveRepository.findById.mockResolvedValue({ ...fakeLeave, status: LeaveStatus.APPROVED });

      await expect(
        service.reviewLeaveRequest("leave-1", LeaveStatus.REJECTED, "admin-1")
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it("approves a pending leave request", async () => {
      leaveRepository.findById.mockResolvedValue(fakeLeave);
      leaveRepository.updateStatus.mockResolvedValue({
        ...fakeLeave,
        status: LeaveStatus.APPROVED,
        reviewedByUserId: "admin-1"
      });

      const result = await service.reviewLeaveRequest("leave-1", LeaveStatus.APPROVED, "admin-1");

      expect(leaveRepository.updateStatus).toHaveBeenCalledWith("leave-1", LeaveStatus.APPROVED, "admin-1");
      expect(result.status).toBe(LeaveStatus.APPROVED);
    });
  });
});
