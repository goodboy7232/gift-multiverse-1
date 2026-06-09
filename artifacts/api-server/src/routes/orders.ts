import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, giftCardsTable, orderProofsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import type { JwtPayload } from "../lib/auth.js";

const router = Router();

function formatOrder(o: typeof ordersTable.$inferSelect & {
  giftCardName?: string | null;
  giftCardBrand?: string | null;
  giftCardCode?: string | null;
}) {
  return {
    id: o.id,
    userId: o.userId,
    giftCardId: o.giftCardId,
    giftCardName: o.giftCardName ?? null,
    giftCardBrand: o.giftCardBrand ?? null,
    quantity: o.quantity,
    totalPrice: parseFloat(o.totalPrice),
    status: o.status,
    paymentMethod: o.paymentMethod ?? null,
    paymentRef: o.paymentRef ?? null,
    // Only expose the gift card code once admin has confirmed payment
    giftCardCode: o.status === "completed" ? (o.giftCardCode ?? null) : null,
    createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : o.createdAt,
  };
}

// POST /api/orders — creates a PENDING order; code revealed only after admin marks paid
router.post("/orders", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: JwtPayload }).user;
    const { giftCardId, quantity = 1 } = req.body as {
      giftCardId: number;
      quantity?: number;
    };

    if (!giftCardId) {
      res.status(400).json({ error: "giftCardId is required" });
      return;
    }

    const [gc] = await db
      .select()
      .from(giftCardsTable)
      .where(eq(giftCardsTable.id, giftCardId))
      .limit(1);

    if (!gc || !gc.isActive || gc.stock < 1) {
      res.status(400).json({ error: "Gift card not available" });
      return;
    }

    const qty = Math.max(1, Math.min(quantity, gc.stock));
    const totalPrice = (parseFloat(gc.sellPrice) * qty).toFixed(2);

    // Reserve stock immediately so it can't be double-sold
    await db
      .update(giftCardsTable)
      .set({ stock: gc.stock - qty })
      .where(eq(giftCardsTable.id, giftCardId));

    const [order] = await db
      .insert(ordersTable)
      .values({
        userId,
        giftCardId,
        quantity: qty,
        totalPrice,
        status: "pending",
      })
      .returning();

    res.status(201).json(formatOrder({ ...order, giftCardName: gc.name, giftCardBrand: gc.brand }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/orders
router.get("/orders", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: JwtPayload }).user;

    const orders = await db
      .select({
        id: ordersTable.id,
        userId: ordersTable.userId,
        giftCardId: ordersTable.giftCardId,
        giftCardName: giftCardsTable.name,
        giftCardBrand: giftCardsTable.brand,
        giftCardCode: giftCardsTable.code,
        quantity: ordersTable.quantity,
        totalPrice: ordersTable.totalPrice,
        status: ordersTable.status,
        paymentMethod: ordersTable.paymentMethod,
        paymentRef: ordersTable.paymentRef,
        createdAt: ordersTable.createdAt,
      })
      .from(ordersTable)
      .leftJoin(giftCardsTable, eq(ordersTable.giftCardId, giftCardsTable.id))
      .where(eq(ordersTable.userId, userId))
      .orderBy(desc(ordersTable.createdAt));

    res.json(orders.map(formatOrder));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/checkout — creates order + payment proof atomically
router.post("/checkout", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: JwtPayload }).user;
    const { giftCardId, paymentMethod, transactionId, screenshotUrl } = req.body as {
      giftCardId: number;
      paymentMethod: string;
      transactionId: string;
      screenshotUrl?: string;
    };

    if (!giftCardId || !paymentMethod || !transactionId) {
      res.status(400).json({ error: "giftCardId, paymentMethod and transactionId are required" });
      return;
    }

    const [gc] = await db
      .select()
      .from(giftCardsTable)
      .where(eq(giftCardsTable.id, giftCardId))
      .limit(1);

    if (!gc || !gc.isActive || gc.stock < 1) {
      res.status(400).json({ error: "Gift card not available" });
      return;
    }

    const qty = 1;
    const totalPrice = (parseFloat(gc.sellPrice) * qty).toFixed(2);

    // Reserve stock
    await db
      .update(giftCardsTable)
      .set({ stock: gc.stock - qty })
      .where(eq(giftCardsTable.id, giftCardId));

    // Create order
    const [order] = await db
      .insert(ordersTable)
      .values({
        userId,
        giftCardId,
        quantity: qty,
        totalPrice,
        status: "pending",
      })
      .returning();

    // Create payment proof
    const [proof] = await db
      .insert(orderProofsTable)
      .values({
        orderId: order.id,
        paymentMethod,
        transactionId,
        screenshotUrl: screenshotUrl || null,
      })
      .returning();

    res.status(201).json({
      orderId: order.id,
      proofId: proof.id,
      ...formatOrder({ ...order, giftCardName: gc.name, giftCardBrand: gc.brand }),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
