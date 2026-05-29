import Snapshot from "@/components/Snapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function YearPage() {
  return <Snapshot days={365} period="1y" periodLabel="1-Year" />;
}
