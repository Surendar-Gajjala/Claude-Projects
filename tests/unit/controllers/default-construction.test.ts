import { AuthController } from "../../../src/controllers/auth.controller";
import { DepartmentController } from "../../../src/controllers/department.controller";
import { EmployeeController } from "../../../src/controllers/employee.controller";
import { LeaveController } from "../../../src/controllers/leave.controller";

jest.mock("../../../src/services/auth.service");
jest.mock("../../../src/services/department.service");
jest.mock("../../../src/services/employee.service");
jest.mock("../../../src/services/leave.service");

describe("controller default constructor injection", () => {
  it("each controller can be constructed with its default service", () => {
    expect(new AuthController()).toBeInstanceOf(AuthController);
    expect(new DepartmentController()).toBeInstanceOf(DepartmentController);
    expect(new EmployeeController()).toBeInstanceOf(EmployeeController);
    expect(new LeaveController()).toBeInstanceOf(LeaveController);
  });
});
