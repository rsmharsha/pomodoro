/**
 * Pure helpers for timer math. Kept side-effect-free so they can be unit-tested
 * without React, the store, or IndexedDB.
 */

export function computeRemainingSec(
  totalSec: number,
  sessionStartedAtMs: number,
  nowMs: number,
): number {
  const elapsedSec = Math.floor((nowMs - sessionStartedAtMs) / 1000);
  return Math.max(0, totalSec - elapsedSec);
}

export function computeActualDurationSec(
  startedAtMs: number,
  endedAtMs: number,
  totalSec: number,
): number {
  const raw = Math.round((endedAtMs - startedAtMs) / 1000);
  return Math.min(Math.max(0, raw), totalSec);
}

/**
 * On resume from pause, shifts the virtual session start forward by the time
 * spent paused so wall-clock math `(now - sessionStartedAt)` continues to equal
 * actual run time (excluding pauses).
 */
export function resumeSessionStartedAt(
  totalSec: number,
  secondsRemaining: number,
  nowMs: number,
): number {
  const consumedSec = totalSec - secondsRemaining;
  return nowMs - consumedSec * 1000;
}
