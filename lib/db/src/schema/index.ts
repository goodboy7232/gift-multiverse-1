import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "completed",
  "cancelled",
]);
export const sellStatusEnum = pgEnum("sell_status", [
  "pending",
  "approved",
  "rejected",
]);
export const transactionTypeEnum = pgEnum("transaction_type", [
  "credit",
  "debit",
]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  safeKeyHash: text("safe_key_hash").notNull(),
  role: roleEnum("role").notNull().default("user"),
  walletBalance: numeric("wallet_balance", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  iconUrl: text("icon_url"),
});

export type Category = typeof categoriesTable.$inferSelect;

export const subcategoriesTable = pgTable("subcategories", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categoriesTable.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export type Subcategory = typeof subcategoriesTable.$inferSelect;

export const giftCardsTable = pgTable("gift_cards", {
  id: serial("id").primaryKey(),
  subcategoryId: integer("subcategory_id")
    .notNull()
    .references(() => subcategoriesTable.id),
  brand: text("brand").notNull(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  denomination: numeric("denomination", { precision: 10, scale: 2 }).notNull(),
  originalPrice: numeric("original_price", { precision: 10, scale: 2 }).notNull(),
  sellPrice: numeric("sell_price", { precision: 10, scale: 2 }).notNull(),
  discountPct: integer("discount_pct").notNull().default(0),
  stock: integer("stock").notNull().default(1),
  placeholderColor: text("placeholder_color"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type GiftCard = typeof giftCardsTable.$inferSelect;

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id),
  giftCardId: integer("gift_card_id")
    .notNull()
    .references(() => giftCardsTable.id),
  quantity: integer("quantity").notNull().default(1),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").notNull().default("completed"),
  paymentMethod: text("payment_method"),
  paymentRef: text("payment_ref"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Order = typeof ordersTable.$inferSelect;

export const sellRequestsTable = pgTable("sell_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id),
  brand: text("brand").notNull(),
  websiteUrl: text("website_url").notNull(),
  cardFaceValue: numeric("card_face_value", { precision: 10, scale: 2 }).notNull(),
  askingPrice: numeric("asking_price", { precision: 10, scale: 2 }).notNull(),
  voucherCode: text("voucher_code").notNull(),
  cardType: text("card_type").notNull().default("digital"),
  extraDetails: text("extra_details"),
  status: sellStatusEnum("status").notNull().default("pending"),
  approvedPayout: numeric("approved_payout", { precision: 10, scale: 2 }),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SellRequest = typeof sellRequestsTable.$inferSelect;

export const transactionsTable = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id),
  type: transactionTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  ref: text("ref"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Transaction = typeof transactionsTable.$inferSelect;

// ─── Wallet Deposits (user deposits with payment proof) ───────────────────────
export const walletDepositStatusEnum = pgEnum("wallet_deposit_status", [
  "pending",
  "approved",
  "rejected",
]);

export const walletDepositsTable = pgTable("wallet_deposits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(), // "upi" | "usdt"
  transactionId: text("transaction_id").notNull(),
  screenshotUrl: text("screenshot_url"),
  status: walletDepositStatusEnum("status").notNull().default("pending"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type WalletDeposit = typeof walletDepositsTable.$inferSelect;

export const blogPostsTable = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  coverColor: text("cover_color"),
  published: boolean("published").notNull().default(true),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
});

export type BlogPost = typeof blogPostsTable.$inferSelect;

// ─── Payment Info (admin configurable) ──────────────────────────────────────
export const paymentInfoTable = pgTable("payment_info", {
  id: serial("id").primaryKey(),
  upiId: text("upi_id"),
  upiQrUrl: text("upi_qr_url"),
  usdtAddress: text("usdt_address"),
  usdtNetwork: text("usdt_network").default("BEP20"),
  usdtQrUrl: text("usdt_qr_url"),
  isActive: boolean("is_active").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type PaymentInfo = typeof paymentInfoTable.$inferSelect;

// ─── Order Payment Proofs (user uploads after payment) ────────────────────────
export const paymentProofStatusEnum = pgEnum("payment_proof_status", [
  "pending",
  "approved",
  "rejected",
]);

export const orderProofsTable = pgTable("order_proofs", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => ordersTable.id),
  paymentMethod: text("payment_method").notNull(), // "upi" | "usdt"
  transactionId: text("transaction_id").notNull(), // UPI ref or TX hash
  screenshotUrl: text("screenshot_url"),
  status: paymentProofStatusEnum("status").notNull().default("pending"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type OrderProof = typeof orderProofsTable.$inferSelect;
