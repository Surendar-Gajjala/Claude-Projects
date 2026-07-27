import { z } from "zod";
import { EmployeeStatus } from "@prisma/client";

export const createEmployeeSchema = z.object({
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1).optional(),
    jobTitle: z.string().min(1),
    salary: z.number().positive(),
    status: z.nativeEnum(EmployeeStatus).default(EmployeeStatus.ACTIVE),
    hireDate: z.coerce.date(),
    departmentId: z.string().uuid().optional(),
    userId: z.string().uuid().optional()
  })
});

export type CreateEmployeeDto = z.infer<typeof createEmployeeSchema>["body"];
