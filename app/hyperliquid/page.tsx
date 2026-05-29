import Snapshot from "@/components/Snapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function HyperliquidPage() {
  return (
    <Snapshot
      days={30}
      period="30d"
      periodLabel="30-Day"
      exchange={{
        id: "hyperliquid",
        name: "Hyperliquid",
        logo: "https://coin-images.coingecko.com/markets/images/1208/small/Hyperliquid_logo.png?1706865217",
      }}
    />
  );
}
