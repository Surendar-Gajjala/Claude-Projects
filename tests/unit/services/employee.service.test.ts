import { EmployeeStatus } from "@prisma/client";
import { EmployeeService } from "../../../src/services/employee.service";
import { EmployeeRepository } from "../../../src/repositories/employee.repository";
import { DepartmentRepository } from "../../../src/repositories/department.repository";
import { UserRepository } from "../../../src/repositories/user.repository";

jest.mock("../../../src/repositories/employee.repository");
jest.mock("../../../src/repositories/department.repository");
jest.mock("../../../src/repositories/user.repository");

describe("EmployeeService", () => {
  let employeeRepository: jest.Mocked<EmployeeRepository>;
  let departmentRepository: jest.Mocked<DepartmentRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let service: EmployeeService;

  const fakeEmployee = {
    id: "emp-1",
    userId: null,
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

  beforeEach(() => {
    employeeRepository = new EmployeeRepository() as jest.Mocked<EmployeeRepository>;
    departmentRepository = new DepartmentRepository() as jest.Mocked<DepartmentRepository>;
    userRepository = new UserRepository() as jest.Mocked<UserRepository>;
    service = new EmployeeService(employeeRepository, departmentRepository, userRepository);
  });

  describe("listEmployees", () => {
    it("returns all employees from the repository", async () => {
      employeeRepository.findAll.mockResolvedValue([fakeEmployee]);

      await expect(service.listEmployees()).resolves.toEqual([fakeEmployee]);
    });
  });

  describe("updateEmployee", () => {
    it("throws bad request when departmentId does not reference a department", async () => {
      employeeRepository.findById.mockResolvedValue(fakeEmployee);
      departmentRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateEmployee("emp-1", { departmentId: "missing-dept" })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("updates the employee when valid", async () => {
      employeeRepository.findById.mockResolvedValue(fakeEmployee);
      employeeRepository.update.mockResolvedValue({ ...fakeEmployee, jobTitle: "Senior Engineer" });

      const result = await service.updateEmployee("emp-1", { jobTitle: "Senior Engineer" });

      expect(employeeRepository.update).toHaveBeenCalledWith("emp-1", { jobTitle: "Senior Engineer" });
      expect(result.jobTitle).toBe("Senior Engineer");
    });
  });

  describe("getEmployeeById", () => {
    it("throws a 404 AppError when not found", async () => {
      employeeRepository.findById.mockResolvedValue(null);

      await expect(service.getEmployeeById("missing")).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe("createEmployee", () => {
    const baseDto = {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      jobTitle: "Engineer",
      salary: 50000,
      status: EmployeeStatus.ACTIVE,
      hireDate: new Date()
    };

    it("throws a conflict when the email is already used", async () => {
      employeeRepository.findByEmail.mockResolvedValue(fakeEmployee);

      await expect(service.createEmployee(baseDto)).rejects.toMatchObject({ statusCode: 409 });
    });

    it("throws bad request when departmentId does not exist", async () => {
      employeeRepository.findByEmail.mockResolvedValue(null);
      departmentRepository.findById.mockResolvedValue(null);

      await expect(
        service.createEmployee({ ...baseDto, departmentId: "missing-dept" })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("throws bad request when userId does not exist", async () => {
      employeeRepository.findByEmail.mockResolvedValue(null);
      userRepository.findById.mockResolvedValue(null);

      await expect(
        service.createEmployee({ ...baseDto, userId: "missing-user" })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("creates the employee when valid", async () => {
      employeeRepository.findByEmail.mockResolvedValue(null);
      employeeRepository.create.mockResolvedValue(fakeEmployee);

      const result = await service.createEmployee(baseDto);

      expect(employeeRepository.create).toHaveBeenCalledWith(baseDto);
      expect(result).toEqual(fakeEmployee);
    });
  });

  describe("deleteEmployee", () => {
    it("deletes an existing employee", async () => {
      employeeRepository.findById.mockResolvedValue(fakeEmployee);

      await service.deleteEmployee("emp-1");

      expect(employeeRepository.delete).toHaveBeenCalledWith("emp-1");
    });
  });
});
