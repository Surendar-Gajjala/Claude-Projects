import { Router } from "express";
import { DepartmentController } from "../controllers/department.controller";
import { authenticate } from "../middleware/authenticate.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { validate } from "../middleware/validate.middleware";
import { createDepartmentSchema } from "../dtos/department/create-department.dto";
import { updateDepartmentSchema } from "../dtos/department/update-department.dto";
import { Role } from "../entities/user.entity";
import { z } from "zod";

const router = Router();
const departmentController = new DepartmentController();
const idParamSchema = z.object({ params: z.object({ id: z.string().uuid() }) });

router.use(authenticate);

/**
 * @openapi
 * /api/departments:
 *   get:
 *     summary: List all departments
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", departmentController.list);

/**
 * @openapi
 * /api/departments/{id}:
 *   get:
 *     summary: Get a department by id
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", validate(idParamSchema), departmentController.getById);

/**
 * @openapi
 * /api/departments:
 *   post:
 *     summary: Create a department (admin only)
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/",
  authorize(Role.ADMIN),
  validate(createDepartmentSchema),
  departmentController.create
);

/**
 * @openapi
 * /api/departments/{id}:
 *   put:
 *     summary: Update a department (admin only)
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/:id",
  authorize(Role.ADMIN),
  validate(updateDepartmentSchema),
  departmentController.update
);

/**
 * @openapi
 * /api/departments/{id}:
 *   delete:
 *     summary: Delete a department (admin only)
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", authorize(Role.ADMIN), validate(idParamSchema), departmentController.remove);

export default router;
