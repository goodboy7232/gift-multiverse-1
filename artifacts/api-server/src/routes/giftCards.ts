import { Router } from "express";
import { db } from "@workspace/db";
import { giftCardsTable, subcategoriesTable, categoriesTable } from "@workspace/db";
import { eq, and, desc, asc, gt, sql, inArray } from "drizzle-orm";

const router = Router();

function formatCard(gc: typeof giftCardsTable.$inferSelect & {
  subcategoryName?: string | null;
  categoryName?: string | null;
  categoryId?: number | null;
  imageUrl?: string | null;
}) {
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
    subcategoryName: gc.subcategoryName ?? null,
    categoryName: gc.categoryName ?? null,
    categoryId: gc.categoryId ?? null,
    createdAt: gc.createdAt.toISOString(),
  };
}

// GET /api/gift-cards
router.get("/gift-cards", async (req, res) => {
  try {
    const {
      categoryId,
      subcategoryId,
      search,
      sort,
      page,
      limit,
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page ?? "1"));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit ?? "20")));
    const offset = (pageNum - 1) * limitNum;

    const conditions: ReturnType<typeof eq>[] = [];
    conditions.push(eq(giftCardsTable.isActive, true));
    conditions.push(gt(giftCardsTable.stock, 0));

    if (subcategoryId) {
      conditions.push(eq(giftCardsTable.subcategoryId, parseInt(subcategoryId)));
    } else if (categoryId) {
      const subs = await db
        .select({ id: subcategoriesTable.id })
        .from(subcategoriesTable)
        .where(eq(subcategoriesTable.categoryId, parseInt(categoryId)));
      if (subs.length > 0) {
        const subIds = subs.map((s) => s.id);
        conditions.push(inArray(giftCardsTable.subcategoryId, subIds));
      }
    }

    if (search) {
      conditions.push(
        sql`(${giftCardsTable.brand} ilike ${`%${search}%`} OR ${giftCardsTable.name} ilike ${`%${search}%`})` as any
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    let orderBy = desc(giftCardsTable.createdAt);
    if (sort === "price_asc") orderBy = asc(giftCardsTable.sellPrice);
    else if (sort === "price_desc") orderBy = desc(giftCardsTable.sellPrice);
    else if (sort === "discount_desc") orderBy = desc(giftCardsTable.discountPct);

    const [items, countResult] = await Promise.all([
      db
        .select({
          id: giftCardsTable.id,
          brand: giftCardsTable.brand,
          name: giftCardsTable.name,
          denomination: giftCardsTable.denomination,
          originalPrice: giftCardsTable.originalPrice,
          sellPrice: giftCardsTable.sellPrice,
          discountPct: giftCardsTable.discountPct,
          stock: giftCardsTable.stock,
          placeholderColor: giftCardsTable.placeholderColor,
          imageUrl: giftCardsTable.imageUrl,
          isActive: giftCardsTable.isActive,
          featured: giftCardsTable.featured,
          code: giftCardsTable.code,
          subcategoryId: giftCardsTable.subcategoryId,
          subcategoryName: subcategoriesTable.name,
          categoryId: subcategoriesTable.categoryId,
          createdAt: giftCardsTable.createdAt,
        })
        .from(giftCardsTable)
        .leftJoin(subcategoriesTable, eq(giftCardsTable.subcategoryId, subcategoriesTable.id))
        .where(where)
        .orderBy(orderBy)
        .limit(limitNum)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(giftCardsTable)
        .where(where),
    ]);

    res.json({
      items: items.map(formatCard),
      total: countResult[0]?.count ?? 0,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/gift-cards/featured
router.get("/gift-cards/featured", async (_req, res) => {
  try {
    const items = await db
      .select({
        id: giftCardsTable.id,
        brand: giftCardsTable.brand,
        name: giftCardsTable.name,
        denomination: giftCardsTable.denomination,
        originalPrice: giftCardsTable.originalPrice,
        sellPrice: giftCardsTable.sellPrice,
        discountPct: giftCardsTable.discountPct,
        stock: giftCardsTable.stock,
        placeholderColor: giftCardsTable.placeholderColor,
        imageUrl: giftCardsTable.imageUrl,
        isActive: giftCardsTable.isActive,
        featured: giftCardsTable.featured,
        code: giftCardsTable.code,
        subcategoryId: giftCardsTable.subcategoryId,
        subcategoryName: subcategoriesTable.name,
        categoryId: subcategoriesTable.categoryId,
        createdAt: giftCardsTable.createdAt,
      })
      .from(giftCardsTable)
      .leftJoin(subcategoriesTable, eq(giftCardsTable.subcategoryId, subcategoriesTable.id))
      .where(and(eq(giftCardsTable.isActive, true), gt(giftCardsTable.stock, 0)))
      .orderBy(desc(giftCardsTable.discountPct))
      .limit(8);

    res.json(items.map(formatCard));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/gift-cards/:id
router.get("/gift-cards/:id", async (req, res) => {
  try {
    const id = parseInt(req.params["id"]!);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }

    const [gc] = await db
      .select({
        id: giftCardsTable.id,
        brand: giftCardsTable.brand,
        name: giftCardsTable.name,
        code: giftCardsTable.code,
        denomination: giftCardsTable.denomination,
        originalPrice: giftCardsTable.originalPrice,
        sellPrice: giftCardsTable.sellPrice,
        discountPct: giftCardsTable.discountPct,
        stock: giftCardsTable.stock,
        placeholderColor: giftCardsTable.placeholderColor,
        isActive: giftCardsTable.isActive,
        featured: giftCardsTable.featured,
        subcategoryId: giftCardsTable.subcategoryId,
        subcategoryName: subcategoriesTable.name,
        categoryId: subcategoriesTable.categoryId,
        createdAt: giftCardsTable.createdAt,
      })
      .from(giftCardsTable)
      .leftJoin(subcategoriesTable, eq(giftCardsTable.subcategoryId, subcategoriesTable.id))
      .where(eq(giftCardsTable.id, id))
      .limit(1);

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

export default router;
