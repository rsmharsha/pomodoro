"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { ChartPoint } from "@/lib/stats";
import { formatHoursMinutes, cn } from "@/lib/utils";

type Range = "week" | "month" | "year";

const TABS: { id: Range; label: string }[] = [
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
];

const TITLE: Record<Range, string> = {
  week: "Last 7 days",
  month: "Last 30 days",
  year: "Last 12 months",
};

interface DailyChartProps {
  weekly: ChartPoint[];
  monthly: ChartPoint[];
  yearly: ChartPoint[];
}

export function DailyChart({ weekly, monthly, yearly }: DailyChartProps) {
  const [range, setRange] = useState<Range>("week");

  const raw = range === "week" ? weekly : range === "month" ? monthly : yearly;
  const chartData = raw.map((d) => ({ ...d, minutes: Math.round(d.seconds / 60) }));

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium">Focus time — {TITLE[range]}</p>
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRange(tab.id)}
              className={cn(
                "px-3 py-1 text-xs rounded-lg transition-colors",
                range === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            interval={range === "month" ? 6 : 0}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(minutes: number) => {
              if (minutes === 0) return "0";
              if (minutes < 60) return `${minutes}m`;
              const h = Math.floor(minutes / 60);
              const m = minutes % 60;
              if (m === 0) return `${h}h`;
              return `${h}h ${m}m`;
            }}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted))" }}
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
              fontSize: 12,
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
            formatter={(
              _val: number,
              _name: string,
              item: { payload?: { seconds?: number } }
            ) => [formatHoursMinutes(item.payload?.seconds ?? 0), "Focus"]}
          />
          <Bar
            dataKey="minutes"
            fill="hsl(var(--primary))"
            radius={[3, 3, 0, 0]}
            maxBarSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
