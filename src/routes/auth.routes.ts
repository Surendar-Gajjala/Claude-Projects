import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/authenticate.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { authRateLimiter } from "../middleware/rate-limit.middleware";
import { validate } from "../middleware/validate.middleware";
import { registerSchema } from "../dtos/auth/register.dto";
import { loginSchema } from "../dtos/auth/login.dto";
import { Role } from "../entities/user.entity";

const router = Router();
const authController = new AuthController();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Log in and receive a JWT access token
 *     tags: [Auth]
 */
router.post("/login", authRateLimiter, validate(loginSchema), authController.login);

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user account (admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/register",
  authRateLimiter,
  authenticate,
  authorize(Role.ADMIN),
  validate(registerSchema),
  authController.register
);

export default router;
