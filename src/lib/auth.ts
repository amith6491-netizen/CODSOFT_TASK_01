import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export interface TokenPayload {
  userId: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  email: string;
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

/** Extracts and verifies the auth token from a request's cookies. */
export function getAuthUser(req: NextRequest): TokenPayload | null {
  const token = req.cookies.get("edumanage_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** Throws-free role check helper. */
export function hasRole(user: TokenPayload | null, ...roles: TokenPayload["role"][]) {
  return !!user && roles.includes(user.role);
}
