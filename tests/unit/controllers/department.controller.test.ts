import { NextFunction } from "express";
import { DepartmentController } from "../../../src/controllers/department.controller";
import { DepartmentService } from "../../../src/services/department.service";
import { AppError } from "../../../src/utils/app-error";
import { createMockRequest, createMockResponse } from "./test-helpers";

jest.mock("../../../src/services/department.service");

describe("DepartmentController", () => {
  let departmentService: jest.Mocked<DepartmentService>;
  let controller: DepartmentController;
  let next: NextFunction;

  const fakeDepartment = {
    id: "dept-1",
    name: "Engineering",
    description: null,
    managerId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    departmentService = new DepartmentService() as jest.Mocked<DepartmentService>;
    controller = new DepartmentController(departmentService);
    next = jest.fn();
  });

  it("list responds with 200 and all departments", async () => {
    const req = createMockRequest();
    const res = createMockResponse();
    departmentService.listDepartments.mockResolvedValue([fakeDepartment]);

    await controller.list(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: [fakeDepartment] }));
  });

  it("getById forwards a not-found error to next()", async () => {
    const req = createMockRequest({ params: { id: "missing" } });
    const res = createMockResponse();
    const error = AppError.notFound("Department not found");
    departmentService.getDepartmentById.mockRejectedValue(error);

    await controller.getById(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("getById responds with 200 and the department", async () => {
    const req = createMockRequest({ params: { id: "dept-1" } });
    const res = createMockResponse();
    departmentService.getDepartmentById.mockResolvedValue(fakeDepartment);

    await controller.getById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: fakeDepartment }));
  });

  it("update responds with 200 and the updated department", async () => {
    const req = createMockRequest({ params: { id: "dept-1" }, body: { name: "Platform" } });
    const res = createMockResponse();
    departmentService.updateDepartment.mockResolvedValue({ ...fakeDepartment, name: "Platform" });

    await controller.update(req, res, next);

    expect(departmentService.updateDepartment).toHaveBeenCalledWith("dept-1", { name: "Platform" });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("create responds with 201 and the created department", async () => {
    const req = createMockRequest({ body: { name: "Engineering" } });
    const res = createMockResponse();
    departmentService.createDepartment.mockResolvedValue(fakeDepartment);

    await controller.create(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: fakeDepartment }));
  });

  it("remove responds with 200 and null data", async () => {
    const req = createMockRequest({ params: { id: "dept-1" } });
    const res = createMockResponse();
    departmentService.deleteDepartment.mockResolvedValue(undefined);

    await controller.remove(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: null }));
  });
});
