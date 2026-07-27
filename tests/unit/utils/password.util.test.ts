import { hashPassword, comparePassword } from "../../../src/utils/password.util";

describe("password.util", () => {
  it("hashes a password and can verify it against the original", async () => {
    const hash = await hashPassword("Secret123!");

    expect(hash).not.toBe("Secret123!");
    await expect(comparePassword("Secret123!", hash)).resolves.toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("Secret123!");

    await expect(comparePassword("WrongPassword", hash)).resolves.toBe(false);
  });
});
