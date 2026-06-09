import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, requireAuth } from "../lib/auth.js";
import crypto from "crypto";
import type { JwtPayload } from "../lib/auth.js";

const router = Router();

function generateSafeKey(): string {
  return crypto.randomBytes(8).toString("hex").toUpperCase();
}

function formatUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    username: u.username,
    role: u.role,
    walletBalance: parseFloat(u.walletBalance),
    isActive: u.isActive,
    createdAt: u.createdAt,
  };
}

// POST /api/auth/register
router.post("/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body as { username: string; password: string };

    if (!username || username.length < 3) {
      res.status(400).json({ message: "Username must be at least 3 characters" });
      return;
    }
    if (!password || password.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters" });
      return;
    }

    const existing = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ message: "Username already taken" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const safeKey = generateSafeKey();
    const safeKeyHash = await bcrypt.hash(safeKey, 12);

    const [user] = await db.insert(usersTable).values({
      username,
      passwordHash,
      safeKeyHash,
      role: "user",
      walletBalance: "0",
      isActive: true,
    }).returning();

    const token = signToken({ userId: user.id, username: user.username, role: user.role });

    res.status(201).json({
      token,
      safeKey,
      user: formatUser(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body as { username: string; password: string };

    const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
    if (!user || !user.isActive) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = signToken({ userId: user.id, username: user.username, role: user.role });

    res.json({ token, user: formatUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/auth/reset-password
router.post("/auth/reset-password", async (req, res) => {
  try {
    const { username, safeKey, newPassword } = req.body as {
      username: string;
      safeKey: string;
      newPassword: string;
    };

    const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    const validKey = await bcrypt.compare(safeKey.toUpperCase(), user.safeKeyHash);
    if (!validKey) {
      res.status(400).json({ message: "Invalid safe key" });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters" });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, user.id));

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/auth/me
router.get("/auth/me", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: JwtPayload }).user;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(formatUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PATCH /api/auth/profile
router.patch("/auth/profile", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: JwtPayload }).user;
    const { password } = req.body as { password?: string };

    if (password) {
      if (password.length < 6) {
        res.status(400).json({ message: "Password must be at least 6 characters" });
        return;
      }
      const passwordHash = await bcrypt.hash(password, 12);
      await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, userId));
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    res.json(formatUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
