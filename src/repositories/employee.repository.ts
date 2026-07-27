import { Employee as EmployeeRow, PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "../config/database";
import { Employee } from "../entities/employee.entity";

function toEntity(row: EmployeeRow): Employee {
  return { ...row, salary: row.salary.toString() };
}

export interface CreateEmployeeData {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone?: string;
  readonly jobTitle: string;
  readonly salary: number;
  readonly status: Employee["status"];
  readonly hireDate: Date;
  readonly departmentId?: string;
  readonly userId?: string;
}

export type UpdateEmployeeData = Omit<Partial<CreateEmployeeData>, "departmentId" | "userId"> & {
  departmentId?: string | null;
  userId?: string | null;
};

export class EmployeeRepository {
  constructor(private readonly db: PrismaClient = defaultPrisma) {}

  async findAll(): Promise<Employee[]> {
    const rows = await this.db.employee.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map(toEntity);
  }

  async findById(id: string): Promise<Employee | null> {
    const row = await this.db.employee.findUnique({ where: { id } });
    return row ? toEntity(row) : null;
  }

  async findByEmail(email: string): Promise<Employee | null> {
    const row = await this.db.employee.findUnique({ where: { email } });
    return row ? toEntity(row) : null;
  }

  async findByUserId(userId: string): Promise<Employee | null> {
    const row = await this.db.employee.findUnique({ where: { userId } });
    return row ? toEntity(row) : null;
  }

  async create(data: CreateEmployeeData): Promise<Employee> {
    const row = await this.db.employee.create({ data });
    return toEntity(row);
  }

  async update(id: string, data: UpdateEmployeeData): Promise<Employee> {
    const row = await this.db.employee.update({ where: { id }, data });
    return toEntity(row);
  }

  async delete(id: string): Promise<void> {
    await this.db.employee.delete({ where: { id } });
  }
}
