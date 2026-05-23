"use client";

import { useSessions } from "@/hooks/useSessions";
import { useTasks } from "@/hooks/useTasks";
import { StatCard } from "@/components/stats/StatCard";
import { DailyChart } from "@/components/stats/DailyChart";
import { TaskBreakdown } from "@/components/stats/TaskBreakdown";
import {
  computePeriodStats,
  computeWeeklyPoints,
  computeMonthlyPoints,
  computeYearlyPoints,
  computeTaskBreakdown,
  computeUntrackedSec,
} from "@/lib/stats";
import { formatHoursMinutes } from "@/lib/utils";

export default function StatsPage() {
  const { sessions } = useSessions();
  const { tasks } = useTasks();

  const period = computePeriodStats(sessions);
  const weekly = computeWeeklyPoints(sessions);
  const monthly = computeMonthlyPoints(sessions);
  const yearly = computeYearlyPoints(sessions);
  const breakdown = computeTaskBreakdown(sessions, tasks);
  const untrackedSec = computeUntrackedSec(sessions);

  const PERIOD_CARDS = [
    { label: "Today", seconds: period.todaySec },
    { label: "This Week", seconds: period.weekSec },
    { label: "This Month", seconds: period.monthSec },
    { label: "This Year", seconds: period.yearSec },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Stats</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PERIOD_CARDS.map((card, i) => (
          <StatCard key={card.label} label={card.label} seconds={card.seconds} index={i} />
        ))}
      </div>

      <DailyChart weekly={weekly} monthly={monthly} yearly={yearly} />

      <TaskBreakdown data={breakdown} />

      {untrackedSec > 0 && (
        <div className="rounded-2xl border border-border bg-card px-5 py-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Untracked productive time</p>
          <p className="mt-1 text-2xl font-semibold">{formatHoursMinutes(untrackedSec)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Focus sessions without an assigned task</p>
        </div>
      )}
    </div>
  );
}
