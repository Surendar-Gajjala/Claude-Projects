import { PrismaClient } from "@prisma/client";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";
import { DepartmentRepository } from "../../../src/repositories/department.repository";

describe("DepartmentRepository", () => {
  let prismaMock: DeepMockProxy<PrismaClient>;
  let repository: DepartmentRepository;

  const fakeDepartment = {
    id: "dept-1",
    name: "Engineering",
    description: null,
    managerId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    prismaMock = mockDeep<PrismaClient>();
    repository = new DepartmentRepository(prismaMock);
  });

  it("findAll delegates to prisma.department.findMany", async () => {
    prismaMock.department.findMany.mockResolvedValue([fakeDepartment]);

    const result = await repository.findAll();

    expect(prismaMock.department.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: "desc" } });
    expect(result).toEqual([fakeDepartment]);
  });

  it("findById delegates to prisma.department.findUnique", async () => {
    prismaMock.department.findUnique.mockResolvedValue(fakeDepartment);

    const result = await repository.findById("dept-1");

    expect(prismaMock.department.findUnique).toHaveBeenCalledWith({ where: { id: "dept-1" } });
    expect(result).toEqual(fakeDepartment);
  });

  it("create delegates to prisma.department.create", async () => {
    prismaMock.department.create.mockResolvedValue(fakeDepartment);

    const result = await repository.create({ name: "Engineering" });

    expect(prismaMock.department.create).toHaveBeenCalledWith({ data: { name: "Engineering" } });
    expect(result).toEqual(fakeDepartment);
  });

  it("update delegates to prisma.department.update", async () => {
    const updated = { ...fakeDepartment, name: "Platform" };
    prismaMock.department.update.mockResolvedValue(updated);

    const result = await repository.update("dept-1", { name: "Platform" });

    expect(prismaMock.department.update).toHaveBeenCalledWith({
      where: { id: "dept-1" },
      data: { name: "Platform" }
    });
    expect(result).toEqual(updated);
  });

  it("findByName delegates to prisma.department.findUnique", async () => {
    prismaMock.department.findUnique.mockResolvedValue(fakeDepartment);

    const result = await repository.findByName("Engineering");

    expect(prismaMock.department.findUnique).toHaveBeenCalledWith({
      where: { name: "Engineering" }
    });
    expect(result).toEqual(fakeDepartment);
  });

  it("hasEmployees returns true when the employee count is greater than zero", async () => {
    prismaMock.employee.count.mockResolvedValue(2);

    const result = await repository.hasEmployees("dept-1");

    expect(prismaMock.employee.count).toHaveBeenCalledWith({ where: { departmentId: "dept-1" } });
    expect(result).toBe(true);
  });

  it("hasEmployees returns false when there are no employees", async () => {
    prismaMock.employee.count.mockResolvedValue(0);

    const result = await repository.hasEmployees("dept-1");

    expect(result).toBe(false);
  });

  it("delete calls prisma.department.delete", async () => {
    prismaMock.department.delete.mockResolvedValue(fakeDepartment);

    await repository.delete("dept-1");

    expect(prismaMock.department.delete).toHaveBeenCalledWith({ where: { id: "dept-1" } });
  });
});
