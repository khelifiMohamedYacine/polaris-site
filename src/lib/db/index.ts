import "server-only";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { initDatabase } from "./schema";

type Row = Record<string, unknown>;

interface Driver {
  query(text: string, params?: unknown[]): Promise<{ rows: Row[] }>;
  exec(sql: string): Promise<unknown>;
}

// Cached on globalThis so dev hot-reloads reuse one connection pool / embedded instance.
const globalForDb = globalThis as unknown as { __polarisDb?: Promise<Driver> };

/**
 * PostgreSQL via DATABASE_URL (production on Render). Without it, falls back
 * to an embedded PostgreSQL (PGlite) stored in ./.data — handy for local
 * development, nothing to install.
 */
async function connect(): Promise<Driver> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 5 });
    return {
      query: (text, params) => pool.query(text, params),
      exec: (sql) => pool.query(sql),
    };
  }

  if (process.env.NODE_ENV === "production") {
    console.warn(
      "DATABASE_URL is not set: using the embedded local database. Data will be lost on redeploy.",
    );
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const dataDir = process.env.PGLITE_DATA_DIR || path.join(process.cwd(), ".data", "pglite");
  mkdirSync(dataDir, { recursive: true });
  const db = new PGlite(dataDir);
  return {
    query: (text, params) => db.query<Row>(text, params),
    exec: (sql) => db.exec(sql),
  };
}

function getDb(): Promise<Driver> {
  // Never touch the database while `next build` runs (many parallel workers).
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return Promise.reject(new Error("Database is not available during the build."));
  }
  globalForDb.__polarisDb ??= connect()
    .then(async (driver) => {
      await initDatabase(driver);
      return driver;
    })
    .catch((err) => {
      globalForDb.__polarisDb = undefined; // retry on the next request
      throw err;
    });
  return globalForDb.__polarisDb;
}

/** Timestamps come back as Date objects; pages and client components expect ISO strings. */
function normalizeRow(row: Row): Row {
  const out: Row = {};
  for (const [key, value] of Object.entries(row)) {
    out[key] = value instanceof Date ? value.toISOString() : value;
  }
  return out;
}

export async function query<T = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  const db = await getDb();
  const { rows } = await db.query(text, params);
  return rows.map(normalizeRow) as T[];
}

export async function queryOne<T = Row>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
