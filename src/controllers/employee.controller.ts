import { Request, Response } from "express";
import { EmployeeService } from "../services/employee.service";
import { successResponse } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";

export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService = new EmployeeService()) {}

  list = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const employees = await this.employeeService.listEmployees();
    res.status(200).json(successResponse("Employees retrieved successfully", employees));
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const employee = await this.employeeService.getEmployeeById(req.params.id);
    res.status(200).json(successResponse("Employee retrieved successfully", employee));
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const employee = await this.employeeService.createEmployee(req.body);
    res.status(201).json(successResponse("Employee created successfully", employee));
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const employee = await this.employeeService.updateEmployee(req.params.id, req.body);
    res.status(200).json(successResponse("Employee updated successfully", employee));
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await this.employeeService.deleteEmployee(req.params.id);
    res.status(200).json(successResponse("Employee deleted successfully", null));
  });
}
