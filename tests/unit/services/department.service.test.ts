import { DepartmentService } from "../../../src/services/department.service";
import { DepartmentRepository } from "../../../src/repositories/department.repository";
import { EmployeeRepository } from "../../../src/repositories/employee.repository";
import { EmployeeStatus } from "@prisma/client";

jest.mock("../../../src/repositories/department.repository");
jest.mock("../../../src/repositories/employee.repository");

describe("DepartmentService", () => {
  let departmentRepository: jest.Mocked<DepartmentRepository>;
  let employeeRepository: jest.Mocked<EmployeeRepository>;
  let service: DepartmentService;

  const fakeDepartment = {
    id: "dept-1",
    name: "Engineering",
    description: null,
    managerId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const fakeEmployee = {
    id: "emp-1",
    userId: null,
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
    phone: null,
    jobTitle: "Manager",
    salary: "50000",
    status: EmployeeStatus.ACTIVE,
    hireDate: new Date(),
    departmentId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    departmentRepository = new DepartmentRepository() as jest.Mocked<DepartmentRepository>;
    employeeRepository = new EmployeeRepository() as jest.Mocked<EmployeeRepository>;
    service = new DepartmentService(departmentRepository, employeeRepository);
  });

  describe("listDepartments", () => {
    it("returns all departments from the repository", async () => {
      departmentRepository.findAll.mockResolvedValue([fakeDepartment]);

      await expect(service.listDepartments()).resolves.toEqual([fakeDepartment]);
    });
  });

  describe("updateDepartment", () => {
    it("throws bad request when managerId does not reference an employee", async () => {
      departmentRepository.findById.mockResolvedValue(fakeDepartment);
      employeeRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateDepartment("dept-1", { managerId: "missing-emp" })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("updates the department when valid", async () => {
      departmentRepository.findById.mockResolvedValue(fakeDepartment);
      departmentRepository.update.mockResolvedValue({ ...fakeDepartment, name: "Platform" });

      const result = await service.updateDepartment("dept-1", { name: "Platform" });

      expect(departmentRepository.update).toHaveBeenCalledWith("dept-1", { name: "Platform" });
      expect(result.name).toBe("Platform");
    });
  });

  describe("getDepartmentById", () => {
    it("throws a 404 AppError when not found", async () => {
      departmentRepository.findById.mockResolvedValue(null);

      await expect(service.getDepartmentById("missing")).rejects.toMatchObject({ statusCode: 404 });
    });

    it("returns the department when found", async () => {
      departmentRepository.findById.mockResolvedValue(fakeDepartment);

      await expect(service.getDepartmentById("dept-1")).resolves.toEqual(fakeDepartment);
    });
  });

  describe("createDepartment", () => {
    it("throws a conflict when the name is already taken", async () => {
      departmentRepository.findByName.mockResolvedValue(fakeDepartment);

      await expect(service.createDepartment({ name: "Engineering" })).rejects.toMatchObject({
        statusCode: 409
      });
    });

    it("throws bad request when managerId does not reference an employee", async () => {
      departmentRepository.findByName.mockResolvedValue(null);
      employeeRepository.findById.mockResolvedValue(null);

      await expect(
        service.createDepartment({ name: "Sales", managerId: "missing-emp" })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("creates the department when valid", async () => {
      departmentRepository.findByName.mockResolvedValue(null);
      departmentRepository.create.mockResolvedValue(fakeDepartment);

      const result = await service.createDepartment({ name: "Engineering" });

      expect(departmentRepository.create).toHaveBeenCalledWith({ name: "Engineering" });
      expect(result).toEqual(fakeDepartment);
    });

    it("creates the department when managerId references a real employee", async () => {
      departmentRepository.findByName.mockResolvedValue(null);
      employeeRepository.findById.mockResolvedValue(fakeEmployee);
      departmentRepository.create.mockResolvedValue({ ...fakeDepartment, managerId: fakeEmployee.id });

      const result = await service.createDepartment({ name: "Engineering", managerId: fakeEmployee.id });

      expect(result.managerId).toBe(fakeEmployee.id);
    });
  });

  describe("deleteDepartment", () => {
    it("throws conflict when the department still has employees", async () => {
      departmentRepository.findById.mockResolvedValue(fakeDepartment);
      departmentRepository.hasEmployees.mockResolvedValue(true);

      await expect(service.deleteDepartment("dept-1")).rejects.toMatchObject({ statusCode: 409 });
      expect(departmentRepository.delete).not.toHaveBeenCalled();
    });

    it("deletes the department when it has no employees", async () => {
      departmentRepository.findById.mockResolvedValue(fakeDepartment);
      departmentRepository.hasEmployees.mockResolvedValue(false);

      await service.deleteDepartment("dept-1");

      expect(departmentRepository.delete).toHaveBeenCalledWith("dept-1");
    });
  });
});
