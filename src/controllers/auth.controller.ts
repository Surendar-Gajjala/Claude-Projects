import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { successResponse } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";

export class AuthController {
  constructor(private readonly authService: AuthService = new AuthService()) {}

  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await this.authService.register(req.body);
    res.status(201).json(successResponse("User registered successfully", user));
  });

  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.login(req.body);
    res.status(200).json(successResponse("Login successful", result));
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await this.authService.deleteUser(req.params.id);
    res.status(200).json(successResponse("User deleted successfully", null));
  });
}
