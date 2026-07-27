import { Role } from "@prisma/client";

export { Role };

export interface User {
  readonly id: string;
  readonly email: string;
  readonly password: string;
  readonly role: Role;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type SafeUser = Omit<User, "password">;
