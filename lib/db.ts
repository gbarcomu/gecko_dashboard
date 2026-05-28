import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

// Single shared connection reused across requests (and HMR reloads in dev).
let db: DatabaseSync | undefined = (globalThis as GlobalWithDb).__geckoDb;

interface GlobalWithDb {
  __geckoDb?: DatabaseSync;
}

function init(): DatabaseSync {
  const dbPath = resolve(
    process.cwd(),
    process.env.DATABASE_PATH ?? "data/gecko.db",
  );
  mkdirSync(dirname(dbPath), { recursive: true });

  const connection = new DatabaseSync(dbPath);
  connection.exec("PRAGMA journal_mode = WAL;");

  // Generic response cache keyed by request URL.
  connection.exec(`
    CREATE TABLE IF NOT EXISTS api_cache (
      cache_key   TEXT PRIMARY KEY,
      payload     TEXT NOT NULL,
      fetched_at  INTEGER NOT NULL
    );
  `);

  // Point-in-time price snapshots, useful for building local history.
  connection.exec(`
    CREATE TABLE IF NOT EXISTS price_snapshots (
      coin_id     TEXT NOT NULL,
      symbol      TEXT,
      price_usd   REAL,
      market_cap  REAL,
      captured_at INTEGER NOT NULL
    );
  `);
  connection.exec(`
    CREATE INDEX IF NOT EXISTS idx_snapshots_coin_time
      ON price_snapshots (coin_id, captured_at);
  `);

  return connection;
}

export function getDb(): DatabaseSync {
  if (!db) {
    db = init();
    (globalThis as GlobalWithDb).__geckoDb = db;
  }
  return db;
}

export interface CacheHit {
  payload: string;
  fetchedAt: number;
}

export function readCache(key: string): CacheHit | undefined {
  const row = getDb()
    .prepare("SELECT payload, fetched_at FROM api_cache WHERE cache_key = ?")
    .get(key) as { payload: string; fetched_at: number } | undefined;
  return row ? { payload: row.payload, fetchedAt: row.fetched_at } : undefined;
}

export function writeCache(key: string, payload: string): void {
  getDb()
    .prepare(
      `INSERT INTO api_cache (cache_key, payload, fetched_at)
       VALUES (?, ?, ?)
       ON CONFLICT(cache_key) DO UPDATE SET payload = excluded.payload, fetched_at = excluded.fetched_at`,
    )
    .run(key, payload, Date.now());
}

export interface MarketCoin {
  id: string;
  symbol: string;
  current_price: number | null;
  market_cap: number | null;
}

export function recordSnapshots(coins: MarketCoin[]): void {
  const now = Date.now();
  const stmt = getDb().prepare(
    `INSERT INTO price_snapshots (coin_id, symbol, price_usd, market_cap, captured_at)
     VALUES (?, ?, ?, ?, ?)`,
  );
  for (const c of coins) {
    stmt.run(c.id, c.symbol ?? null, c.current_price, c.market_cap, now);
  }
}
