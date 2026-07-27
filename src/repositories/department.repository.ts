import { PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "../config/database";
import { Department } from "../entities/department.entity";

export interface CreateDepartmentData {
  readonly name: string;
  readonly description?: string;
  readonly managerId?: string;
}

export type UpdateDepartmentData = Omit<Partial<CreateDepartmentData>, "managerId" | "description"> & {
  managerId?: string | null;
  description?: string | null;
};

export class DepartmentRepository {
  constructor(private readonly db: PrismaClient = defaultPrisma) {}

  async findAll(): Promise<Department[]> {
    return this.db.department.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findById(id: string): Promise<Department | null> {
    return this.db.department.findUnique({ where: { id } });
  }

  async findByName(name: string): Promise<Department | null> {
    return this.db.department.findUnique({ where: { name } });
  }

  async create(data: CreateDepartmentData): Promise<Department> {
    return this.db.department.create({ data });
  }

  async update(id: string, data: UpdateDepartmentData): Promise<Department> {
    return this.db.department.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.db.department.delete({ where: { id } });
  }

  async hasEmployees(id: string): Promise<boolean> {
    const count = await this.db.employee.count({ where: { departmentId: id } });
    return count > 0;
  }
}
