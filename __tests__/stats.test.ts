import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  computePeriodStats,
  computeWeeklyPoints,
  computeMonthlyPoints,
  computeYearlyPoints,
} from "@/lib/stats";
import type { Session } from "@/lib/db";

// Freeze time: 2025-06-15 12:00:00 UTC (a Sunday)
const FROZEN = new Date("2025-06-15T12:00:00.000Z").getTime();

function makeSession(overrides: Partial<Session> & { endedAt: number }): Session {
  return {
    id: Math.random().toString(),
    taskId: null,
    startedAt: overrides.endedAt - 1500,
    plannedDurationSec: 1500,
    actualDurationSec: 1500,
    type: "focus",
    ...overrides,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FROZEN);
});

afterEach(() => {
  vi.useRealTimers();
});

// ─── computePeriodStats ────────────────────────────────────────────────────────

describe("computePeriodStats", () => {
  it("counts a session from today in all buckets", () => {
    const s = makeSession({ endedAt: FROZEN - 60_000, actualDurationSec: 900 });
    const result = computePeriodStats([s]);
    expect(result.todaySec).toBe(900);
    expect(result.weekSec).toBe(900);
    expect(result.monthSec).toBe(900);
    expect(result.yearSec).toBe(900);
  });

  it("counts a session from 3 days ago in week/month/year but not today", () => {
    const s = makeSession({ endedAt: FROZEN - 3 * 86400_000, actualDurationSec: 600 });
    const result = computePeriodStats([s]);
    expect(result.todaySec).toBe(0);
    expect(result.weekSec).toBe(600);
    expect(result.monthSec).toBe(600);
    expect(result.yearSec).toBe(600);
  });

  it("counts a session from 10 days ago in month/year but not today/week", () => {
    const s = makeSession({ endedAt: FROZEN - 10 * 86400_000, actualDurationSec: 300 });
    const result = computePeriodStats([s]);
    expect(result.todaySec).toBe(0);
    expect(result.weekSec).toBe(0);
    expect(result.monthSec).toBe(300);
    expect(result.yearSec).toBe(300);
  });

  it("counts a session from 40 days ago in year only", () => {
    const s = makeSession({ endedAt: FROZEN - 40 * 86400_000, actualDurationSec: 1200 });
    const result = computePeriodStats([s]);
    expect(result.todaySec).toBe(0);
    expect(result.weekSec).toBe(0);
    expect(result.monthSec).toBe(0);
    expect(result.yearSec).toBe(1200);
  });

  it("ignores break sessions", () => {
    const s = makeSession({ endedAt: FROZEN - 60_000, type: "short_break", actualDurationSec: 300 });
    const result = computePeriodStats([s]);
    expect(result.todaySec).toBe(0);
  });

  it("sums multiple sessions correctly", () => {
    const sessions = [
      makeSession({ endedAt: FROZEN - 60_000, actualDurationSec: 1500 }),
      makeSession({ endedAt: FROZEN - 3600_000, actualDurationSec: 1500 }),
    ];
    const result = computePeriodStats(sessions);
    expect(result.todaySec).toBe(3000);
  });
});

// ─── computeWeeklyPoints ──────────────────────────────────────────────────────

describe("computeWeeklyPoints", () => {
  it("returns exactly 7 points", () => {
    expect(computeWeeklyPoints([])).toHaveLength(7);
  });

  it("labels the last point with today's short day name", () => {
    const points = computeWeeklyPoints([]);
    // 2025-06-15 is a Sunday
    expect(points[6].label).toBe("Sun");
  });

  it("labels the first point with the day 6 days ago", () => {
    const points = computeWeeklyPoints([]);
    // 6 days before Sunday 2025-06-15 is Monday 2025-06-09
    expect(points[0].label).toBe("Mon");
  });

  it("assigns a session from today to the last bucket", () => {
    const s = makeSession({ endedAt: FROZEN - 1000, actualDurationSec: 600 });
    const points = computeWeeklyPoints([s]);
    expect(points[6].seconds).toBe(600);
    expect(points.slice(0, 6).every((p) => p.seconds === 0)).toBe(true);
  });

  it("assigns a session from 2 days ago to the correct bucket", () => {
    const s = makeSession({ endedAt: FROZEN - 2 * 86400_000, actualDurationSec: 300 });
    const points = computeWeeklyPoints([s]);
    expect(points[4].seconds).toBe(300);
  });

  it("ignores sessions older than 7 days", () => {
    const s = makeSession({ endedAt: FROZEN - 8 * 86400_000 });
    const points = computeWeeklyPoints([s]);
    expect(points.every((p) => p.seconds === 0)).toBe(true);
  });
});

// ─── computeMonthlyPoints ─────────────────────────────────────────────────────

describe("computeMonthlyPoints", () => {
  it("returns exactly 30 points", () => {
    expect(computeMonthlyPoints([])).toHaveLength(30);
  });

  it("assigns a session from today to the last point", () => {
    const s = makeSession({ endedAt: FROZEN - 1000, actualDurationSec: 900 });
    const points = computeMonthlyPoints([s]);
    expect(points[29].seconds).toBe(900);
  });

  it("assigns a session from 15 days ago to the correct point", () => {
    const s = makeSession({ endedAt: FROZEN - 15 * 86400_000, actualDurationSec: 1800 });
    const points = computeMonthlyPoints([s]);
    expect(points[14].seconds).toBe(1800);
  });

  it("ignores sessions older than 30 days", () => {
    const s = makeSession({ endedAt: FROZEN - 31 * 86400_000 });
    const points = computeMonthlyPoints([s]);
    expect(points.every((p) => p.seconds === 0)).toBe(true);
  });
});

// ─── computeYearlyPoints ──────────────────────────────────────────────────────

describe("computeYearlyPoints", () => {
  it("returns exactly 12 points", () => {
    expect(computeYearlyPoints([])).toHaveLength(12);
  });

  it("labels the last point with this month", () => {
    const points = computeYearlyPoints([]);
    // Frozen date is June
    expect(points[11].label).toBe("Jun");
  });

  it("labels the first point 11 months ago", () => {
    const points = computeYearlyPoints([]);
    // 11 months before June 2025 = July 2024
    expect(points[0].label).toBe("Jul");
  });

  it("assigns a session from this month to the last point", () => {
    const s = makeSession({ endedAt: FROZEN - 1000, actualDurationSec: 3600 });
    const points = computeYearlyPoints([s]);
    expect(points[11].seconds).toBe(3600);
    expect(points.slice(0, 11).every((p) => p.seconds === 0)).toBe(true);
  });

  it("assigns a session from last month to the correct bucket", () => {
    // 20 days ago from June 15 = May 26
    const s = makeSession({ endedAt: FROZEN - 20 * 86400_000, actualDurationSec: 1800 });
    const points = computeYearlyPoints([s]);
    // May is points[10]
    expect(points[10].seconds).toBe(1800);
  });

  it("ignores sessions older than 12 months", () => {
    // 13 months ago from June 2025 = May 2024
    const thirteenMonthsAgo = new Date("2024-05-15T10:00:00Z").getTime();
    const s = makeSession({ endedAt: thirteenMonthsAgo });
    const points = computeYearlyPoints([s]);
    expect(points.every((p) => p.seconds === 0)).toBe(true);
  });

  it("sums multiple sessions in the same month", () => {
    const s1 = makeSession({ endedAt: FROZEN - 1000, actualDurationSec: 1500 });
    const s2 = makeSession({ endedAt: FROZEN - 3600_000, actualDurationSec: 1500 });
    const points = computeYearlyPoints([s1, s2]);
    expect(points[11].seconds).toBe(3000);
  });
});
