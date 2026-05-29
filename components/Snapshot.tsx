import {
  getGlobal,
  getMarketChart,
  getTopWinners,
  getExchangeVolumeChart,
  type ChangePeriod,
} from "@/lib/coingecko";
import { formatCompact, formatPrice } from "@/lib/format";
import StaticAreaChart, { type ChartPoint } from "@/components/StaticAreaChart";
import StaticVolumeChart from "@/components/StaticVolumeChart";
import DownloadButton from "@/components/DownloadButton";
import styles from "./snapshot.module.css";

const CMC20_LOGO =
  "https://coin-images.coingecko.com/coins/images/71188/large/cmc20.png?1766223823";

export interface ExchangeOpt {
  id: string;
  name: string;
  logo: string;
}

const COINS = {
  bitcoin: {
    name: "Bitcoin",
    symbol: "BTC",
    color: "#f7931a",
    image: "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png",
  },
  ethereum: {
    name: "Ethereum",
    symbol: "ETH",
    color: "#627eea",
    image: "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png",
  },
} as const;

const CMC20_ID = "coinmarketcap-20-index-dtf";
const WINNERS_COUNT = 5;
const WINNERS_UNIVERSE = 100;

async function toDataUri(url: string): Promise<string> {
  try {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return url;
    const buf = Buffer.from(await res.arrayBuffer());
    const type = res.headers.get("content-type") ?? "image/png";
    return `data:${type};base64,${buf.toString("base64")}`;
  } catch {
    return url;
  }
}

async function loadCoin(id: keyof typeof COINS, days: number) {
  const [{ data }, image] = await Promise.all([
    getMarketChart(id, days),
    toDataUri(COINS[id].image),
  ]);
  const points: ChartPoint[] = data.prices.map(([t, price], i) => ({
    t,
    price,
    volume: data.total_volumes[i]?.[1] ?? 0,
  }));
  const first = points[0]?.price ?? 0;
  const last = points[points.length - 1]?.price ?? 0;
  const changePct = first ? ((last - first) / first) * 100 : 0;
  return { meta: { ...COINS[id], image }, points, current: last, changePct };
}

async function loadIndexValue(id: string, days: number) {
  const { data } = await getMarketChart(id, days);
  const prices = data.prices;
  const first = prices[0]?.[1] ?? 0;
  const last = prices[prices.length - 1]?.[1] ?? 0;
  const changePct = first ? ((last - first) / first) * 100 : 0;
  return { current: last, changePct };
}

// Convert daily BTC exchange volume to USD (× BTC price that day) and sum into
// 7-day buckets for a weekly bar chart.
function toWeeklyUsd(
  daily: { t: number; value: number }[],
  btcPoints: ChartPoint[],
  fallbackPrice: number,
): { label: string; value: number }[] {
  const dayKey = (t: number) => new Date(t).toISOString().slice(0, 10);
  const priceByDay = new Map<string, number>();
  for (const p of btcPoints) priceByDay.set(dayKey(p.t), p.price);

  const sorted = [...daily].sort((a, b) => a.t - b.t);
  if (sorted.length === 0) return [];
  const start = sorted[0].t;
  const week = 7 * 86_400_000;
  const buckets = new Map<number, { t: number; sum: number }>();
  for (const d of sorted) {
    const usd = d.value * (priceByDay.get(dayKey(d.t)) ?? fallbackPrice);
    const wk = Math.floor((d.t - start) / week);
    const b = buckets.get(wk) ?? { t: start + wk * week, sum: 0 };
    b.sum += usd;
    buckets.set(wk, b);
  }
  return [...buckets.values()]
    .sort((a, b) => a.t - b.t)
    .map((b) => ({
      label: new Date(b.t).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      value: b.sum,
    }));
}

function ChangeBadge({ pct, periodShort }: { pct: number; periodShort: string }) {
  const up = pct >= 0;
  return (
    <span className={`${styles.badge} ${up ? styles.badgePos : styles.badgeNeg}`}>
      {up ? "▲" : "▼"} {up ? "+" : ""}
      {pct.toFixed(2)}% · {periodShort}
    </span>
  );
}

export default async function Snapshot({
  days,
  period,
  periodLabel,
  exchange,
}: {
  days: number;
  period: ChangePeriod;
  periodLabel: string; // e.g. "30-Day" / "1-Year"
  exchange?: ExchangeOpt; // when set, show compact stats + this exchange's volume
}) {
  const [global, btc, eth, cmc20, winnersRes, cgLogo, claudeLogo] =
    await Promise.all([
      getGlobal(),
      loadCoin("bitcoin", days),
      loadCoin("ethereum", days),
      loadIndexValue(CMC20_ID, days),
      getTopWinners(period, WINNERS_COUNT, WINNERS_UNIVERSE),
      toDataUri("https://www.coingecko.com/favicon-96x96.png"),
      toDataUri("https://claude.ai/images/claude_app_icon.png"),
    ]);

  const winners = await Promise.all(
    winnersRes.data.map(async (w) => ({ ...w, image: await toDataUri(w.image) })),
  );

  // Compact-top extras (only when an exchange is supplied).
  const ex = exchange
    ? await (async () => {
        const [vol, cmc20Logo, exLogo] = await Promise.all([
          getExchangeVolumeChart(exchange.id, days),
          toDataUri(CMC20_LOGO),
          toDataUri(exchange.logo),
        ]);
        const points = toWeeklyUsd(vol.data, btc.points, btc.current);
        return { points, cmc20Logo, exLogo };
      })()
    : null;

  const g = global.data;
  const asOf = new Date().toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const coins = [btc, eth];

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <DownloadButton
          targetId="report-capture"
          fileName={
            exchange
              ? `crypto-${exchange.id}-snapshot.png`
              : `crypto-market-snapshot-${period}.png`
          }
        />
      </div>

      <div className={styles.inner} id="report-capture">
        {ex && exchange ? (
          <div className={styles.compactTop}>
            <div className={styles.compactStats}>
              <div className={styles.compactRow}>
                <span className={styles.compactLabel}>Total Market Cap</span>
                <span className={styles.compactValue}>
                  {formatCompact(g.total_market_cap.usd, "usd")}
                </span>
              </div>
              <div className={styles.compactRow}>
                <span className={styles.compactLabel}>BTC Dominance</span>
                <span className={styles.compactValue}>
                  {g.market_cap_percentage.btc?.toFixed(1)}%
                  <small>ETH {g.market_cap_percentage.eth?.toFixed(1)}%</small>
                </span>
              </div>
              <div className={styles.compactRow}>
                <span className={styles.compactLabel}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ex.cmc20Logo} alt="CMC20" width={18} height={18} />
                  CMC20 Index
                </span>
                <span className={styles.compactValue}>
                  {formatPrice(cmc20.current)}
                  <small className={cmc20.changePct >= 0 ? styles.pos : styles.neg}>
                    {cmc20.changePct >= 0 ? "+" : ""}
                    {cmc20.changePct.toFixed(1)}% {period}
                  </small>
                </span>
              </div>
            </div>

            <div className={styles.exCard}>
              <div className={styles.exHead}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ex.exLogo} alt={exchange.name} width={20} height={20} />
                <span>{exchange.name}</span>
                <span className={styles.exSub}>· weekly volume (USD)</span>
              </div>
              <div className={styles.exFill}>
                <StaticVolumeChart points={ex.points} color="#2563eb" />
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Total Market Cap</div>
              <div className={styles.statValue}>
                {formatCompact(g.total_market_cap.usd, "usd")}
              </div>
            </div>

            <div className={styles.stat}>
              <div className={styles.statLabel}>BTC Dominance</div>
              <div className={styles.statValue}>
                {g.market_cap_percentage.btc?.toFixed(1)}%
              </div>
              <div className={styles.statSub} style={{ color: "#6b7280" }}>
                ETH {g.market_cap_percentage.eth?.toFixed(1)}%
              </div>
            </div>

            <div className={styles.stat}>
              <div className={styles.statLabel}>CMC20 Index</div>
              <div className={styles.statValue}>{formatPrice(cmc20.current)}</div>
              <div
                className={`${styles.statSub} ${cmc20.changePct >= 0 ? styles.pos : styles.neg}`}
              >
                {cmc20.changePct >= 0 ? "+" : ""}
                {cmc20.changePct.toFixed(2)}% ({period})
              </div>
            </div>
          </div>
        )}

        <div className={styles.chartsRow}>
          {coins.map(({ meta, points, current, changePct }) => (
            <div className={styles.chartCard} key={meta.symbol}>
              <div className={styles.chartHead}>
                <div className={styles.coin}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={meta.image} alt={meta.name} width={26} height={26} />
                  <div>
                    <div className={styles.coinName}>{meta.name}</div>
                    <div className={styles.coinSym}>{meta.symbol}</div>
                  </div>
                </div>
                <div>
                  <div className={styles.price}>{formatPrice(current)}</div>
                  <ChangeBadge pct={changePct} periodShort={period} />
                </div>
              </div>
              <div className={styles.chartFill}>
                <StaticAreaChart points={points} color={meta.color} />
              </div>
            </div>
          ))}
        </div>

        <div className={styles.winnersStrip}>
          <div className={styles.winnersHead}>
            <span className={styles.winnersTitle}>Top {periodLabel} Winners</span>
            <span className={styles.winnersSub}>
              top {WINNERS_UNIVERSE} by market cap
            </span>
          </div>
          <div className={styles.winnersGrid}>
            {winners.map((w, i) => (
              <div className={styles.winnerCard} key={w.id}>
                <div className={styles.winnerTop}>
                  <span className={styles.winnerRank}>{i + 1}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={w.image} alt={w.name} width={22} height={22} />
                  <span className={styles.winnerSym}>{w.symbol}</span>
                </div>
                <div className={styles.winnerCat}>{w.category ?? "—"}</div>
                <div className={styles.winnerStats}>
                  <span className={styles.winnerPrice}>
                    {formatPrice(w.current_price)}
                  </span>
                  <span className={styles.winnerChange}>
                    +{w.change.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <span className={styles.asof}>As of {asOf}</span>
          <div className={styles.credits}>
            <span className={styles.credit}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cgLogo} alt="CoinGecko" width={16} height={16} />
              Data: CoinGecko
            </span>
            <span className={styles.credit}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={claudeLogo} alt="Claude" width={16} height={16} />
              Created by Claude
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
