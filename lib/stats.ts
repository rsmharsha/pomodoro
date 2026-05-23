import { startOfDay, startOfWeek, startOfMonth, startOfYear, subDays, subMonths, addMonths, format } from "date-fns";
import type { Session, Task } from "@/lib/db";

export interface PeriodStats {
  todaySec: number;
  weekSec: number;
  monthSec: number;
  yearSec: number;
}

export interface DailyPoint {
  date: string;
  seconds: number;
}

export interface ChartPoint {
  label: string;
  seconds: number;
}

export interface TaskBreakdownItem {
  name: string;
  seconds: number;
  taskId: string | null;
}

export function computePeriodStats(sessions: Session[]): PeriodStats {
  const now = Date.now();
  const todayStart = startOfDay(now).getTime();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }).getTime();
  const monthStart = startOfMonth(now).getTime();
  const yearStart = startOfYear(now).getTime();

  let todaySec = 0;
  let weekSec = 0;
  let monthSec = 0;
  let yearSec = 0;

  for (const s of sessions) {
    if (s.type !== "focus") continue;
    const d = s.actualDurationSec;
    if (s.endedAt >= todayStart) todaySec += d;
    if (s.endedAt >= weekStart) weekSec += d;
    if (s.endedAt >= monthStart) monthSec += d;
    if (s.endedAt >= yearStart) yearSec += d;
  }

  return { todaySec, weekSec, monthSec, yearSec };
}

export function computeDailyPoints(sessions: Session[], days = 30): DailyPoint[] {
  const now = Date.now();
  const points: DailyPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const dayStart = startOfDay(subDays(now, i)).getTime();
    const dayEnd = dayStart + 86400000;
    const seconds = sessions
      .filter((s) => s.type === "focus" && s.endedAt >= dayStart && s.endedAt < dayEnd)
      .reduce((acc, s) => acc + s.actualDurationSec, 0);
    points.push({ date: format(dayStart, "MMM d"), seconds });
  }

  return points;
}

export function computeTaskBreakdown(
  sessions: Session[],
  tasks: Task[],
  topN = 8
): TaskBreakdownItem[] {
  const focusSessions = sessions.filter((s) => s.type === "focus");

  const taskMap = new Map<string, number>();
  let untrackedSec = 0;

  for (const s of focusSessions) {
    if (s.taskId === null) {
      untrackedSec += s.actualDurationSec;
    } else {
      taskMap.set(s.taskId, (taskMap.get(s.taskId) ?? 0) + s.actualDurationSec);
    }
  }

  const taskLookup = new Map(tasks.map((t) => [t.id, t.name]));

  const items: TaskBreakdownItem[] = Array.from(taskMap.entries())
    .map(([taskId, seconds]) => ({
      name: taskLookup.get(taskId) ?? "Deleted task",
      seconds,
      taskId,
    }))
    .sort((a, b) => b.seconds - a.seconds);

  const top = items.slice(0, topN);
  const otherSec = items.slice(topN).reduce((acc, x) => acc + x.seconds, 0);

  if (otherSec > 0) {
    top.push({ name: "Other", seconds: otherSec, taskId: null });
  }
  if (untrackedSec > 0) {
    top.push({ name: "Untracked", seconds: untrackedSec, taskId: null });
  }

  return top;
}

export function computeUntrackedSec(sessions: Session[]): number {
  return sessions
    .filter((s) => s.type === "focus" && s.taskId === null)
    .reduce((acc, s) => acc + s.actualDurationSec, 0);
}

export function computeWeeklyPoints(sessions: Session[]): ChartPoint[] {
  const now = Date.now();
  const points: ChartPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = startOfDay(subDays(now, i)).getTime();
    const dayEnd = dayStart + 86400000;
    const seconds = sessions
      .filter((s) => s.type === "focus" && s.endedAt >= dayStart && s.endedAt < dayEnd)
      .reduce((acc, s) => acc + s.actualDurationSec, 0);
    points.push({ label: format(dayStart, "EEE"), seconds });
  }
  return points;
}

export function computeMonthlyPoints(sessions: Session[]): ChartPoint[] {
  return computeDailyPoints(sessions, 30).map((d) => ({ label: d.date, seconds: d.seconds }));
}

export function computeYearlyPoints(sessions: Session[]): ChartPoint[] {
  const now = new Date();
  const points: ChartPoint[] = [];
  for (let i = 11; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const mStart = startOfMonth(monthDate).getTime();
    const mEnd = startOfMonth(addMonths(monthDate, 1)).getTime();
    const seconds = sessions
      .filter((s) => s.type === "focus" && s.endedAt >= mStart && s.endedAt < mEnd)
      .reduce((acc, s) => acc + s.actualDurationSec, 0);
    points.push({ label: format(mStart, "MMM"), seconds });
  }
  return points;
}
