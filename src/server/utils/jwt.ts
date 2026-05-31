import jwt, { SignOptions } from "jsonwebtoken";
import { getEnv } from "../config/env";
import { UserRole } from "../models/User";

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export function signToken(payload: JwtPayload): string {
  const { JWT_SECRET, JWT_EXPIRES_IN } = getEnv();
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): JwtPayload {
  const { JWT_SECRET } = getEnv();
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
