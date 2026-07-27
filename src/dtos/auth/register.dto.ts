import { z } from "zod";
import { Role } from "@prisma/client";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.nativeEnum(Role).default(Role.EMPLOYEE)
  })
});

export type RegisterDto = z.infer<typeof registerSchema>["body"];
