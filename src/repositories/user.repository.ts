import { PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "../config/database";
import { User } from "../entities/user.entity";

export class UserRepository {
  constructor(private readonly db: PrismaClient = defaultPrisma) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { id } });
  }

  async create(data: { email: string; password: string; role: User["role"] }): Promise<User> {
    return this.db.user.create({ data });
  }

  async upsertByEmail(data: { email: string; password: string; role: User["role"] }): Promise<User> {
    return this.db.user.upsert({
      where: { email: data.email },
      update: { password: data.password, role: data.role },
      create: data
    });
  }

  async update(id: string, data: Partial<{ email: string; password: string; role: User["role"] }>): Promise<User> {
    return this.db.user.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.db.user.delete({ where: { id } });
  }
}
