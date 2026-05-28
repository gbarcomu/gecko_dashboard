import { getGlobal, getMarketChart, getTop30dWinners } from "@/lib/coingecko";
import { formatCompact, formatPrice } from "@/lib/format";
import StaticAreaChart, { type ChartPoint } from "@/components/StaticAreaChart";
import DownloadButton from "@/components/DownloadButton";
import styles from "./report.module.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
const DAYS = 30;
const WINNERS_COUNT = 5;
const WINNERS_UNIVERSE = 100;

function rangeLabel(points: ChartPoint[]): string {
  if (points.length === 0) return "";
  const fmt = (t: number) =>
    new Date(t).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  return `${fmt(points[0].t)} – ${fmt(points[points.length - 1].t)}`;
}

// Inline remote images as data URIs so they survive client-side PNG export
// (html-to-image can't read cross-origin <img> pixels otherwise).
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

async function loadCoin(id: keyof typeof COINS) {
  const [{ data }, image] = await Promise.all([
    getMarketChart(id, DAYS),
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

async function loadIndexValue(id: string) {
  const { data } = await getMarketChart(id, DAYS);
  const prices = data.prices;
  const first = prices[0]?.[1] ?? 0;
  const last = prices[prices.length - 1]?.[1] ?? 0;
  const changePct = first ? ((last - first) / first) * 100 : 0;
  return { current: last, changePct };
}

function ChangeBadge({ pct }: { pct: number }) {
  const up = pct >= 0;
  return (
    <span className={`${styles.badge} ${up ? styles.badgePos : styles.badgeNeg}`}>
      {up ? "▲" : "▼"} {up ? "+" : ""}
      {pct.toFixed(2)}% · 30d
    </span>
  );
}

export default async function ReportPage() {
  const [global, btc, eth, cmc20, winnersRes] = await Promise.all([
    getGlobal(),
    loadCoin("bitcoin"),
    loadCoin("ethereum"),
    loadIndexValue(CMC20_ID),
    getTop30dWinners(WINNERS_COUNT, WINNERS_UNIVERSE),
  ]);

  // Inline winner logos so they render in the exported PNG.
  const winners = await Promise.all(
    winnersRes.data.map(async (w) => ({ ...w, image: await toDataUri(w.image) })),
  );

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
        <DownloadButton targetId="report-capture" fileName="crypto-market-snapshot.png" />
      </div>

      <div className={styles.inner} id="report-capture">
        <div className={styles.header}>
          <h1 className={styles.title}>Crypto Market Snapshot</h1>
          <span className={styles.asof}>As of {asOf}</span>
        </div>

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
              {cmc20.changePct.toFixed(2)}% (30d)
            </div>
          </div>
        </div>

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
                  <ChangeBadge pct={changePct} />
                </div>
              </div>
              <div className={styles.range}>
                {rangeLabel(points)} · price + volume
              </div>
              <div className={styles.chartFill}>
                <StaticAreaChart points={points} color={meta.color} />
              </div>
            </div>
          ))}
        </div>

        <div className={styles.winnersStrip}>
          <div className={styles.winnersHead}>
            <span className={styles.winnersTitle}>Top 30-Day Winners</span>
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
                <div className={styles.winnerPrice}>
                  {formatPrice(w.current_price)}
                </div>
                <div className={styles.winnerChange}>
                  +{w.change30d.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
