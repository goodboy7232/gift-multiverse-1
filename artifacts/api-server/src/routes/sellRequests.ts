import { Router } from "express";
import { db } from "@workspace/db";
import { sellRequestsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import type { JwtPayload } from "../lib/auth.js";

const router = Router();

function formatSell(s: typeof sellRequestsTable.$inferSelect) {
  return {
    id: s.id,
    userId: s.userId,
    brand: s.brand,
    websiteUrl: s.websiteUrl,
    cardFaceValue: parseFloat(s.cardFaceValue),
    askingPrice: parseFloat(s.askingPrice),
    voucherCode: s.voucherCode,
    cardType: s.cardType,
    extraDetails: s.extraDetails ?? null,
    status: s.status,
    approvedPayout: s.approvedPayout != null ? parseFloat(s.approvedPayout) : null,
    adminNote: s.adminNote ?? null,
    createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt,
  };
}

// POST /api/sell-requests
router.post("/sell-requests", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: JwtPayload }).user;
    const { brand, websiteUrl, cardFaceValue, askingPrice, voucherCode, cardType, extraDetails } = req.body as {
      brand: string;
      websiteUrl: string;
      cardFaceValue: number;
      askingPrice: number;
      voucherCode: string;
      cardType: string;
      extraDetails?: string;
    };

    if (!brand || !websiteUrl || !cardFaceValue || !askingPrice || !voucherCode) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const [sell] = await db
      .insert(sellRequestsTable)
      .values({
        userId,
        brand,
        websiteUrl,
        cardFaceValue: cardFaceValue.toString(),
        askingPrice: askingPrice.toString(),
        voucherCode,
        cardType: cardType ?? "digital",
        extraDetails: extraDetails ?? null,
        status: "pending",
      })
      .returning();

    res.status(201).json(formatSell(sell));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/sell-requests
router.get("/sell-requests", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: JwtPayload }).user;

    const sells = await db
      .select()
      .from(sellRequestsTable)
      .where(eq(sellRequestsTable.userId, userId))
      .orderBy(desc(sellRequestsTable.createdAt));

    res.json(sells.map(formatSell));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
