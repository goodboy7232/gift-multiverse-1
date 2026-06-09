import { Router } from "express";
import { db, pool } from "@workspace/db";
import { ordersTable, sellRequestsTable, transactionsTable, usersTable, walletDepositsTable, paymentInfoTable } from "@workspace/db";
import { eq, desc, sql, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import type { JwtPayload } from "../lib/auth.js";

const router = Router();

// GET /api/dashboard/stats
router.get("/dashboard/stats", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: JwtPayload }).user;

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

    const [[orderCount], [pendingOrderCount], [completedOrderCount], [totalSells], [pendingSells]] =
      await Promise.all([
        db.select({ count: sql<number>`count(*)::int` }).from(ordersTable).where(eq(ordersTable.userId, userId)),
        db.select({ count: sql<number>`count(*)::int` }).from(ordersTable).where(and(eq(ordersTable.userId, userId), eq(ordersTable.status, "pending"))),
        db.select({ count: sql<number>`count(*)::int` }).from(ordersTable).where(and(eq(ordersTable.userId, userId), eq(ordersTable.status, "completed"))),
        db.select({ count: sql<number>`count(*)::int` }).from(sellRequestsTable).where(eq(sellRequestsTable.userId, userId)),
        db.select({ count: sql<number>`count(*)::int` }).from(sellRequestsTable).where(and(eq(sellRequestsTable.userId, userId), eq(sellRequestsTable.status, "pending"))),
      ]);

    res.json({
      totalOrders: orderCount?.count ?? 0,
      pendingOrders: pendingOrderCount?.count ?? 0,
      completedOrders: completedOrderCount?.count ?? 0,
      totalSellRequests: totalSells?.count ?? 0,
      pendingSellRequests: pendingSells?.count ?? 0,
      walletBalance: parseFloat(user?.walletBalance ?? "0"),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/wallet/transactions
router.get("/wallet/transactions", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: JwtPayload }).user;

    const txns = await db
      .select()
      .from(transactionsTable)
      .where(eq(transactionsTable.userId, userId))
      .orderBy(desc(transactionsTable.createdAt));

    res.json(
      txns.map((t) => ({
        ...t,
        amount: parseFloat(t.amount),
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/wallet/withdraw — request a withdrawal from wallet balance
router.post("/wallet/withdraw", requireAuth, async (req, res) => {
  const { userId } = (req as typeof req & { user: JwtPayload }).user;
  const { amount, bankDetails } = req.body as { amount?: number; bankDetails?: string };

  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    res.status(400).json({ message: "Invalid withdrawal amount" });
    return;
  }
  if (!bankDetails || String(bankDetails).trim().length < 5) {
    res.status(400).json({ message: "Please provide your bank / USDT wallet details" });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query<{ wallet_balance: string }>(
      "SELECT wallet_balance FROM users WHERE id=$1 FOR UPDATE",
      [userId]
    );
    const current = parseFloat(rows[0]?.wallet_balance ?? "0");
    const requested = Number(amount);
    if (requested > current) {
      await client.query("ROLLBACK");
      res.status(400).json({ message: "Insufficient wallet balance" });
      return;
    }
    const newBal = (current - requested).toFixed(2);
    await client.query("UPDATE users SET wallet_balance=$1 WHERE id=$2", [newBal, userId]);
    await client.query(
      "INSERT INTO transactions (user_id, type, amount, description, ref) VALUES ($1,$2,$3,$4,$5)",
      [userId, "debit", requested.toFixed(2), `Withdrawal request — ${bankDetails.trim()}`, "withdrawal"]
    );
    await client.query("COMMIT");
    res.json({ success: true, newBalance: parseFloat(newBal) });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
});

// POST /api/wallet/topup — submit deposit with payment proof
router.post("/wallet/topup", requireAuth, async (req, res) => {
  const { userId } = (req as typeof req & { user: JwtPayload }).user;
  const { amount, paymentMethod, transactionId, screenshotUrl } = req.body as {
    amount?: number;
    paymentMethod?: string;
    transactionId?: string;
    screenshotUrl?: string;
  };

  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    res.status(400).json({ message: "Invalid amount" });
    return;
  }
  if (!transactionId || !transactionId.trim()) {
    res.status(400).json({ message: "Transaction ID is required" });
    return;
  }

  try {
    const [deposit] = await db.insert(walletDepositsTable).values({
      userId,
      amount: amount.toFixed(2),
      paymentMethod: paymentMethod ?? "upi",
      transactionId: transactionId.trim(),
      screenshotUrl: screenshotUrl || null,
    }).returning();

    res.status(201).json({
      id: deposit.id,
      amount: parseFloat(deposit.amount),
      paymentMethod: deposit.paymentMethod,
      transactionId: deposit.transactionId,
      status: deposit.status,
      createdAt: deposit.createdAt instanceof Date ? deposit.createdAt.toISOString() : deposit.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/wallet/deposits — user sees their own deposits
router.get("/wallet/deposits", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as typeof req & { user: JwtPayload }).user;
    const deposits = await db
      .select()
      .from(walletDepositsTable)
      .where(eq(walletDepositsTable.userId, userId))
      .orderBy(desc(walletDepositsTable.createdAt));

    res.json(deposits.map((d) => ({
      id: d.id,
      amount: parseFloat(d.amount),
      paymentMethod: d.paymentMethod,
      transactionId: d.transactionId,
      screenshotUrl: d.screenshotUrl,
      status: d.status,
      adminNote: d.adminNote,
      createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : d.createdAt,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/admin/wallet-deposits — admin sees all deposits
router.get("/admin/wallet-deposits", requireAuth, async (req, res) => {
  try {
    const user = (req as typeof req & { user: JwtPayload }).user;
    if (user.role !== "admin") {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const deposits = await db
      .select({
        id: walletDepositsTable.id,
        userId: walletDepositsTable.userId,
        username: usersTable.username,
        amount: walletDepositsTable.amount,
        paymentMethod: walletDepositsTable.paymentMethod,
        transactionId: walletDepositsTable.transactionId,
        screenshotUrl: walletDepositsTable.screenshotUrl,
        status: walletDepositsTable.status,
        adminNote: walletDepositsTable.adminNote,
        createdAt: walletDepositsTable.createdAt,
      })
      .from(walletDepositsTable)
      .leftJoin(usersTable, eq(walletDepositsTable.userId, usersTable.id))
      .orderBy(desc(walletDepositsTable.createdAt));

    res.json(deposits.map((d) => ({
      ...d,
      amount: parseFloat(d.amount),
      createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : d.createdAt,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/admin/wallet-deposits/:id/approve — admin approves deposit
router.post("/admin/wallet-deposits/:id/approve", requireAuth, async (req, res) => {
  try {
    const user = (req as typeof req & { user: JwtPayload }).user;
    if (user.role !== "admin") {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    const id = parseInt(req.params["id"] as string);

    const [deposit] = await db
      .select()
      .from(walletDepositsTable)
      .where(eq(walletDepositsTable.id, id))
      .limit(1);

    if (!deposit) {
      res.status(404).json({ message: "Deposit not found" });
      return;
    }
    if (deposit.status === "approved") {
      res.status(400).json({ message: "Already approved" });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const { rows } = await client.query<{ wallet_balance: string }>(
        "SELECT wallet_balance FROM users WHERE id=$1 FOR UPDATE",
        [deposit.userId]
      );
      const current = parseFloat(rows[0]?.wallet_balance ?? "0");
      const newBal = (current + parseFloat(deposit.amount)).toFixed(2);
      await client.query("UPDATE users SET wallet_balance=$1 WHERE id=$2", [newBal, deposit.userId]);
      await client.query(
        "INSERT INTO transactions (user_id, type, amount, description, ref) VALUES ($1,$2,$3,$4,$5)",
        [deposit.userId, "credit", deposit.amount, `Wallet deposit approved`, `deposit_${id}`]
      );
      await client.query("COMMIT");
    } catch (txErr) {
      await client.query("ROLLBACK");
      throw txErr;
    } finally {
      client.release();
    }

    await db
      .update(walletDepositsTable)
      .set({ status: "approved" })
      .where(eq(walletDepositsTable.id, id));

    res.json({ success: true, message: "Deposit approved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/admin/wallet-deposits/:id/reject — admin rejects deposit
router.post("/admin/wallet-deposits/:id/reject", requireAuth, async (req, res) => {
  try {
    const user = (req as typeof req & { user: JwtPayload }).user;
    if (user.role !== "admin") {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    const id = parseInt(req.params["id"] as string);
    const { adminNote } = req.body as { adminNote?: string };

    const [deposit] = await db
      .select()
      .from(walletDepositsTable)
      .where(eq(walletDepositsTable.id, id))
      .limit(1);

    if (!deposit) {
      res.status(404).json({ message: "Deposit not found" });
      return;
    }

    await db
      .update(walletDepositsTable)
      .set({ status: "rejected", adminNote: adminNote || "Deposit rejected" })
      .where(eq(walletDepositsTable.id, id));

    res.json({ success: true, message: "Deposit rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
