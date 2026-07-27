import { Role } from "@prisma/client";
import { AuthService } from "../../../src/services/auth.service";
import { UserRepository } from "../../../src/repositories/user.repository";
import { AppError } from "../../../src/utils/app-error";
import { hashPassword } from "../../../src/utils/password.util";

jest.mock("../../../src/repositories/user.repository");

describe("AuthService", () => {
  let userRepository: jest.Mocked<UserRepository>;
  let authService: AuthService;

  beforeEach(() => {
    userRepository = new UserRepository() as jest.Mocked<UserRepository>;
    authService = new AuthService(userRepository);
  });

  describe("register", () => {
    it("throws a conflict AppError when the email is already taken", async () => {
      userRepository.findByEmail.mockResolvedValue({
        id: "u1",
        email: "taken@example.com",
        password: "hash",
        role: Role.EMPLOYEE,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await expect(
        authService.register({ email: "taken@example.com", password: "Password1!", role: Role.EMPLOYEE })
      ).rejects.toMatchObject({ statusCode: 409 } satisfies Partial<AppError>);
    });

    it("hashes the password and returns a user without it", async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue({
        id: "u2",
        email: "new@example.com",
        password: "hashed-value",
        role: Role.EMPLOYEE,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await authService.register({
        email: "new@example.com",
        password: "Password1!",
        role: Role.EMPLOYEE
      });

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: "new@example.com", role: Role.EMPLOYEE })
      );
      expect(result).not.toHaveProperty("password");
    });
  });

  describe("login", () => {
    it("throws unauthorized when the user does not exist", async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: "nobody@example.com", password: "whatever" })
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it("throws unauthorized when the password does not match", async () => {
      const hashed = await hashPassword("correct-password");
      userRepository.findByEmail.mockResolvedValue({
        id: "u1",
        email: "user@example.com",
        password: hashed,
        role: Role.EMPLOYEE,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await expect(
        authService.login({ email: "user@example.com", password: "wrong-password" })
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it("returns a token and safe user on success", async () => {
      const hashed = await hashPassword("correct-password");
      userRepository.findByEmail.mockResolvedValue({
        id: "u1",
        email: "user@example.com",
        password: hashed,
        role: Role.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await authService.login({ email: "user@example.com", password: "correct-password" });

      expect(result.token).toEqual(expect.any(String));
      expect(result.user).not.toHaveProperty("password");
      expect(result.user.role).toBe(Role.ADMIN);
    });
  });
});
