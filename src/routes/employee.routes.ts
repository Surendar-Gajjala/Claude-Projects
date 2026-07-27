import { Router } from "express";
import { z } from "zod";
import { EmployeeController } from "../controllers/employee.controller";
import { authenticate } from "../middleware/authenticate.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { validate } from "../middleware/validate.middleware";
import { createEmployeeSchema } from "../dtos/employee/create-employee.dto";
import { updateEmployeeSchema } from "../dtos/employee/update-employee.dto";
import { Role } from "../entities/user.entity";

const router = Router();
const employeeController = new EmployeeController();
const idParamSchema = z.object({ params: z.object({ id: z.string().uuid() }) });

router.use(authenticate);

/**
 * @openapi
 * /api/employees:
 *   get:
 *     summary: List all employees
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", employeeController.list);

/**
 * @openapi
 * /api/employees/{id}:
 *   get:
 *     summary: Get an employee by id
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", validate(idParamSchema), employeeController.getById);

/**
 * @openapi
 * /api/employees:
 *   post:
 *     summary: Create an employee (admin only)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", authorize(Role.ADMIN), validate(createEmployeeSchema), employeeController.create);

/**
 * @openapi
 * /api/employees/{id}:
 *   put:
 *     summary: Update an employee (admin only)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/:id",
  authorize(Role.ADMIN),
  validate(updateEmployeeSchema),
  employeeController.update
);

/**
 * @openapi
 * /api/employees/{id}:
 *   delete:
 *     summary: Delete an employee (admin only)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", authorize(Role.ADMIN), validate(idParamSchema), employeeController.remove);

export default router;
