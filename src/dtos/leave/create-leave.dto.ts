import { z } from "zod";
import { LeaveType } from "@prisma/client";

export const createLeaveSchema = z.object({
  body: z
    .object({
      employeeId: z.string().uuid().optional(),
      leaveType: z.nativeEnum(LeaveType),
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
      reason: z.string().min(1)
    })
    .refine((data) => data.endDate >= data.startDate, {
      message: "endDate must be on or after startDate",
      path: ["endDate"]
    })
});

export type CreateLeaveDto = z.infer<typeof createLeaveSchema>["body"];
