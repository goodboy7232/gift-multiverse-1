import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function columnExists(table, column) {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`
      SELECT 1 FROM information_schema.columns
      WHERE table_name = $1 AND column_name = $2
    `, [table, column]);
    return rows.length > 0;
  } finally {
    client.release();
  }
}

async function tableExists(table) {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`
      SELECT 1 FROM information_schema.tables
      WHERE table_name = $1
    `, [table]);
    return rows.length > 0;
  } finally {
    client.release();
  }
}

async function typeExists(type) {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`
      SELECT 1 FROM pg_type WHERE typname = $1
    `, [type]);
    return rows.length > 0;
  } finally {
    client.release();
  }
}

async function migrate() {
  const client = await pool.connect();
  console.log("Running safe migration...");
  await client.query("BEGIN");
  try {
    // ── Add image_url to gift_cards if missing ──
    if (!(await columnExists("gift_cards", "image_url"))) {
      await client.query(`ALTER TABLE gift_cards ADD COLUMN image_url TEXT`);
      console.log("Added image_url to gift_cards");
    } else {
      console.log("image_url already exists in gift_cards");
    }

    // ── Create payment_info table if missing ──
    if (!(await tableExists("payment_info"))) {
      await client.query(`
        CREATE TABLE payment_info (
          id SERIAL PRIMARY KEY,
          upi_id TEXT,
          upi_qr_url TEXT,
          usdt_address TEXT,
          usdt_network TEXT DEFAULT 'BEP20',
          usdt_qr_url TEXT,
          is_active BOOLEAN NOT NULL DEFAULT true,
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      console.log("Created payment_info table");
    } else {
      console.log("payment_info table already exists");
    }

    // ── Create payment_proof_status enum if missing ──
    if (!(await typeExists("payment_proof_status"))) {
      await client.query(`CREATE TYPE payment_proof_status AS ENUM ('pending', 'approved', 'rejected')`);
      console.log("Created payment_proof_status enum");
    } else {
      console.log("payment_proof_status enum already exists");
    }

    // ── Create order_proofs table if missing ──
    if (!(await tableExists("order_proofs"))) {
      await client.query(`
        CREATE TABLE order_proofs (
          id SERIAL PRIMARY KEY,
          order_id INTEGER NOT NULL REFERENCES orders(id),
          payment_method TEXT NOT NULL,
          transaction_id TEXT NOT NULL,
          screenshot_url TEXT,
          status payment_proof_status NOT NULL DEFAULT 'pending',
          admin_note TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      console.log("Created order_proofs table");
    } else {
      console.log("order_proofs table already exists");
    }

    // ── Create wallet_deposit_status enum if missing ──
    if (!(await typeExists("wallet_deposit_status"))) {
      await client.query(`CREATE TYPE wallet_deposit_status AS ENUM ('pending', 'approved', 'rejected')`);
      console.log("Created wallet_deposit_status enum");
    } else {
      console.log("wallet_deposit_status enum already exists");
    }

    // ── Create wallet_deposits table if missing ──
    if (!(await tableExists("wallet_deposits"))) {
      await client.query(`
        CREATE TABLE wallet_deposits (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          amount NUMERIC(10,2) NOT NULL,
          payment_method TEXT NOT NULL,
          transaction_id TEXT NOT NULL,
          screenshot_url TEXT,
          status wallet_deposit_status NOT NULL DEFAULT 'pending',
          admin_note TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      console.log("Created wallet_deposits table");
    } else {
      console.log("wallet_deposits table already exists");
    }

    // ── Update orders default status to 'pending' if still 'completed' ──
    const { rows: orderCols } = await client.query(`
      SELECT column_default FROM information_schema.columns
      WHERE table_name = 'orders' AND column_name = 'status'
    `);
    if (orderCols.length > 0 && String(orderCols[0]?.column_default).includes("completed")) {
      await client.query(`ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending'`);
      console.log("Updated orders status default to 'pending'");
    }

    await client.query("COMMIT");
    console.log("Safe migration complete — all existing data preserved.");
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
