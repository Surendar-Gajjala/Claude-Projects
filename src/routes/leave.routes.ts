import { Router } from "express";
import { LeaveController } from "../controllers/leave.controller";
import { authenticate } from "../middleware/authenticate.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { validate } from "../middleware/validate.middleware";
import { createLeaveSchema } from "../dtos/leave/create-leave.dto";
import { reviewLeaveSchema } from "../dtos/leave/review-leave.dto";
import { Role } from "../entities/user.entity";

const router = Router();
const leaveController = new LeaveController();

router.use(authenticate);

/**
 * @openapi
 * /api/leaves:
 *   post:
 *     summary: Submit a leave request
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", validate(createLeaveSchema), leaveController.create);

/**
 * @openapi
 * /api/leaves/mine:
 *   get:
 *     summary: List the caller's own leave requests
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 */
router.get("/mine", leaveController.listMine);

/**
 * @openapi
 * /api/leaves:
 *   get:
 *     summary: List all leave requests (admin only)
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", authorize(Role.ADMIN), leaveController.listAll);

/**
 * @openapi
 * /api/leaves/{id}/review:
 *   patch:
 *     summary: Approve or reject a leave request (admin only)
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  "/:id/review",
  authorize(Role.ADMIN),
  validate(reviewLeaveSchema),
  leaveController.review
);

export default router;
