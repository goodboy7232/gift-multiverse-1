import { Router } from "express";
import { db } from "@workspace/db";
import { blogPostsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

function formatPost(p: typeof blogPostsTable.$inferSelect) {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    content: p.content,
    coverColor: p.coverColor ?? null,
    publishedAt: p.publishedAt instanceof Date ? p.publishedAt.toISOString() : p.publishedAt,
  };
}

// GET /api/blog
router.get("/blog", async (req, res) => {
  try {
    const { limit } = req.query as { limit?: string };
    const limitNum = Math.min(50, Math.max(1, parseInt(limit ?? "20")));

    const posts = await db
      .select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.published, true))
      .orderBy(desc(blogPostsTable.publishedAt))
      .limit(limitNum);

    res.json(posts.map(formatPost));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/blog/:slug
router.get("/blog/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const [post] = await db
      .select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.slug, slug!))
      .limit(1);

    if (!post) {
      res.status(404).json({ error: "Blog post not found" });
      return;
    }

    res.json(formatPost(post));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
