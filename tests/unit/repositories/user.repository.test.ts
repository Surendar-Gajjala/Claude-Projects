import { PrismaClient, Role } from "@prisma/client";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";
import { UserRepository } from "../../../src/repositories/user.repository";

describe("UserRepository", () => {
  let prismaMock: DeepMockProxy<PrismaClient>;
  let repository: UserRepository;

  beforeEach(() => {
    prismaMock = mockDeep<PrismaClient>();
    repository = new UserRepository(prismaMock);
  });

  const fakeUser = {
    id: "user-1",
    email: "user@example.com",
    password: "hashed",
    role: Role.EMPLOYEE,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  it("findByEmail delegates to prisma.user.findUnique", async () => {
    prismaMock.user.findUnique.mockResolvedValue(fakeUser);

    const result = await repository.findByEmail("user@example.com");

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: "user@example.com" }
    });
    expect(result).toEqual(fakeUser);
  });

  it("findById delegates to prisma.user.findUnique", async () => {
    prismaMock.user.findUnique.mockResolvedValue(fakeUser);

    const result = await repository.findById("user-1");

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id: "user-1" } });
    expect(result).toEqual(fakeUser);
  });

  it("create delegates to prisma.user.create", async () => {
    prismaMock.user.create.mockResolvedValue(fakeUser);

    const result = await repository.create({
      email: fakeUser.email,
      password: fakeUser.password,
      role: fakeUser.role
    });

    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: { email: fakeUser.email, password: fakeUser.password, role: fakeUser.role }
    });
    expect(result).toEqual(fakeUser);
  });

  it("upsertByEmail delegates to prisma.user.upsert", async () => {
    prismaMock.user.upsert.mockResolvedValue(fakeUser);

    const result = await repository.upsertByEmail({
      email: fakeUser.email,
      password: fakeUser.password,
      role: fakeUser.role
    });

    expect(prismaMock.user.upsert).toHaveBeenCalled();
    expect(result).toEqual(fakeUser);
  });
});
