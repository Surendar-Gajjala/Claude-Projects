import { PrismaClient, EmployeeStatus, Prisma } from "@prisma/client";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";
import { EmployeeRepository } from "../../../src/repositories/employee.repository";

describe("EmployeeRepository", () => {
  let prismaMock: DeepMockProxy<PrismaClient>;
  let repository: EmployeeRepository;

  const fakeRow = {
    id: "emp-1",
    userId: null,
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
    phone: null,
    jobTitle: "Engineer",
    salary: new Prisma.Decimal("50000"),
    status: EmployeeStatus.ACTIVE,
    hireDate: new Date("2024-01-01"),
    departmentId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    prismaMock = mockDeep<PrismaClient>();
    repository = new EmployeeRepository(prismaMock);
  });

  it("findAll maps salary to a string on every row", async () => {
    prismaMock.employee.findMany.mockResolvedValue([fakeRow]);

    const result = await repository.findAll();

    expect(result).toEqual([{ ...fakeRow, salary: "50000" }]);
  });

  it("findById returns null when no row is found", async () => {
    prismaMock.employee.findUnique.mockResolvedValue(null);

    const result = await repository.findById("missing");

    expect(result).toBeNull();
  });

  it("findById maps a found row to an entity", async () => {
    prismaMock.employee.findUnique.mockResolvedValue(fakeRow);

    const result = await repository.findById("emp-1");

    expect(result).toEqual({ ...fakeRow, salary: "50000" });
  });

  it("findByEmail maps a found row to an entity", async () => {
    prismaMock.employee.findUnique.mockResolvedValue(fakeRow);

    const result = await repository.findByEmail("jane@example.com");

    expect(prismaMock.employee.findUnique).toHaveBeenCalledWith({ where: { email: "jane@example.com" } });
    expect(result?.salary).toBe("50000");
  });

  it("findByEmail returns null when no row is found", async () => {
    prismaMock.employee.findUnique.mockResolvedValue(null);

    await expect(repository.findByEmail("missing@example.com")).resolves.toBeNull();
  });

  it("findByUserId maps a found row to an entity", async () => {
    prismaMock.employee.findUnique.mockResolvedValue(fakeRow);

    const result = await repository.findByUserId("user-1");

    expect(prismaMock.employee.findUnique).toHaveBeenCalledWith({ where: { userId: "user-1" } });
    expect(result?.salary).toBe("50000");
  });

  it("findByUserId returns null when no row is found", async () => {
    prismaMock.employee.findUnique.mockResolvedValue(null);

    await expect(repository.findByUserId("missing-user")).resolves.toBeNull();
  });

  it("update passes data through to prisma and maps the result", async () => {
    const updatedRow = { ...fakeRow, jobTitle: "Senior Engineer" };
    prismaMock.employee.update.mockResolvedValue(updatedRow);

    const result = await repository.update("emp-1", { jobTitle: "Senior Engineer" });

    expect(prismaMock.employee.update).toHaveBeenCalledWith({
      where: { id: "emp-1" },
      data: { jobTitle: "Senior Engineer" }
    });
    expect(result.jobTitle).toBe("Senior Engineer");
  });

  it("create passes data through to prisma and maps the result", async () => {
    prismaMock.employee.create.mockResolvedValue(fakeRow);

    const result = await repository.create({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      jobTitle: "Engineer",
      salary: 50000,
      status: EmployeeStatus.ACTIVE,
      hireDate: new Date("2024-01-01")
    });

    expect(prismaMock.employee.create).toHaveBeenCalled();
    expect(result.salary).toBe("50000");
  });

  it("delete calls prisma.employee.delete", async () => {
    prismaMock.employee.delete.mockResolvedValue(fakeRow);

    await repository.delete("emp-1");

    expect(prismaMock.employee.delete).toHaveBeenCalledWith({ where: { id: "emp-1" } });
  });
});
