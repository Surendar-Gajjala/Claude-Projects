import { z } from "zod";
import { Role } from "@prisma/client";

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z
    .object({
      email: z.string().email(),
      password: z.string().min(8, "Password must be at least 8 characters"),
      role: z.nativeEnum(Role)
    })
    .partial()
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>["body"];
