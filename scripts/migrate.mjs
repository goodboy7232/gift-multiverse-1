import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  console.log("Running migration...");

  await client.query("BEGIN");
  try {
    // ── Drop tables in dependency order ──────────────────────────────────
    await client.query(`DROP TABLE IF EXISTS orders CASCADE`);
    await client.query(`DROP TABLE IF EXISTS sell_requests CASCADE`);
    await client.query(`DROP TABLE IF EXISTS gift_cards CASCADE`);
    await client.query(`DROP TABLE IF EXISTS blog_posts CASCADE`);
    await client.query(`DROP TABLE IF EXISTS transactions CASCADE`);
    await client.query(`DROP TABLE IF EXISTS subcategories CASCADE`);
    await client.query(`DROP TABLE IF EXISTS categories CASCADE`);
    await client.query(`DROP TABLE IF EXISTS users CASCADE`);

    // ── Drop enums (ignore if not exist) ─────────────────────────────────
    await client.query(`DROP TYPE IF EXISTS role CASCADE`);
    await client.query(`DROP TYPE IF EXISTS order_status CASCADE`);
    await client.query(`DROP TYPE IF EXISTS sell_status CASCADE`);
    await client.query(`DROP TYPE IF EXISTS transaction_type CASCADE`);

    // ── Recreate enums ────────────────────────────────────────────────────
    await client.query(`CREATE TYPE role AS ENUM ('user', 'admin')`);
    await client.query(`CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed', 'cancelled')`);
    await client.query(`CREATE TYPE sell_status AS ENUM ('pending', 'approved', 'rejected')`);
    await client.query(`CREATE TYPE transaction_type AS ENUM ('credit', 'debit')`);

    // ── users ─────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        safe_key_hash TEXT NOT NULL,
        role role NOT NULL DEFAULT 'user',
        wallet_balance NUMERIC(10,2) NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // ── categories ────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        icon_url TEXT
      )
    `);

    // ── subcategories ─────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE subcategories (
        id SERIAL PRIMARY KEY,
        category_id INTEGER NOT NULL REFERENCES categories(id),
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE
      )
    `);

    // ── gift_cards ────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE gift_cards (
        id SERIAL PRIMARY KEY,
        subcategory_id INTEGER NOT NULL REFERENCES subcategories(id),
        brand TEXT NOT NULL,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        denomination NUMERIC(10,2) NOT NULL,
        original_price NUMERIC(10,2) NOT NULL,
        sell_price NUMERIC(10,2) NOT NULL,
        discount_pct INTEGER NOT NULL DEFAULT 0,
        stock INTEGER NOT NULL DEFAULT 1,
        placeholder_color TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        featured BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // ── orders ────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        gift_card_id INTEGER NOT NULL REFERENCES gift_cards(id),
        quantity INTEGER NOT NULL DEFAULT 1,
        total_price NUMERIC(10,2) NOT NULL,
        status order_status NOT NULL DEFAULT 'completed',
        payment_method TEXT,
        payment_ref TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // ── sell_requests ─────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE sell_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        brand TEXT NOT NULL,
        website_url TEXT NOT NULL,
        card_face_value NUMERIC(10,2) NOT NULL,
        asking_price NUMERIC(10,2) NOT NULL,
        voucher_code TEXT NOT NULL,
        card_type TEXT NOT NULL DEFAULT 'digital',
        extra_details TEXT,
        status sell_status NOT NULL DEFAULT 'pending',
        approved_payout NUMERIC(10,2),
        admin_note TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // ── transactions ──────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        type transaction_type NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        description TEXT NOT NULL,
        ref TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // ── blog_posts ────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE blog_posts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        content TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        cover_color TEXT,
        published BOOLEAN NOT NULL DEFAULT true,
        published_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await client.query("COMMIT");
    console.log("Migration complete — all tables recreated with new schema.");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
