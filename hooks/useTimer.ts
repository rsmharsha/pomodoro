"use client";

import { useEffect, useRef, useCallback } from "react";
import { useStore, type SessionType } from "@/lib/store";
import { useSessions } from "@/hooks/useSessions";
import {
  computeActualDurationSec,
  computeRemainingSec,
  resumeSessionStartedAt,
} from "@/lib/timer-math";

// Module-level singleton tick state. Guarantees only one interval ever runs,
// even if multiple components mount useTimer simultaneously.
let globalTickInterval: ReturnType<typeof setInterval> | null = null;
let globalOnComplete: (() => void) | null = null;

function startGlobalTick() {
  if (globalTickInterval) return;
  globalTickInterval = setInterval(() => {
    const state = useStore.getState();
    if (state.status !== "running") {
      stopGlobalTick();
      return;
    }
    // Derive remaining seconds from wall-clock time so the timer stays accurate
    // even when the browser throttles setInterval (background tabs, system sleep).
    if (state.sessionStartedAt === null) return;
    const next = computeRemainingSec(state.totalSeconds, state.sessionStartedAt, Date.now());
    if (next === state.secondsRemaining) return;
    useStore.setState({ secondsRemaining: next });
    if (next <= 0) {
      stopGlobalTick();
      globalOnComplete?.();
    }
  }, 250);
}

function stopGlobalTick() {
  if (globalTickInterval) {
    clearInterval(globalTickInterval);
    globalTickInterval = null;
  }
}

export function useTimer() {
  const {
    status,
    sessionType,
    secondsRemaining,
    totalSeconds,
    activeTaskId,
    sessionStartedAt,
    completedFocusSessions,
    customDurationSec,
    settings,
    setStatus,
    setSessionType,
    setSecondsRemaining,
    setTotalSeconds,
    setSessionStartedAt,
    incrementCompletedFocusSessions,
    setCustomDurationSec,
  } = useStore();

  const { logSession } = useSessions();
  const onCompleteRef = useRef<(() => void) | null>(null);

  function getDurationForType(type: SessionType): number {
    if (customDurationSec !== null) return customDurationSec;
    switch (type) {
      case "focus":
        return settings.focusDurationSec;
      case "short_break":
        return settings.shortBreakSec;
      case "long_break":
        return settings.longBreakSec;
    }
  }

  const handleComplete = useCallback(async () => {
    const now = Date.now();
    const startedAt = sessionStartedAt ?? now - totalSeconds * 1000;

    await logSession({
      taskId: sessionType === "focus" ? activeTaskId : null,
      startedAt,
      endedAt: now,
      plannedDurationSec: totalSeconds,
      actualDurationSec: computeActualDurationSec(startedAt, now, totalSeconds),
      type: sessionType,
    });

    if (sessionType === "focus") {
      incrementCompletedFocusSessions();
      if (settings.soundEnabled) {
        playChime();
      }
    }

    useStore.getState().setMascotMood("completed");
    setTimeout(() => useStore.getState().setMascotMood("idle"), 3500);

    setStatus("idle");
    setSessionStartedAt(null);

    if (settings.autoStartBreak && sessionType === "focus") {
      const newCompleted = completedFocusSessions + 1;
      const nextType: SessionType =
        newCompleted % settings.longBreakEvery === 0 ? "long_break" : "short_break";
      switchType(nextType, true);
    } else if (settings.autoStartFocus && sessionType !== "focus") {
      switchType("focus", true);
    } else {
      const nextDur = getDurationForType(sessionType);
      setSecondsRemaining(nextDur);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionType, activeTaskId, sessionStartedAt, totalSeconds, settings, completedFocusSessions]);

  onCompleteRef.current = handleComplete;

  useEffect(() => {
    globalOnComplete = () => onCompleteRef.current?.();
    if (status === "running") {
      startGlobalTick();
    } else {
      stopGlobalTick();
    }
  }, [status]);

  function start() {
    if (status === "idle") {
      setSessionStartedAt(Date.now());
    } else if (status === "paused") {
      // Shift sessionStartedAt forward by the pause duration so wall-clock math
      // (used by the tick and session logging) excludes paused time.
      setSessionStartedAt(resumeSessionStartedAt(totalSeconds, secondsRemaining, Date.now()));
    }
    setStatus("running");
    useStore.getState().setMascotMood("running");
  }

  function pause() {
    setStatus("paused");
    useStore.getState().setMascotMood("paused");
  }

  function reset() {
    useStore.getState().setMascotMood("reset");
    setTimeout(() => useStore.getState().setMascotMood("idle"), 2500);
    if (sessionStartedAt !== null) {
      const now = Date.now();
      // When paused, sessionStartedAt was set at resume time and the timer hasn't
      // ticked since pause — derive elapsed from secondsRemaining to skip the
      // in-progress pause window.
      const effectiveEnd =
        status === "paused"
          ? sessionStartedAt + (totalSeconds - secondsRemaining) * 1000
          : now;
      const actualSec = computeActualDurationSec(sessionStartedAt, effectiveEnd, totalSeconds);
      if (actualSec > 0) {
        logSession({
          taskId: sessionType === "focus" ? activeTaskId : null,
          startedAt: sessionStartedAt,
          endedAt: now,
          plannedDurationSec: totalSeconds,
          actualDurationSec: actualSec,
          type: sessionType,
        });
      }
    }
    stopGlobalTick();
    setStatus("idle");
    setSessionStartedAt(null);
    const dur = getDurationForType(sessionType);
    setSecondsRemaining(dur);
    setTotalSeconds(dur);
  }

  function skip() {
    if (sessionStartedAt !== null) {
      const now = Date.now();
      const effectiveEnd =
        status === "paused"
          ? sessionStartedAt + (totalSeconds - secondsRemaining) * 1000
          : now;
      logSession({
        taskId: sessionType === "focus" ? activeTaskId : null,
        startedAt: sessionStartedAt,
        endedAt: now,
        plannedDurationSec: totalSeconds,
        actualDurationSec: computeActualDurationSec(sessionStartedAt, effectiveEnd, totalSeconds),
        type: sessionType,
      });
    }
    stopGlobalTick();
    setStatus("idle");
    setSessionStartedAt(null);

    if (sessionType === "focus") {
      incrementCompletedFocusSessions();
      const newCompleted = completedFocusSessions + 1;
      const nextType: SessionType =
        newCompleted % settings.longBreakEvery === 0 ? "long_break" : "short_break";
      switchType(nextType, false);
    } else {
      switchType("focus", false);
    }
  }

  function switchType(type: SessionType, autoStart: boolean) {
    stopGlobalTick();
    setCustomDurationSec(null);
    setSessionType(type);
    const dur = getDurationForType(type);
    setSecondsRemaining(dur);
    setTotalSeconds(dur);
    setStatus("idle");
    setSessionStartedAt(null);
    if (autoStart) {
      setTimeout(() => {
        setSessionStartedAt(Date.now());
        setStatus("running");
        useStore.getState().setMascotMood("running");
      }, 50);
    } else {
      useStore.getState().setMascotMood("idle");
    }
  }

  function setCustomDuration(minutes: number) {
    const sec = minutes * 60;
    stopGlobalTick();
    setCustomDurationSec(sec);
    setSecondsRemaining(sec);
    setTotalSeconds(sec);
    setStatus("idle");
    setSessionStartedAt(null);
  }

  return {
    status,
    sessionType,
    secondsRemaining,
    totalSeconds,
    activeTaskId,
    start,
    pause,
    reset,
    skip,
    switchType,
    setCustomDuration,
  };
}

function playChime() {
  try {
    const AudioContext = window.AudioContext || (window as Window & { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  } catch {
    // Audio not available
  }
}
