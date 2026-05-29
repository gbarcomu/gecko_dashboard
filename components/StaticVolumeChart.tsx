"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompact } from "@/lib/format";

export interface VolPoint {
  t: number;
  value: number;
}

export default function StaticVolumeChart({
  points,
  color,
}: {
  points: VolPoint[];
  color: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={points} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
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
          tick={{ fill: "#6b7280", fontSize: 10 }}
          tickLine={false}
          minTickGap={32}
        />
        <YAxis
          dataKey="value"
          tickFormatter={(v) => formatCompact(v)}
          stroke="#9aa3b2"
          tick={{ fill: "#6b7280", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          width={44}
        />
        <Bar
          dataKey="value"
          fill={color}
          radius={[2, 2, 0, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
