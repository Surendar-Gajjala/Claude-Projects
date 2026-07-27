import { DepartmentRepository } from "../repositories/department.repository";
import { EmployeeRepository } from "../repositories/employee.repository";
import { Department } from "../entities/department.entity";
import { CreateDepartmentDto } from "../dtos/department/create-department.dto";
import { UpdateDepartmentDto } from "../dtos/department/update-department.dto";
import { AppError } from "../utils/app-error";

export class DepartmentService {
  constructor(
    private readonly departmentRepository: DepartmentRepository = new DepartmentRepository(),
    private readonly employeeRepository: EmployeeRepository = new EmployeeRepository()
  ) {}

  async listDepartments(): Promise<Department[]> {
    return this.departmentRepository.findAll();
  }

  async getDepartmentById(id: string): Promise<Department> {
    const department = await this.departmentRepository.findById(id);
    if (!department) {
      throw AppError.notFound("Department not found");
    }
    return department;
  }

  async createDepartment(dto: CreateDepartmentDto): Promise<Department> {
    const existing = await this.departmentRepository.findByName(dto.name);
    if (existing) {
      throw AppError.conflict("A department with this name already exists");
    }

    if (dto.managerId) {
      const manager = await this.employeeRepository.findById(dto.managerId);
      if (!manager) {
        throw AppError.badRequest("managerId does not reference an existing employee");
      }
    }

    return this.departmentRepository.create(dto);
  }

  async updateDepartment(id: string, dto: UpdateDepartmentDto): Promise<Department> {
    await this.getDepartmentById(id);

    if (dto.managerId) {
      const manager = await this.employeeRepository.findById(dto.managerId);
      if (!manager) {
        throw AppError.badRequest("managerId does not reference an existing employee");
      }
    }

    return this.departmentRepository.update(id, dto);
  }

  async deleteDepartment(id: string): Promise<void> {
    await this.getDepartmentById(id);

    const hasEmployees = await this.departmentRepository.hasEmployees(id);
    if (hasEmployees) {
      throw AppError.conflict("Cannot delete a department that still has employees assigned");
    }

    await this.departmentRepository.delete(id);
  }
}
