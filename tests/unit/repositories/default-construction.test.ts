import { UserRepository } from "../../../src/repositories/user.repository";
import { EmployeeRepository } from "../../../src/repositories/employee.repository";
import { DepartmentRepository } from "../../../src/repositories/department.repository";
import { LeaveRepository } from "../../../src/repositories/leave.repository";

describe("repository default constructor injection", () => {
  it("each repository can be constructed with the default Prisma client", () => {
    expect(new UserRepository()).toBeInstanceOf(UserRepository);
    expect(new EmployeeRepository()).toBeInstanceOf(EmployeeRepository);
    expect(new DepartmentRepository()).toBeInstanceOf(DepartmentRepository);
    expect(new LeaveRepository()).toBeInstanceOf(LeaveRepository);
  });
});
