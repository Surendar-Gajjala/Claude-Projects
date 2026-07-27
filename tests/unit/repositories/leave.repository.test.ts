import { PrismaClient, LeaveType, LeaveStatus } from "@prisma/client";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";
import { LeaveRepository } from "../../../src/repositories/leave.repository";

describe("LeaveRepository", () => {
  let prismaMock: DeepMockProxy<PrismaClient>;
  let repository: LeaveRepository;

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
    prismaMock = mockDeep<PrismaClient>();
    repository = new LeaveRepository(prismaMock);
  });

  it("findAll delegates to prisma.leaveRequest.findMany", async () => {
    prismaMock.leaveRequest.findMany.mockResolvedValue([fakeLeave]);

    const result = await repository.findAll();

    expect(prismaMock.leaveRequest.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: "desc" } });
    expect(result).toEqual([fakeLeave]);
  });

  it("findById delegates to prisma.leaveRequest.findUnique", async () => {
    prismaMock.leaveRequest.findUnique.mockResolvedValue(fakeLeave);

    const result = await repository.findById("leave-1");

    expect(prismaMock.leaveRequest.findUnique).toHaveBeenCalledWith({ where: { id: "leave-1" } });
    expect(result).toEqual(fakeLeave);
  });

  it("findByEmployeeId delegates to prisma.leaveRequest.findMany", async () => {
    prismaMock.leaveRequest.findMany.mockResolvedValue([fakeLeave]);

    const result = await repository.findByEmployeeId("emp-1");

    expect(prismaMock.leaveRequest.findMany).toHaveBeenCalledWith({
      where: { employeeId: "emp-1" },
      orderBy: { createdAt: "desc" }
    });
    expect(result).toEqual([fakeLeave]);
  });

  it("updateStatus delegates to prisma.leaveRequest.update", async () => {
    const approved = { ...fakeLeave, status: LeaveStatus.APPROVED, reviewedByUserId: "admin-1" };
    prismaMock.leaveRequest.update.mockResolvedValue(approved);

    const result = await repository.updateStatus("leave-1", LeaveStatus.APPROVED, "admin-1");

    expect(prismaMock.leaveRequest.update).toHaveBeenCalledWith({
      where: { id: "leave-1" },
      data: { status: LeaveStatus.APPROVED, reviewedByUserId: "admin-1" }
    });
    expect(result).toEqual(approved);
  });

  it("create delegates to prisma.leaveRequest.create", async () => {
    prismaMock.leaveRequest.create.mockResolvedValue(fakeLeave);

    const result = await repository.create({
      employeeId: "emp-1",
      leaveType: LeaveType.SICK,
      startDate: fakeLeave.startDate,
      endDate: fakeLeave.endDate,
      reason: "Flu"
    });

    expect(prismaMock.leaveRequest.create).toHaveBeenCalled();
    expect(result).toEqual(fakeLeave);
  });
});
