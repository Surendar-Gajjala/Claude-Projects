import { signAccessToken, verifyAccessToken } from "../../../src/utils/jwt.util";
import { Role } from "../../../src/entities/user.entity";

describe("jwt.util", () => {
  it("signs a token that can be verified back to the original payload", () => {
    const payload = { sub: "user-1", email: "user@example.com", role: Role.ADMIN };

    const token = signAccessToken(payload);
    const decoded = verifyAccessToken(token);

    expect(decoded.sub).toBe(payload.sub);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  it("throws when verifying an invalid token", () => {
    expect(() => verifyAccessToken("not-a-valid-token")).toThrow();
  });
});
