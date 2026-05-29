"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompact } from "@/lib/format";

export interface ChartPoint {
  t: number;
  price: number;
  volume: number;
}

export default function StaticAreaChart({
  points,
  color,
}: {
  points: ChartPoint[];
  color: string;
}) {
  const gid = `fill-${color.replace("#", "")}`;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#eceff4" vertical={false} />
        <XAxis
          dataKey="t"
          type="number"
          domain={["dataMin", "dataMax"]}
          scale="time"
          tickFormatter={(t) =>
            new Date(t).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          }
          stroke="#9aa3b2"
          tick={{ fill: "#6b7280", fontSize: 11 }}
          tickLine={false}
          minTickGap={44}
        />
        {/* Volume axis kept hidden; domain padded so bars sit in the bottom band. */}
        <YAxis
          yAxisId="vol"
          hide
          domain={[0, (max: number) => max * 4]}
        />
        <YAxis
          yAxisId="price"
          dataKey="price"
          domain={["auto", "auto"]}
          tickFormatter={(v) => formatCompact(v, "usd")}
          stroke="#9aa3b2"
          tick={{ fill: "#6b7280", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={58}
        />
        <Bar
          yAxisId="vol"
          dataKey="volume"
          fill="#94a3b8"
          fillOpacity={0.95}
          isAnimationActive={false}
        />
        <Area
          yAxisId="price"
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={2.25}
          fill={`url(#${gid})`}
          isAnimationActive={false}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
