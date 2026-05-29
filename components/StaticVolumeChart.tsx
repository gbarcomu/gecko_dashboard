"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompact } from "@/lib/format";

export interface VolPoint {
  label: string;
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
      <BarChart data={points} margin={{ top: 16, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#eceff4" vertical={false} />
        <XAxis
          dataKey="label"
          stroke="#9aa3b2"
          tick={{ fill: "#6b7280", fontSize: 11 }}
          tickLine={false}
        />
        <YAxis
          dataKey="value"
          tickFormatter={(v) => formatCompact(v, "usd")}
          stroke="#9aa3b2"
          tick={{ fill: "#6b7280", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          width={52}
        />
        <Bar dataKey="value" fill={color} radius={[3, 3, 0, 0]} isAnimationActive={false}>
          <LabelList
            dataKey="value"
            position="top"
            formatter={(v: number) => formatCompact(v, "usd")}
            style={{ fill: "#374151", fontSize: 11, fontWeight: 600 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
