import { PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "../config/database";
import { LeaveRequest, LeaveStatus, LeaveType } from "../entities/leave-request.entity";

export interface CreateLeaveData {
  readonly employeeId: string;
  readonly leaveType: LeaveType;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly reason: string;
}

export class LeaveRepository {
  constructor(private readonly db: PrismaClient = defaultPrisma) {}

  async findAll(): Promise<LeaveRequest[]> {
    return this.db.leaveRequest.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findByEmployeeId(employeeId: string): Promise<LeaveRequest[]> {
    return this.db.leaveRequest.findMany({
      where: { employeeId },
      orderBy: { createdAt: "desc" }
    });
  }

  async findById(id: string): Promise<LeaveRequest | null> {
    return this.db.leaveRequest.findUnique({ where: { id } });
  }

  async create(data: CreateLeaveData): Promise<LeaveRequest> {
    return this.db.leaveRequest.create({ data });
  }

  async updateStatus(
    id: string,
    status: LeaveStatus,
    reviewedByUserId: string
  ): Promise<LeaveRequest> {
    return this.db.leaveRequest.update({
      where: { id },
      data: { status, reviewedByUserId }
    });
  }
}
