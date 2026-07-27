import { Request, Response } from "express";
import { LeaveService } from "../services/leave.service";
import { successResponse } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import { AppError } from "../utils/app-error";

export class LeaveController {
  constructor(private readonly leaveService: LeaveService = new LeaveService()) {}

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw AppError.unauthorized();
    }
    const leaveRequest = await this.leaveService.createLeaveRequest(req.body, {
      userId: req.user.sub,
      role: req.user.role
    });
    res.status(201).json(successResponse("Leave request submitted successfully", leaveRequest));
  });

  listMine = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw AppError.unauthorized();
    }
    const leaveRequests = await this.leaveService.listOwnLeaveRequests(req.user.sub);
    res.status(200).json(successResponse("Leave requests retrieved successfully", leaveRequests));
  });

  listAll = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const leaveRequests = await this.leaveService.listAllLeaveRequests();
    res.status(200).json(successResponse("Leave requests retrieved successfully", leaveRequests));
  });

  review = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw AppError.unauthorized();
    }
    const leaveRequest = await this.leaveService.reviewLeaveRequest(
      req.params.id,
      req.body.status,
      req.user.sub
    );
    res.status(200).json(successResponse("Leave request reviewed successfully", leaveRequest));
  });
}
