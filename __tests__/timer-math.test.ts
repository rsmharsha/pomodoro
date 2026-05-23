import { describe, it, expect } from "vitest";
import {
  computeRemainingSec,
  computeActualDurationSec,
  resumeSessionStartedAt,
} from "@/lib/timer-math";

// ─── computeRemainingSec ───────────────────────────────────────────────────────

describe("computeRemainingSec", () => {
  it("returns full duration when zero time has elapsed", () => {
    expect(computeRemainingSec(1500, 1_000_000, 1_000_000)).toBe(1500);
  });

  it("subtracts whole seconds of elapsed time", () => {
    // 600 ms elapsed → 0 seconds floored
    expect(computeRemainingSec(1500, 1_000_000, 1_000_600)).toBe(1500);
    // 1000 ms elapsed → 1 second
    expect(computeRemainingSec(1500, 1_000_000, 1_001_000)).toBe(1499);
    // 12.4 min elapsed → 744 sec elapsed → 756 remaining
    expect(computeRemainingSec(1500, 0, 744 * 1000)).toBe(756);
  });

  it("returns 0 when elapsed equals total", () => {
    expect(computeRemainingSec(1500, 0, 1500 * 1000)).toBe(0);
  });

  it("clamps to 0 when elapsed exceeds total (no negative numbers)", () => {
    expect(computeRemainingSec(1500, 0, 5000 * 1000)).toBe(0);
  });

  it("handles a 25 min timer exactly", () => {
    const total = 25 * 60;
    expect(computeRemainingSec(total, 0, total * 1000)).toBe(0);
    expect(computeRemainingSec(total, 0, (total - 1) * 1000)).toBe(1);
    expect(computeRemainingSec(total, 0, 1 * 1000)).toBe(total - 1);
  });
});

// ─── computeActualDurationSec ──────────────────────────────────────────────────

describe("computeActualDurationSec", () => {
  it("returns elapsed seconds for a normal run", () => {
    // Run started at t=0, ended at t=1500s, total=1500
    expect(computeActualDurationSec(0, 1500 * 1000, 1500)).toBe(1500);
  });

  it("caps at totalSec when wall-clock elapsed exceeds total (e.g. paused)", () => {
    // Wall clock shows 30 min elapsed but planned was 25 — cap at 25
    expect(computeActualDurationSec(0, 30 * 60 * 1000, 25 * 60)).toBe(25 * 60);
  });

  it("rounds millisecond-level precision", () => {
    expect(computeActualDurationSec(0, 1499500, 1500)).toBe(1500);
    expect(computeActualDurationSec(0, 1499400, 1500)).toBe(1499);
  });

  it("never returns a negative duration", () => {
    expect(computeActualDurationSec(1000, 500, 1500)).toBe(0);
  });

  it("REGRESSION: 25-min timer completed end-to-end logs 25 min, not half", () => {
    // The original bug: two useTimer instances double-decremented the store,
    // so a 25-min timer hit zero in ~12.5 real minutes and logged ~12 min.
    // With the singleton + wall-clock tick, a fully-elapsed 25-min run
    // must log exactly 25 min = 1500 sec.
    const startedAt = 1_700_000_000_000;
    const endedAt = startedAt + 25 * 60 * 1000;
    expect(computeActualDurationSec(startedAt, endedAt, 25 * 60)).toBe(1500);
  });
});

// ─── resumeSessionStartedAt ────────────────────────────────────────────────────

describe("resumeSessionStartedAt", () => {
  it("preserves elapsed-time semantics after a pause", () => {
    // 25-min timer (1500s). User has run it for 600s, paused, now resuming.
    const totalSec = 1500;
    const secondsRemaining = 900;
    const resumeNow = 2_000_000_000_000;
    const newStart = resumeSessionStartedAt(totalSec, secondsRemaining, resumeNow);
    // After this resume, wall-clock-derived elapsed at the resume instant
    // should equal what was consumed before the pause (600s).
    expect(computeRemainingSec(totalSec, newStart, resumeNow)).toBe(900);
    // And one second later, it should drop to 899.
    expect(computeRemainingSec(totalSec, newStart, resumeNow + 1000)).toBe(899);
  });

  it("yields a duration equal to total when the resumed timer completes", () => {
    const totalSec = 1500;
    const secondsRemaining = 900;
    const resumeNow = 5_000_000_000_000;
    const newStart = resumeSessionStartedAt(totalSec, secondsRemaining, resumeNow);
    // Run the remaining 900 seconds.
    const endedAt = resumeNow + 900 * 1000;
    // Total duration recorded is (endedAt - newStart) = 1500s.
    expect(computeActualDurationSec(newStart, endedAt, totalSec)).toBe(1500);
  });
});
