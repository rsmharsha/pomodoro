"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { TaskBreakdownItem } from "@/lib/stats";
import { formatHoursMinutes } from "@/lib/utils";

const COLORS = [
  "hsl(var(--primary))",
  "#60A5FA",
  "#34D399",
  "#FBBF24",
  "#F87171",
  "#A78BFA",
  "#F472B6",
  "#38BDF8",
  "#FB923C",
  "#4ADE80",
];

interface TaskBreakdownProps {
  data: TaskBreakdownItem[];
}

export function TaskBreakdown({ data }: TaskBreakdownProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-sm font-medium mb-2">Time by task</p>
        <p className="text-sm text-muted-foreground py-8 text-center">No sessions yet</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({ name: d.name, value: Math.round(d.seconds / 60) }));

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm font-medium mb-4">Time by task</p>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
              fontSize: 12,
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
            itemStyle={{ color: "hsl(var(--foreground))" }}
            formatter={(val: number) => [formatHoursMinutes(val * 60), ""]}
          />
          <Legend
            formatter={(value) => <span style={{ fontSize: 12, color: "hsl(var(--foreground))" }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-3 space-y-1.5">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
            <span className="font-medium tabular-nums">{formatHoursMinutes(item.seconds)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
