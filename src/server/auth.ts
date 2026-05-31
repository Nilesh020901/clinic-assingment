import { NextRequest } from "next/server";
import { verifyToken, JwtPayload } from "./utils/jwt";
import { UnauthorizedError, ForbiddenError } from "./utils/errors";
import { UserRole } from "./models/User";

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.split(" ")[1];
}

export function requireAuth(request: NextRequest): JwtPayload {
  const token = getTokenFromRequest(request);
  if (!token) {
    throw new UnauthorizedError("Access token is required");
  }
  try {
    return verifyToken(token);
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}

export function requireRole(user: JwtPayload, ...roles: UserRole[]): void {
  if (!roles.includes(user.role)) {
    throw new ForbiddenError("Insufficient permissions");
  }
}
