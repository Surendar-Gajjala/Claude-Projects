import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { Role } from "../entities/user.entity";

export interface JwtPayload {
  readonly sub: string;
  readonly email: string;
  readonly role: Role;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}
