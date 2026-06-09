import { Router } from "express";
import { db } from "@workspace/db";
import {
  usersTable,
  ordersTable,
  giftCardsTable,
  sellRequestsTable,
  blogPostsTable,
  transactionsTable,
  subcategoriesTable,
  paymentInfoTable,
  orderProofsTable,
} from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { requireAdmin, requireAuth } from "../lib/auth.js";

const router = Router();

function formatCard(gc: typeof giftCardsTable.$inferSelect) {
  return {
    id: gc.id,
    brand: gc.brand,
    name: gc.name,
    denomination: parseFloat(gc.denomination),
    originalPrice: parseFloat(gc.originalPrice),
    sellPrice: parseFloat(gc.sellPrice),
    discountPct: gc.discountPct,
    stock: gc.stock,
    placeholderColor: gc.placeholderColor ?? null,
    imageUrl: gc.imageUrl ?? null,
    isActive: gc.isActive,
    subcategoryId: gc.subcategoryId,
    subcategoryName: null as string | null,
    categoryName: null as string | null,
    categoryId: null as number | null,
    createdAt: gc.createdAt instanceof Date ? gc.createdAt.toISOString() : String(gc.createdAt),
  };
}

function formatSell(s: typeof sellRequestsTable.$inferSelect, username?: string | null) {
  return {
    id: s.id,
    userId: s.userId,
    username: username ?? null,
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
    createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : String(s.createdAt),
  };
}

function formatOrder(o: typeof ordersTable.$inferSelect, username?: string | null, cardName?: string | null, cardBrand?: string | null) {
  return {
    id: o.id,
    userId: o.userId,
    username: username ?? null,
    giftCardId: o.giftCardId,
    giftCardName: cardName ?? null,
    giftCardBrand: cardBrand ?? null,
    quantity: o.quantity,
    totalPrice: parseFloat(o.totalPrice),
    status: o.status,
    paymentMethod: o.paymentMethod ?? null,
    paymentRef: o.paymentRef ?? null,
    createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt),
  };
}

// ─── Stats ────────────────────────────────────────────────────────────────────

router.get("/admin/stats", requireAdmin, async (_req, res) => {
  try {
    const [
      [users],
      [orders],
      [giftCards],
      [revenue],
      [pendingOrders],
      [pendingSells],
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(usersTable),
      db.select({ count: sql<number>`count(*)::int` }).from(ordersTable),
      db.select({ count: sql<number>`count(*)::int` }).from(giftCardsTable),
      db.select({ total: sql<string>`coalesce(sum(total_price), 0)` }).from(ordersTable),
      db.select({ count: sql<number>`count(*)::int` }).from(ordersTable).where(eq(ordersTable.status, "pending")),
      db.select({ count: sql<number>`count(*)::int` }).from(sellRequestsTable).where(eq(sellRequestsTable.status, "pending")),
    ]);

    res.json({
      totalUsers: users?.count ?? 0,
      totalOrders: orders?.count ?? 0,
      totalGiftCards: giftCards?.count ?? 0,
      totalRevenue: parseFloat(revenue?.total ?? "0"),
      pendingOrders: pendingOrders?.count ?? 0,
      pendingSellRequests: pendingSells?.count ?? 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Orders ───────────────────────────────────────────────────────────────────

router.get("/admin/orders", requireAdmin, async (req, res) => {
  try {
    const { status } = req.query as { status?: string };
    const orders = await db
      .select({
        id: ordersTable.id,
        userId: ordersTable.userId,
        username: usersTable.username,
        giftCardId: ordersTable.giftCardId,
        giftCardName: giftCardsTable.name,
        giftCardBrand: giftCardsTable.brand,
        quantity: ordersTable.quantity,
        totalPrice: ordersTable.totalPrice,
        status: ordersTable.status,
        paymentMethod: ordersTable.paymentMethod,
        paymentRef: ordersTable.paymentRef,
        createdAt: ordersTable.createdAt,
      })
      .from(ordersTable)
      .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
      .leftJoin(giftCardsTable, eq(ordersTable.giftCardId, giftCardsTable.id))
      .orderBy(desc(ordersTable.createdAt))
      .limit(200);

    const filtered = status ? orders.filter((o) => o.status === status) : orders;

    res.json(
      filtered.map((o) =>
        formatOrder(
          { ...o, totalPrice: o.totalPrice, quantity: o.quantity, paymentMethod: o.paymentMethod, paymentRef: o.paymentRef } as any,
          o.username,
          o.giftCardName,
          o.giftCardBrand
        )
      )
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/orders/:id/pay", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const { paymentMethod, paymentRef } = req.body as {
      paymentMethod: "bank_transfer" | "usdt";
      paymentRef: string;
    };

    if (!paymentMethod || !paymentRef) {
      res.status(400).json({ error: "paymentMethod and paymentRef are required" });
      return;
    }

    // Get the order first to find the gift card code
    const [existingOrder] = await db
      .select({
        order: ordersTable,
        giftCardCode: giftCardsTable.code,
        giftCardName: giftCardsTable.name,
        giftCardBrand: giftCardsTable.brand,
        username: usersTable.username,
      })
      .from(ordersTable)
      .leftJoin(giftCardsTable, eq(ordersTable.giftCardId, giftCardsTable.id))
      .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
      .where(eq(ordersTable.id, id))
      .limit(1);

    if (!existingOrder) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    if (existingOrder.order.status === "completed") {
      res.status(400).json({ error: "Order is already completed" });
      return;
    }

    const [order] = await db
      .update(ordersTable)
      .set({ status: "completed", paymentMethod, paymentRef })
      .where(eq(ordersTable.id, id))
      .returning();

    // Create debit transaction for user's wallet record
    await db.insert(transactionsTable).values({
      userId: order.userId,
      type: "debit",
      amount: order.totalPrice,
      description: `Purchase confirmed: ${existingOrder.giftCardBrand ?? ""} ${existingOrder.giftCardName ?? ""}`.trim(),
      ref: order.id.toString(),
    });

    res.json({
      ...formatOrder(order, existingOrder.username, existingOrder.giftCardName, existingOrder.giftCardBrand),
      giftCardCode: existingOrder.giftCardCode,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Sell Requests ────────────────────────────────────────────────────────────

router.get("/admin/sell-requests", requireAdmin, async (req, res) => {
  try {
    const { status } = req.query as { status?: string };
    const sells = await db
      .select({
        sell: sellRequestsTable,
        username: usersTable.username,
      })
      .from(sellRequestsTable)
      .leftJoin(usersTable, eq(sellRequestsTable.userId, usersTable.id))
      .orderBy(desc(sellRequestsTable.createdAt))
      .limit(200);

    const filtered = status
      ? sells.filter((s) => s.sell.status === status)
      : sells;

    res.json(filtered.map((s) => formatSell(s.sell, s.username)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/sell-requests/:id/approve", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const { approvedPayout, adminNote } = req.body as {
      approvedPayout: number;
      adminNote?: string;
    };

    // Idempotency check — only allow approving pending requests
    const [existing] = await db
      .select({ id: sellRequestsTable.id, status: sellRequestsTable.status, userId: sellRequestsTable.userId, brand: sellRequestsTable.brand })
      .from(sellRequestsTable)
      .where(eq(sellRequestsTable.id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Sell request not found" });
      return;
    }
    if (existing.status !== "pending") {
      res.status(409).json({ error: `Sell request is already ${existing.status}` });
      return;
    }

    // Atomic: update status + credit wallet + insert transaction in one DB transaction
    const payout = approvedPayout.toFixed(2);
    const client = await import("@workspace/db").then((m) => m.pool.connect());
    try {
      await client.query("BEGIN");

      await client.query(
        `UPDATE sell_requests SET status='approved', approved_payout=$1, admin_note=$2 WHERE id=$3`,
        [payout, adminNote ?? null, id]
      );

      const { rows: [bal] } = await client.query(
        `SELECT wallet_balance FROM users WHERE id=$1 FOR UPDATE`,
        [existing.userId]
      );
      const updatedBal = (parseFloat(bal.wallet_balance) + parseFloat(payout)).toFixed(2);
      await client.query(`UPDATE users SET wallet_balance=$1 WHERE id=$2`, [updatedBal, existing.userId]);
      await client.query(
        `INSERT INTO transactions (user_id, type, amount, description, ref) VALUES ($1,'credit',$2,$3,$4)`,
        [existing.userId, payout, `Sell approved: ${existing.brand}`, id.toString()]
      );

      await client.query("COMMIT");
    } catch (txErr) {
      await client.query("ROLLBACK");
      throw txErr;
    } finally {
      client.release();
    }

    const [sell] = await db.select().from(sellRequestsTable).where(eq(sellRequestsTable.id, id)).limit(1);
    res.json(formatSell(sell!));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/sell-requests/:id/reject", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const { adminNote } = req.body as { adminNote: string };

    const [sell] = await db
      .update(sellRequestsTable)
      .set({ status: "rejected", adminNote: adminNote ?? "Request rejected" })
      .where(eq(sellRequestsTable.id, id))
      .returning();

    if (!sell) {
      res.status(404).json({ error: "Sell request not found" });
      return;
    }

    res.json(formatSell(sell));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Gift Cards ───────────────────────────────────────────────────────────────

router.get("/admin/gift-cards", requireAdmin, async (_req, res) => {
  try {
    const items = await db
      .select()
      .from(giftCardsTable)
      .orderBy(desc(giftCardsTable.createdAt));

    res.json(items.map(formatCard));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/gift-cards", requireAdmin, async (req, res) => {
  try {
    const { subcategoryId, brand, name, denomination, originalPrice, sellPrice, discountPct, stock, placeholderColor, isActive, featured } =
      req.body as {
        subcategoryId: number;
        brand: string;
        name: string;
        denomination: number;
        originalPrice: number;
        sellPrice: number;
        discountPct?: number;
        stock?: number;
        placeholderColor?: string;
        isActive?: boolean;
        featured?: boolean;
      };

    const [gc] = await db
      .insert(giftCardsTable)
      .values({
        subcategoryId,
        brand,
        name,
        code: `GM-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        denomination: denomination.toString(),
        originalPrice: originalPrice.toString(),
        sellPrice: sellPrice.toString(),
        discountPct: discountPct ?? 0,
        stock: stock ?? 1,
        placeholderColor: placeholderColor ?? null,
        imageUrl: (req.body as any).imageUrl ?? null,
        isActive: isActive ?? true,
        featured: featured ?? false,
      })
      .returning();

    res.status(201).json(formatCard(gc));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/gift-cards/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const updates = req.body as Partial<{
      brand: string;
      name: string;
      denomination: number;
      originalPrice: number;
      sellPrice: number;
      discountPct: number;
      stock: number;
      placeholderColor: string;
      imageUrl: string;
      isActive: boolean;
    }>;

    const setData: Record<string, unknown> = {};
    if (updates.brand !== undefined) setData["brand"] = updates.brand;
    if (updates.name !== undefined) setData["name"] = updates.name;
    if (updates.denomination !== undefined) setData["denomination"] = updates.denomination.toString();
    if (updates.originalPrice !== undefined) setData["originalPrice"] = updates.originalPrice.toString();
    if (updates.sellPrice !== undefined) setData["sellPrice"] = updates.sellPrice.toString();
    if (updates.discountPct !== undefined) setData["discountPct"] = updates.discountPct;
    if (updates.stock !== undefined) setData["stock"] = updates.stock;
    if (updates.placeholderColor !== undefined) setData["placeholderColor"] = updates.placeholderColor;
    if (updates.imageUrl !== undefined) setData["imageUrl"] = updates.imageUrl;
    if (updates.isActive !== undefined) setData["isActive"] = updates.isActive;

    const [gc] = await db
      .update(giftCardsTable)
      .set(setData)
      .where(eq(giftCardsTable.id, id))
      .returning();

    if (!gc) {
      res.status(404).json({ error: "Gift card not found" });
      return;
    }

    res.json(formatCard(gc));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/admin/gift-cards/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    await db.delete(giftCardsTable).where(eq(giftCardsTable.id, id));
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Users ────────────────────────────────────────────────────────────────────

router.get("/admin/users", requireAdmin, async (_req, res) => {
  try {
    const users = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        role: usersTable.role,
        walletBalance: usersTable.walletBalance,
        isActive: usersTable.isActive,
        safeKeyHash: usersTable.safeKeyHash,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .orderBy(desc(usersTable.createdAt));

    res.json(
      users.map((u) => ({
        ...u,
        walletBalance: parseFloat(u.walletBalance),
        // Expose last 8 chars of hash for support verification (never plaintext)
        safeKeyHint: u.safeKeyHash ? `…${u.safeKeyHash.slice(-8)}` : null,
        createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/users/:id/toggle", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const [user] = await db
      .select({ isActive: usersTable.isActive })
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const [updated] = await db
      .update(usersTable)
      .set({ isActive: !user.isActive })
      .where(eq(usersTable.id, id))
      .returning({
        id: usersTable.id,
        username: usersTable.username,
        role: usersTable.role,
        walletBalance: usersTable.walletBalance,
        isActive: usersTable.isActive,
        createdAt: usersTable.createdAt,
      });

    res.json({
      ...updated,
      walletBalance: parseFloat(updated!.walletBalance),
      createdAt: updated!.createdAt instanceof Date ? updated!.createdAt.toISOString() : updated!.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Blog ─────────────────────────────────────────────────────────────────────

router.post("/admin/blog", requireAdmin, async (req, res) => {
  try {
    const { title, slug, content, excerpt, coverColor } = req.body as {
      title: string;
      slug: string;
      content: string;
      excerpt: string;
      coverColor?: string;
    };

    const [post] = await db
      .insert(blogPostsTable)
      .values({
        title,
        slug,
        content,
        excerpt,
        coverColor: coverColor ?? null,
        published: true,
      })
      .returning();

    res.status(201).json({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverColor: post.coverColor ?? null,
      publishedAt: post.publishedAt instanceof Date ? post.publishedAt.toISOString() : String(post.publishedAt),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/blog/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const updates = req.body as Partial<{
      title: string;
      excerpt: string;
      content: string;
      coverColor: string;
    }>;

    const setData: Record<string, unknown> = {};
    if (updates.title !== undefined) setData["title"] = updates.title;
    if (updates.excerpt !== undefined) setData["excerpt"] = updates.excerpt;
    if (updates.content !== undefined) setData["content"] = updates.content;
    if (updates.coverColor !== undefined) setData["coverColor"] = updates.coverColor;

    const [post] = await db
      .update(blogPostsTable)
      .set(setData)
      .where(eq(blogPostsTable.id, id))
      .returning();

    if (!post) {
      res.status(404).json({ error: "Blog post not found" });
      return;
    }

    res.json({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverColor: post.coverColor ?? null,
      publishedAt: post.publishedAt instanceof Date ? post.publishedAt.toISOString() : String(post.publishedAt),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/admin/blog/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    await db.delete(blogPostsTable).where(eq(blogPostsTable.id, id));
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── User Detail ─────────────────────────────────────────────────────

router.get("/admin/users/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const orders = await db
      .select({
        id: ordersTable.id,
        giftCardId: ordersTable.giftCardId,
        giftCardName: giftCardsTable.name,
        giftCardBrand: giftCardsTable.brand,
        quantity: ordersTable.quantity,
        totalPrice: ordersTable.totalPrice,
        status: ordersTable.status,
        paymentMethod: ordersTable.paymentMethod,
        paymentRef: ordersTable.paymentRef,
        createdAt: ordersTable.createdAt,
      })
      .from(ordersTable)
      .leftJoin(giftCardsTable, eq(ordersTable.giftCardId, giftCardsTable.id))
      .where(eq(ordersTable.userId, id))
      .orderBy(desc(ordersTable.createdAt));

    const walletHistory = await db
      .select()
      .from(transactionsTable)
      .where(eq(transactionsTable.userId, id))
      .orderBy(desc(transactionsTable.createdAt));

    const sellRequests = await db
      .select()
      .from(sellRequestsTable)
      .where(eq(sellRequestsTable.userId, id))
      .orderBy(desc(sellRequestsTable.createdAt));

    res.json({
      user: {
        ...user,
        walletBalance: parseFloat(user.walletBalance),
        createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
      },
      orders: orders.map((o) => ({
        ...o,
        totalPrice: parseFloat(o.totalPrice),
        createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : o.createdAt,
      })),
      walletHistory: walletHistory.map((t) => ({
        ...t,
        amount: parseFloat(t.amount),
        createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
      })),
      sellRequests: sellRequests.map((s) => ({
        ...s,
        cardFaceValue: parseFloat(s.cardFaceValue),
        askingPrice: parseFloat(s.askingPrice),
        approvedPayout: s.approvedPayout ? parseFloat(s.approvedPayout) : null,
        createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Payment Info ──────────────────────────────────────────────────────

router.get("/payment-info", async (_req, res) => {
  try {
    const [info] = await db
      .select()
      .from(paymentInfoTable)
      .where(eq(paymentInfoTable.isActive, true))
      .limit(1);
    if (!info) {
      res.json({ upiId: null, upiQrUrl: null, usdtAddress: null, usdtNetwork: "BEP20", usdtQrUrl: null });
      return;
    }
    res.json({
      id: info.id,
      upiId: info.upiId,
      upiQrUrl: info.upiQrUrl,
      usdtAddress: info.usdtAddress,
      usdtNetwork: info.usdtNetwork,
      usdtQrUrl: info.usdtQrUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/admin/payment-info", requireAdmin, async (req, res) => {
  try {
    const { upiId, upiQrUrl, usdtAddress, usdtNetwork, usdtQrUrl } = req.body as {
      upiId?: string;
      upiQrUrl?: string;
      usdtAddress?: string;
      usdtNetwork?: string;
      usdtQrUrl?: string;
    };
    const [existing] = await db.select().from(paymentInfoTable).limit(1);
    if (existing) {
      const [updated] = await db
        .update(paymentInfoTable)
        .set({
          ...(upiId !== undefined && { upiId: upiId || null }),
          ...(upiQrUrl !== undefined && { upiQrUrl: upiQrUrl || null }),
          ...(usdtAddress !== undefined && { usdtAddress: usdtAddress || null }),
          ...(usdtNetwork !== undefined && { usdtNetwork: usdtNetwork || "BEP20" }),
          ...(usdtQrUrl !== undefined && { usdtQrUrl: usdtQrUrl || null }),
          updatedAt: new Date(),
        })
        .where(eq(paymentInfoTable.id, existing.id))
        .returning();
      res.json({
        id: updated!.id,
        upiId: updated!.upiId,
        upiQrUrl: updated!.upiQrUrl,
        usdtAddress: updated!.usdtAddress,
        usdtNetwork: updated!.usdtNetwork,
        usdtQrUrl: updated!.usdtQrUrl,
      });
    } else {
      const [created] = await db
        .insert(paymentInfoTable)
        .values({
          upiId: upiId || null,
          upiQrUrl: upiQrUrl || null,
          usdtAddress: usdtAddress || null,
          usdtNetwork: usdtNetwork || "BEP20",
          usdtQrUrl: usdtQrUrl || null,
        })
        .returning();
      res.status(201).json({
        id: created!.id,
        upiId: created!.upiId,
        upiQrUrl: created!.upiQrUrl,
        usdtAddress: created!.usdtAddress,
        usdtNetwork: created!.usdtNetwork,
        usdtQrUrl: created!.usdtQrUrl,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Order Payment Proofs ───────────────────────────────────────────────────

router.post("/orders/:id/proofs", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: { userId: number } }).user;
    const orderId = parseInt(req.params["id"] as string);
    const { paymentMethod, transactionId, screenshotUrl } = req.body as {
      paymentMethod: string;
      transactionId: string;
      screenshotUrl?: string;
    };
    if (!paymentMethod || !transactionId) {
      res.status(400).json({ error: "paymentMethod and transactionId are required" });
      return;
    }
    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId))
      .limit(1);
    if (!order || order.userId !== userId) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    const [proof] = await db
      .insert(orderProofsTable)
      .values({
        orderId,
        paymentMethod,
        transactionId,
        screenshotUrl: screenshotUrl || null,
      })
      .returning();
    res.status(201).json({
      id: proof.id,
      orderId: proof.orderId,
      paymentMethod: proof.paymentMethod,
      transactionId: proof.transactionId,
      screenshotUrl: proof.screenshotUrl,
      status: proof.status,
      createdAt: proof.createdAt instanceof Date ? proof.createdAt.toISOString() : proof.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/orders/:id/proofs", requireAdmin, async (req, res) => {
  try {
    const orderId = parseInt(req.params["id"] as string);
    const proofs = await db
      .select()
      .from(orderProofsTable)
      .where(eq(orderProofsTable.orderId, orderId))
      .orderBy(desc(orderProofsTable.createdAt));
    res.json(proofs.map((p) => ({
      id: p.id,
      orderId: p.orderId,
      paymentMethod: p.paymentMethod,
      transactionId: p.transactionId,
      screenshotUrl: p.screenshotUrl,
      status: p.status,
      adminNote: p.adminNote,
      createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Approve order with proof
router.post("/admin/orders/:id/approve", requireAdmin, async (req, res) => {
  try {
    const orderId = parseInt(req.params["id"] as string);
    const { proofId, giftCardCode } = req.body as { proofId?: number; giftCardCode?: string };

    const [existingOrder] = await db
      .select({
        order: ordersTable,
        giftCardCode: giftCardsTable.code,
        giftCardName: giftCardsTable.name,
        giftCardBrand: giftCardsTable.brand,
        username: usersTable.username,
      })
      .from(ordersTable)
      .leftJoin(giftCardsTable, eq(ordersTable.giftCardId, giftCardsTable.id))
      .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
      .where(eq(ordersTable.id, orderId))
      .limit(1);

    if (!existingOrder) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    if (existingOrder.order.status === "completed") {
      res.status(400).json({ error: "Order is already completed" });
      return;
    }

    // Use admin-provided giftCardCode if given, otherwise use existing card code
    const finalCode = giftCardCode?.trim() || existingOrder.giftCardCode;

    const [order] = await db
      .update(ordersTable)
      .set({ status: "completed" })
      .where(eq(ordersTable.id, orderId))
      .returning();

    await db.insert(transactionsTable).values({
      userId: order.userId,
      type: "debit",
      amount: order.totalPrice,
      description: `Purchase confirmed: ${existingOrder.giftCardBrand ?? ""} ${existingOrder.giftCardName ?? ""}`.trim(),
      ref: order.id.toString(),
    });

    if (proofId) {
      await db
        .update(orderProofsTable)
        .set({ status: "approved" })
        .where(eq(orderProofsTable.id, proofId));
    }

    res.json({
      ...formatOrder(order, existingOrder.username, existingOrder.giftCardName, existingOrder.giftCardBrand),
      giftCardCode: finalCode,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Reject order - mark as cancelled and restore stock
router.post("/admin/orders/:id/reject", requireAdmin, async (req, res) => {
  try {
    const orderId = parseInt(req.params["id"] as string);
    const { proofId, adminNote } = req.body as { proofId?: number; adminNote?: string };

    const [existingOrder] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId))
      .limit(1);

    if (!existingOrder) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    // Restore stock
    const [gc] = await db
      .select()
      .from(giftCardsTable)
      .where(eq(giftCardsTable.id, existingOrder.giftCardId))
      .limit(1);
    if (gc) {
      await db
        .update(giftCardsTable)
        .set({ stock: gc.stock + existingOrder.quantity })
        .where(eq(giftCardsTable.id, gc.id));
    }

    // Mark order as cancelled
    await db
      .update(ordersTable)
      .set({ status: "cancelled" })
      .where(eq(ordersTable.id, orderId));

    if (proofId) {
      await db
        .update(orderProofsTable)
        .set({ status: "rejected", adminNote: adminNote || null })
        .where(eq(orderProofsTable.id, proofId));
    }

    res.json({ message: "Order rejected and stock restored" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
