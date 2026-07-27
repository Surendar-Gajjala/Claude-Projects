import { Request, Response } from "express";
import { DepartmentService } from "../services/department.service";
import { successResponse } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";

export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService = new DepartmentService()) {}

  list = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const departments = await this.departmentService.listDepartments();
    res.status(200).json(successResponse("Departments retrieved successfully", departments));
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const department = await this.departmentService.getDepartmentById(req.params.id);
    res.status(200).json(successResponse("Department retrieved successfully", department));
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const department = await this.departmentService.createDepartment(req.body);
    res.status(201).json(successResponse("Department created successfully", department));
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const department = await this.departmentService.updateDepartment(req.params.id, req.body);
    res.status(200).json(successResponse("Department updated successfully", department));
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await this.departmentService.deleteDepartment(req.params.id);
    res.status(200).json(successResponse("Department deleted successfully", null));
  });
}
