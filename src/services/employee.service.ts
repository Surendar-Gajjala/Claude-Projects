import { EmployeeRepository } from "../repositories/employee.repository";
import { DepartmentRepository } from "../repositories/department.repository";
import { UserRepository } from "../repositories/user.repository";
import { Employee } from "../entities/employee.entity";
import { CreateEmployeeDto } from "../dtos/employee/create-employee.dto";
import { UpdateEmployeeDto } from "../dtos/employee/update-employee.dto";
import { AppError } from "../utils/app-error";

export class EmployeeService {
  constructor(
    private readonly employeeRepository: EmployeeRepository = new EmployeeRepository(),
    private readonly departmentRepository: DepartmentRepository = new DepartmentRepository(),
    private readonly userRepository: UserRepository = new UserRepository()
  ) {}

  async listEmployees(): Promise<Employee[]> {
    return this.employeeRepository.findAll();
  }

  async getEmployeeById(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findById(id);
    if (!employee) {
      throw AppError.notFound("Employee not found");
    }
    return employee;
  }

  async createEmployee(dto: CreateEmployeeDto): Promise<Employee> {
    const existing = await this.employeeRepository.findByEmail(dto.email);
    if (existing) {
      throw AppError.conflict("An employee with this email already exists");
    }

    if (dto.departmentId) {
      const department = await this.departmentRepository.findById(dto.departmentId);
      if (!department) {
        throw AppError.badRequest("departmentId does not reference an existing department");
      }
    }

    if (dto.userId) {
      const user = await this.userRepository.findById(dto.userId);
      if (!user) {
        throw AppError.badRequest("userId does not reference an existing user");
      }
    }

    return this.employeeRepository.create(dto);
  }

  async updateEmployee(id: string, dto: UpdateEmployeeDto): Promise<Employee> {
    await this.getEmployeeById(id);

    if (dto.departmentId) {
      const department = await this.departmentRepository.findById(dto.departmentId);
      if (!department) {
        throw AppError.badRequest("departmentId does not reference an existing department");
      }
    }

    return this.employeeRepository.update(id, dto);
  }

  async deleteEmployee(id: string): Promise<void> {
    await this.getEmployeeById(id);
    await this.employeeRepository.delete(id);
  }
}
