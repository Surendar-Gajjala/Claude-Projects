import { LeaveStatus, LeaveType } from "@prisma/client";

export { LeaveStatus, LeaveType };

export interface LeaveRequest {
  readonly id: string;
  readonly employeeId: string;
  readonly leaveType: LeaveType;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly reason: string;
  readonly status: LeaveStatus;
  readonly reviewedByUserId: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
