import { z } from "zod";
import { LeaveStatus } from "@prisma/client";

export const reviewLeaveSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    status: z.enum([LeaveStatus.APPROVED, LeaveStatus.REJECTED])
  })
});

export type ReviewLeaveDto = z.infer<typeof reviewLeaveSchema>["body"];
