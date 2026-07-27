import { EmployeeStatus } from "@prisma/client";

export { EmployeeStatus };

export interface Employee {
  readonly id: string;
  readonly userId: string | null;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone: string | null;
  readonly jobTitle: string;
  readonly salary: string;
  readonly status: EmployeeStatus;
  readonly hireDate: Date;
  readonly departmentId: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
