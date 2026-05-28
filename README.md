# Crypto Market Snapshot

A slide-ready (16:9) crypto market snapshot built with **Next.js + TypeScript**,
backed by a **SQLite** cache (via Node's built-in `node:sqlite`), and powered by
the free **CoinGecko** API.

## Features

- Fixed **1280×720 (16:9)** layout that drops straight into a PowerPoint slide.
- Global stats: total market cap, BTC dominance, and the CMC20 index (30d).
- BTC and ETH 30-day charts with price + volume and a 30-day change badge.
- Top 5 30-day winners (among the top 100 by market cap), with logos.
- One-click **Download PNG** (exports at exactly 2560×1440, true 16:9).
- SQLite caches upstream responses (respecting free-tier rate limits) and stores
  point-in-time price snapshots in `data/gecko.db`.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Add your CoinGecko **Demo** (free) API key to `.env.local`:

   ```
   COINGECKO_API_KEY=your_demo_key_here
   ```

   Get a key from the [CoinGecko developer dashboard](https://www.coingecko.com/en/developers/dashboard).
   The app also works without a key against the public endpoints (lower limits).

3. Run the dev server:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000 and click **Download PNG**.

## Project layout

```
app/
  layout.tsx              Root layout + global styles
  page.tsx                The snapshot page (server-rendered)
  report.module.css       Snapshot styles (fixed 16:9 canvas)
components/
  StaticAreaChart.tsx     Recharts price + volume chart
  DownloadButton.tsx      Client-side PNG export (html-to-image)
lib/
  db.ts                   SQLite connection, cache + snapshots
  coingecko.ts            CoinGecko client with caching / stale fallback
  format.ts               Currency / percent formatters
data/gecko.db             SQLite file (git-ignored, created on first run)
```

## Notes

- The database is a single file at `data/gecko.db` — delete it to reset.
- `node:sqlite` requires Node 22+ (this project targets the installed Node 24).
