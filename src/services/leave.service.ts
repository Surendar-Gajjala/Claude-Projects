import { LeaveRepository } from "../repositories/leave.repository";
import { EmployeeRepository } from "../repositories/employee.repository";
import { LeaveRequest, LeaveStatus } from "../entities/leave-request.entity";
import { Role } from "../entities/user.entity";
import { CreateLeaveDto } from "../dtos/leave/create-leave.dto";
import { AppError } from "../utils/app-error";

export interface RequesterContext {
  readonly userId: string;
  readonly role: Role;
}

export class LeaveService {
  constructor(
    private readonly leaveRepository: LeaveRepository = new LeaveRepository(),
    private readonly employeeRepository: EmployeeRepository = new EmployeeRepository()
  ) {}

  async createLeaveRequest(dto: CreateLeaveDto, requester: RequesterContext): Promise<LeaveRequest> {
    const employeeId = await this.resolveEmployeeId(dto.employeeId, requester);

    const employee = await this.employeeRepository.findById(employeeId);
    if (!employee) {
      throw AppError.badRequest("employeeId does not reference an existing employee");
    }

    return this.leaveRepository.create({
      employeeId,
      leaveType: dto.leaveType,
      startDate: dto.startDate,
      endDate: dto.endDate,
      reason: dto.reason
    });
  }

  async listOwnLeaveRequests(userId: string): Promise<LeaveRequest[]> {
    const employee = await this.employeeRepository.findByUserId(userId);
    if (!employee) {
      throw AppError.badRequest("No employee profile is linked to this account");
    }
    return this.leaveRepository.findByEmployeeId(employee.id);
  }

  async listAllLeaveRequests(): Promise<LeaveRequest[]> {
    return this.leaveRepository.findAll();
  }

  async reviewLeaveRequest(
    id: string,
    status: typeof LeaveStatus.APPROVED | typeof LeaveStatus.REJECTED,
    reviewerUserId: string
  ): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRepository.findById(id);
    if (!leaveRequest) {
      throw AppError.notFound("Leave request not found");
    }

    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw AppError.conflict("This leave request has already been reviewed");
    }

    return this.leaveRepository.updateStatus(id, status, reviewerUserId);
  }

  private async resolveEmployeeId(
    requestedEmployeeId: string | undefined,
    requester: RequesterContext
  ): Promise<string> {
    if (requester.role === Role.ADMIN) {
      if (!requestedEmployeeId) {
        throw AppError.badRequest("employeeId is required when creating a leave request as an admin");
      }
      return requestedEmployeeId;
    }

    const ownEmployee = await this.employeeRepository.findByUserId(requester.userId);
    if (!ownEmployee) {
      throw AppError.badRequest("No employee profile is linked to this account");
    }

    if (requestedEmployeeId && requestedEmployeeId !== ownEmployee.id) {
      throw AppError.forbidden("Cannot create a leave request for another employee");
    }

    return ownEmployee.id;
  }
}
