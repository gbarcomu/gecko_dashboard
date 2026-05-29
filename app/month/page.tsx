import Snapshot from "@/components/Snapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function MonthPage() {
  return <Snapshot days={30} period="30d" periodLabel="30-Day" />;
}
