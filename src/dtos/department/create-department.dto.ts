import { z } from "zod";

export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().min(1).optional(),
    managerId: z.string().uuid().optional()
  })
});

export type CreateDepartmentDto = z.infer<typeof createDepartmentSchema>["body"];
