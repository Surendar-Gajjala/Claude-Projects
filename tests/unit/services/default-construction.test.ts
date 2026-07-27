import { AuthService } from "../../../src/services/auth.service";
import { EmployeeService } from "../../../src/services/employee.service";
import { DepartmentService } from "../../../src/services/department.service";
import { LeaveService } from "../../../src/services/leave.service";

jest.mock("../../../src/repositories/user.repository");
jest.mock("../../../src/repositories/employee.repository");
jest.mock("../../../src/repositories/department.repository");
jest.mock("../../../src/repositories/leave.repository");

describe("service default constructor injection", () => {
  it("each service can be constructed with its default repositories", () => {
    expect(new AuthService()).toBeInstanceOf(AuthService);
    expect(new EmployeeService()).toBeInstanceOf(EmployeeService);
    expect(new DepartmentService()).toBeInstanceOf(DepartmentService);
    expect(new LeaveService()).toBeInstanceOf(LeaveService);
  });
});
