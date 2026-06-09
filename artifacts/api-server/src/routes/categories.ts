import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable, subcategoriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/categories
router.get("/categories", async (_req, res) => {
  try {
    const categories = await db.select().from(categoriesTable);
    const subcategories = await db.select().from(subcategoriesTable);

    const result = categories.map((cat) => ({
      ...cat,
      subcategories: subcategories.filter((sub) => sub.categoryId === cat.id),
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
