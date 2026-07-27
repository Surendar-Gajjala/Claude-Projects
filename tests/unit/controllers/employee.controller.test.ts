import { NextFunction } from "express";
import { EmployeeStatus } from "@prisma/client";
import { EmployeeController } from "../../../src/controllers/employee.controller";
import { EmployeeService } from "../../../src/services/employee.service";
import { createMockRequest, createMockResponse } from "./test-helpers";

jest.mock("../../../src/services/employee.service");

describe("EmployeeController", () => {
  let employeeService: jest.Mocked<EmployeeService>;
  let controller: EmployeeController;
  let next: NextFunction;

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
    employeeService = new EmployeeService() as jest.Mocked<EmployeeService>;
    controller = new EmployeeController(employeeService);
    next = jest.fn();
  });

  it("list responds with 200 and all employees", async () => {
    const req = createMockRequest();
    const res = createMockResponse();
    employeeService.listEmployees.mockResolvedValue([fakeEmployee]);

    await controller.list(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: [fakeEmployee] }));
  });

  it("getById responds with 200 and the employee", async () => {
    const req = createMockRequest({ params: { id: "emp-1" } });
    const res = createMockResponse();
    employeeService.getEmployeeById.mockResolvedValue(fakeEmployee);

    await controller.getById(req, res, next);

    expect(employeeService.getEmployeeById).toHaveBeenCalledWith("emp-1");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("remove responds with 200 and null data", async () => {
    const req = createMockRequest({ params: { id: "emp-1" } });
    const res = createMockResponse();
    employeeService.deleteEmployee.mockResolvedValue(undefined);

    await controller.remove(req, res, next);

    expect(employeeService.deleteEmployee).toHaveBeenCalledWith("emp-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: null }));
  });

  it("update responds with 200 and the updated employee", async () => {
    const req = createMockRequest({ params: { id: "emp-1" }, body: { jobTitle: "Senior Engineer" } });
    const res = createMockResponse();
    employeeService.updateEmployee.mockResolvedValue({ ...fakeEmployee, jobTitle: "Senior Engineer" });

    await controller.update(req, res, next);

    expect(employeeService.updateEmployee).toHaveBeenCalledWith("emp-1", { jobTitle: "Senior Engineer" });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("create responds with 201 and the created employee", async () => {
    const req = createMockRequest({ body: { firstName: "Jane" } });
    const res = createMockResponse();
    employeeService.createEmployee.mockResolvedValue(fakeEmployee);

    await controller.create(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: fakeEmployee }));
  });

  it("create propagates a rejected promise to next()", async () => {
    const req = createMockRequest({ body: {} });
    const res = createMockResponse();
    const error = new Error("boom");
    employeeService.createEmployee.mockRejectedValue(error);

    await controller.create(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
