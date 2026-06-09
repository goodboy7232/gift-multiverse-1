---
name: Gift Multiverse DB migration
description: How to migrate the DB schema when drizzle-kit push is unavailable (no TTY)
---

## Rule
When drizzle-kit push fails with "Interactive prompts require a TTY terminal", write a raw SQL migration script (scripts/migrate.mjs) that drops tables in FK-safe order, drops/recreates enums, and recreates all tables from scratch. Then run the seed script afterward.

**Why:** The Replit agent shell is non-interactive; drizzle-kit push tries to prompt the user about column renames/drops but cannot, so it errors out. A raw pg migration script bypasses this.

**How to apply:** Run `node scripts/migrate.mjs && node scripts/seed.mjs` whenever the schema changes significantly (column renames, new types). The migrate script is idempotent as long as the seed script uses `ON CONFLICT DO NOTHING` or similar.

## JWT_SECRET
Was not set initially. Set it as a shared env var via `setEnvVars({ values: { JWT_SECRET: crypto.randomBytes(32).toString('hex') } })`. The API server throws on startup if missing.

## inArray bug
`sql\`col = ANY(${array})\`` does NOT work with plain JS arrays in drizzle-orm — use `inArray(col, array)` from drizzle-orm instead.

## Featured cards
The `/api/gift-cards/featured` endpoint was filtering on `featured=true` but the seed set no cards as featured. Changed to return top 8 by `discount_pct` DESC with `is_active=true AND stock>0`.
