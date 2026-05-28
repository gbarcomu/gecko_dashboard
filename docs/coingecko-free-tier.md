# CoinGecko Free (Demo) API — Functionality Reference

A reference of everything the **CoinGecko Demo (free) plan** can do, verified by
probing the live API with a Demo key on **2026-05-28**. Each endpoint below
returned `200` on the Demo plan unless listed under "Not available".

- **Base URL:** `https://api.coingecko.com/api/v3`
- **Auth:** send your Demo key as the header `x-cg-demo-api-key: <KEY>`
  (or the query param `x_cg_demo_api_key=<KEY>`). Most endpoints also work
  key-less at a lower rate limit.
- **Rate limit:** ~30 requests/min, **10,000 calls/month** on the Demo plan.
- **Pro plans** use a different host (`https://pro-api.coingecko.com/api/v3`)
  and the `x-cg-pro-api-key` header.
- **Attribution:** CoinGecko requires visible attribution when displaying data.

> All `GET`. Path params in `{braces}`. "≤365d" means the Demo plan only
> serves the **last 365 days** of historical data (older ranges return error
> `10012`).

---

## Status

| Endpoint | Description |
|---|---|
| `/ping` | Check API server status. |

## Simple (lightweight prices)

| Endpoint | Description |
|---|---|
| `/simple/price` | Current price of one or more coins by id, in any vs-currency; can include market cap, 24h vol, 24h change, last-updated. |
| `/simple/token_price/{id}` | Current price of tokens on a given asset platform, by contract address. |
| `/simple/supported_vs_currencies` | List of all supported fiat/crypto quote currencies. |

## Coins

| Endpoint | Description |
|---|---|
| `/coins/list` | All supported coins: `id`, `symbol`, `name` (optionally with platform contract addresses). |
| `/coins/markets` | Market data for coins: price, market cap, rank, volume, 24h change, sparkline. Supports `category` filter, pagination, ordering. |
| `/coins/{id}` | Full metadata for a coin: description, links, market data, community/developer stats, tickers. |
| `/coins/{id}/tickers` | Trading pairs (tickers) for a coin across exchanges. |
| `/coins/{id}/history` | Snapshot of a coin's data on a specific date (`dd-mm-yyyy`). **≤365d.** |
| `/coins/{id}/market_chart` | Historical price / market cap / volume series for the last *N* `days`. |
| `/coins/{id}/market_chart/range` | Same series for an explicit `from`/`to` UNIX range. **≤365d.** |
| `/coins/{id}/ohlc` | OHLC candles for the last *N* `days`. |

## Contract (token by address)

| Endpoint | Description |
|---|---|
| `/coins/{id}/contract/{address}` | Coin metadata looked up by platform + contract address. |
| `/coins/{id}/contract/{address}/market_chart` | Historical series for a token by contract address. |
| `/coins/{id}/contract/{address}/market_chart/range` | Same, for a `from`/`to` range. **≤365d.** |

## Asset Platforms

| Endpoint | Description |
|---|---|
| `/asset_platforms` | All supported blockchains / asset platforms (and their ids for contract lookups). |

## Categories

| Endpoint | Description |
|---|---|
| `/coins/categories/list` | All category ids + names (~800+). Used as the `category` filter on `/coins/markets`. |
| `/coins/categories` | Categories enriched with market cap, 24h volume/change, and top coins. |

## Exchanges

| Endpoint | Description |
|---|---|
| `/exchanges` | Active exchanges with trust score, volume, etc. (paginated). |
| `/exchanges/list` | All exchange `id` + `name` pairs. |
| `/exchanges/{id}` | Exchange detail: volume, year established, URL, status. |
| `/exchanges/{id}/tickers` | Trading pairs listed on an exchange. |
| `/exchanges/{id}/volume_chart` | Exchange's BTC-denominated volume over the last *N* `days`. |

## Derivatives

| Endpoint | Description |
|---|---|
| `/derivatives` | All derivative tickers. |
| `/derivatives/exchanges` | Derivatives exchanges with open interest / volume. |
| `/derivatives/exchanges/{id}` | A derivatives exchange's detail + tickers. |
| `/derivatives/exchanges/list` | All derivatives exchange `id` + `name`. |

## NFTs

| Endpoint | Description |
|---|---|
| `/nfts/list` | Supported NFT collections (ids). |
| `/nfts/{id}` | NFT collection detail: floor price, market cap, volume, links. |
| `/nfts/{id}/contract/{address}` | NFT collection detail by contract address. |

## Exchange Rates

| Endpoint | Description |
|---|---|
| `/exchange_rates` | BTC-to-currency exchange rates for fiat, commodities, and crypto. |

## Search

| Endpoint | Description |
|---|---|
| `/search` | Search coins, categories, exchanges, and NFTs by query string. |
| `/search/trending` | Trending coins, NFTs, and categories (last 24h). |

## Global

| Endpoint | Description |
|---|---|
| `/global` | Global crypto stats: total market cap, volume, BTC dominance, active coins. |
| `/global/decentralized_finance_defi` | Global DeFi market cap, DeFi/ETH ratio, top DeFi coin dominance. |

## Companies

| Endpoint | Description |
|---|---|
| `/companies/public_treasury/{coin_id}` | Public companies holding `bitcoin` or `ethereum` in treasury. |

## Token Lists

| Endpoint | Description |
|---|---|
| `/token_lists/{asset_platform_id}/all.json` | Full token list (Uniswap-style) for an asset platform. |

---

## On-Chain DEX Data (powered by GeckoTerminal)

The `/onchain/*` namespace is available on the Demo plan and covers decentralized
exchanges across many networks.

| Endpoint | Description |
|---|---|
| `/onchain/networks` | Supported on-chain networks. |
| `/onchain/networks/{network}/dexes` | DEXes available on a network. |
| `/onchain/networks/trending_pools` | Trending pools across all networks. |
| `/onchain/networks/{network}/trending_pools` | Trending pools on one network. |
| `/onchain/networks/{network}/pools` | Top pools on a network. |
| `/onchain/networks/{network}/dexes/{dex}/pools` | Top pools for a specific DEX. |
| `/onchain/networks/{network}/new_pools` | Newest pools on a network. |
| `/onchain/networks/new_pools` | Newest pools across all networks. |
| `/onchain/search/pools` | Search pools by query. |
| `/onchain/networks/{network}/pools/{address}` | Pool detail by address. |
| `/onchain/networks/{network}/pools/multi/{addresses}` | Multiple pools in one call. |
| `/onchain/networks/{network}/pools/{address}/info` | Pool token metadata. |
| `/onchain/networks/{network}/pools/{pool}/ohlcv/{timeframe}` | Pool OHLCV candles (`day`/`hour`/`minute`). |
| `/onchain/networks/{network}/pools/{pool}/trades` | Recent trades for a pool. |
| `/onchain/simple/networks/{network}/token_price/{addresses}` | Quick token prices by address. |
| `/onchain/networks/{network}/tokens/{address}` | Token data (price, volume, market cap). |
| `/onchain/networks/{network}/tokens/multi/{addresses}` | Multiple tokens in one call. |
| `/onchain/networks/{network}/tokens/{address}/info` | Token metadata (name, image, socials). |
| `/onchain/networks/{network}/tokens/{address}/pools` | Top pools containing a token. |
| `/onchain/tokens/info_recently_updated` | Recently updated token metadata across networks. |

---

## Not available on the Demo plan (paid only)

These returned `401` with a "paid plan required" message:

| Endpoint | Notes |
|---|---|
| `/coins/top_gainers_losers` | Top movers. |
| `/coins/list/new` | Recently listed coins. |
| `/coins/{id}/circulating_supply_chart` | Circulating-supply history. |
| `/coins/{id}/total_supply_chart` | Total-supply history. |
| `/global/market_cap_chart` | Historical global market cap. |
| `/nfts/markets` | NFT market list with data. |
| `/nfts/{id}/market_chart` | NFT historical floor/volume. |
| `/exchanges/{id}/volume_chart/range` | Exchange volume for an explicit range. |
| `/onchain/categories` | On-chain token categories. |
| `/onchain/pools/megafilter` | Advanced pool filtering. |
| `/onchain/networks/{network}/tokens/{address}/holders_chart` | Token holders over time. |
| `/onchain/networks/{network}/tokens/{address}/top_holders` | Token top holders. |

**Also note:** historical endpoints (`/history`, `/market_chart/range`) work on
Demo but only for the **last 365 days** — older ranges return error `10012`,
not because the endpoint is blocked but because the data window is capped.

---

## Common error codes

| HTTP / code | Meaning |
|---|---|
| `401` + `10002` | Missing/invalid API key. |
| `401` + `10005` | Endpoint requires a paid plan. |
| `401` + `10012` | Requested historical range exceeds the 365-day Demo limit. |
| `429` | Rate limit exceeded (slow down / cache responses). |
| `10010` | Demo key used against the Pro host (or vice versa). |

> Verified against the live Demo API on 2026-05-28. CoinGecko occasionally
> moves endpoints between tiers — re-probe if something stops matching.
