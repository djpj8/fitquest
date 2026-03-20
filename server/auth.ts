import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import crypto from "crypto";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "fitquest_salt").digest("hex");
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}
