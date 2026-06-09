import jwt from "jsonwebtoken";
import { type Request, type Response, type NextFunction } from "express";
import crypto from "crypto";

const _rawSecret = process.env["JWT_SECRET"];
const JWT_SECRET: string = _rawSecret ?? (() => {
  if (process.env["NODE_ENV"] === "production") {
    throw new Error("JWT_SECRET environment variable must be set in production");
  }
  const ephemeral = crypto.randomBytes(32).toString("hex");
  console.warn("[auth] JWT_SECRET not set — using ephemeral dev secret (tokens expire on restart)");
  return ephemeral;
})();

export interface JwtPayload {
  userId: number;
  username: string;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET!) as JwtPayload;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers["authorization"];
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = header.slice(7);
  try {
    const payload = verifyToken(token);
    (req as Request & { user: JwtPayload }).user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    const user = (req as Request & { user: JwtPayload }).user;
    if (user.role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  });
}
