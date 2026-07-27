import { z } from "zod";

export const updateDepartmentSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z
    .object({
      name: z.string().min(1),
      description: z.string().min(1).nullable(),
      managerId: z.string().uuid().nullable()
    })
    .partial()
});

export type UpdateDepartmentDto = z.infer<typeof updateDepartmentSchema>["body"];
