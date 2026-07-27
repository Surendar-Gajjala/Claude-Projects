import { z } from "zod";
import { EmployeeStatus } from "@prisma/client";

export const updateEmployeeSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z
    .object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
      phone: z.string().min(1),
      jobTitle: z.string().min(1),
      salary: z.number().positive(),
      status: z.nativeEnum(EmployeeStatus),
      hireDate: z.coerce.date(),
      departmentId: z.string().uuid().nullable(),
      userId: z.string().uuid().nullable()
    })
    .partial()
});

export type UpdateEmployeeDto = z.infer<typeof updateEmployeeSchema>["body"];
