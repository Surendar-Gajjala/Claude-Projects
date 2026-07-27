import rateLimit from "express-rate-limit";
import { errorResponse } from "../utils/api-response";

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: errorResponse("Too many requests, please try again later")
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: errorResponse("Too many authentication attempts, please try again later")
});
