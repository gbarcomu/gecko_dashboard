import { readCache, writeCache } from "./db";

const BASE = process.env.COINGECKO_API_BASE ?? "https://api.coingecko.com/api/v3";

export class CoinGeckoError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "CoinGeckoError";
  }
}

/**
 * Fetches a CoinGecko endpoint, serving a cached copy when it is still fresh.
 * `ttlMs` keeps us comfortably inside the free tier's rate limits.
 */
export async function fetchCached<T>(
  path: string,
  params: Record<string, string | number>,
  ttlMs: number,
): Promise<{ data: T; cached: boolean; fetchedAt: number }> {
  const query = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString();
  const cacheKey = `${path}?${query}`;

  const hit = readCache(cacheKey);
  if (hit && Date.now() - hit.fetchedAt < ttlMs) {
    return { data: JSON.parse(hit.payload) as T, cached: true, fetchedAt: hit.fetchedAt };
  }

  const headers: Record<string, string> = { accept: "application/json" };
  const apiKey = process.env.COINGECKO_API_KEY;
  if (apiKey) headers["x-cg-demo-api-key"] = apiKey;

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}?${query}`, {
      headers,
      cache: "no-store",
    });
  } catch (err) {
    // Network failure: fall back to stale cache if we have any.
    if (hit) {
      return { data: JSON.parse(hit.payload) as T, cached: true, fetchedAt: hit.fetchedAt };
    }
    throw new CoinGeckoError(
      `Network error reaching CoinGecko: ${(err as Error).message}`,
      502,
    );
  }

  if (!res.ok) {
    // On rate-limit / upstream error, prefer stale data over nothing.
    if (hit) {
      return { data: JSON.parse(hit.payload) as T, cached: true, fetchedAt: hit.fetchedAt };
    }
    throw new CoinGeckoError(
      `CoinGecko responded ${res.status} ${res.statusText}`,
      res.status,
    );
  }

  const data = (await res.json()) as T;
  writeCache(cacheKey, JSON.stringify(data));
  return { data, cached: false, fetchedAt: Date.now() };
}

export interface MarketCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number | null;
  sparkline_in_7d?: { price: number[] };
}

export async function getMarkets(opts: {
  vsCurrency?: string;
  perPage?: number;
  page?: number;
}): Promise<{ data: MarketCoin[]; cached: boolean; fetchedAt: number }> {
  return fetchCached<MarketCoin[]>(
    "/coins/markets",
    {
      vs_currency: opts.vsCurrency ?? "usd",
      order: "market_cap_desc",
      per_page: opts.perPage ?? 50,
      page: opts.page ?? 1,
      sparkline: "true",
      price_change_percentage: "24h",
    },
    60_000,
  );
}

export interface Mover {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  change30d: number;
}

/**
 * Biggest 30-day gainers among the top `universe` coins by market cap.
 * (CoinGecko's dedicated /coins/top_gainers_losers endpoint is paid-only, so
 * we sort the markets list ourselves.)
 */
export async function getTop30dWinners(
  limit: number,
  universe = 250,
): Promise<{ data: Mover[]; cached: boolean; fetchedAt: number }> {
  const res = await fetchCached<
    (MarketCoin & { price_change_percentage_30d_in_currency: number | null })[]
  >(
    "/coins/markets",
    {
      vs_currency: "usd",
      order: "market_cap_desc",
      per_page: universe,
      page: 1,
      price_change_percentage: "30d",
    },
    5 * 60_000,
  );

  const data: Mover[] = res.data
    .filter((c) => c.price_change_percentage_30d_in_currency != null)
    .sort(
      (a, b) =>
        (b.price_change_percentage_30d_in_currency ?? 0) -
        (a.price_change_percentage_30d_in_currency ?? 0),
    )
    .slice(0, limit)
    .map((c) => ({
      id: c.id,
      symbol: c.symbol,
      name: c.name,
      image: c.image,
      current_price: c.current_price,
      change30d: c.price_change_percentage_30d_in_currency ?? 0,
    }));

  return { data, cached: res.cached, fetchedAt: res.fetchedAt };
}

export interface GlobalData {
  active_cryptocurrencies: number;
  markets: number;
  total_market_cap: Record<string, number>;
  total_volume: Record<string, number>;
  market_cap_percentage: Record<string, number>;
  market_cap_change_percentage_24h_usd: number;
  updated_at: number;
}

export async function getGlobal(): Promise<{
  data: GlobalData;
  cached: boolean;
  fetchedAt: number;
}> {
  const res = await fetchCached<{ data: GlobalData }>("/global", {}, 60_000);
  return { data: res.data.data, cached: res.cached, fetchedAt: res.fetchedAt };
}

export interface MarketChart {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export async function getMarketChart(
  coinId: string,
  days: number,
  vsCurrency = "usd",
): Promise<{ data: MarketChart; cached: boolean; fetchedAt: number }> {
  return fetchCached<MarketChart>(
    `/coins/${encodeURIComponent(coinId)}/market_chart`,
    { vs_currency: vsCurrency, days },
    5 * 60_000,
  );
}
