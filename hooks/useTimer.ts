"use client";

import { useEffect, useRef, useCallback } from "react";
import { useStore, type SessionType } from "@/lib/store";
import { useSessions } from "@/hooks/useSessions";
import { uuid } from "@/lib/utils";

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
    resetCompletedFocusSessions,
    setCustomDurationSec,
  } = useStore();

  const { logSession } = useSessions();
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
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

  function clearTick() {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }

  const handleComplete = useCallback(async () => {
    clearTick();
    const now = Date.now();
    const startedAt = sessionStartedAt ?? now - totalSeconds * 1000;
    const actualSec = Math.round((now - startedAt) / 1000);

    await logSession({
      taskId: sessionType === "focus" ? activeTaskId : null,
      startedAt,
      endedAt: now,
      plannedDurationSec: totalSeconds,
      actualDurationSec: Math.min(actualSec, totalSeconds),
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
    if (status !== "running") {
      clearTick();
      return;
    }

    tickRef.current = setInterval(() => {
      useStore.setState((state) => {
        const next = state.secondsRemaining - 1;
        if (next <= 0) {
          clearInterval(tickRef.current!);
          tickRef.current = null;
          onCompleteRef.current?.();
          return { secondsRemaining: 0 };
        }
        return { secondsRemaining: next };
      });
    }, 1000);

    return clearTick;
  }, [status]);

  function start() {
    if (status === "idle") {
      setSessionStartedAt(Date.now());
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
      const actualSec = Math.round((now - sessionStartedAt) / 1000);
      if (actualSec > 0) {
        logSession({
          taskId: sessionType === "focus" ? activeTaskId : null,
          startedAt: sessionStartedAt,
          endedAt: now,
          plannedDurationSec: totalSeconds,
          actualDurationSec: Math.min(actualSec, totalSeconds),
          type: sessionType,
        });
      }
    }
    clearTick();
    setStatus("idle");
    setSessionStartedAt(null);
    const dur = getDurationForType(sessionType);
    setSecondsRemaining(dur);
    setTotalSeconds(dur);
  }

  function skip() {
    if (sessionStartedAt !== null) {
      const now = Date.now();
      const actualSec = Math.round((now - sessionStartedAt) / 1000);
      logSession({
        taskId: sessionType === "focus" ? activeTaskId : null,
        startedAt: sessionStartedAt,
        endedAt: now,
        plannedDurationSec: totalSeconds,
        actualDurationSec: Math.min(actualSec, totalSeconds),
        type: sessionType,
      });
    }
    clearTick();
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
    clearTick();
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
    setCustomDurationSec(sec);
    setSecondsRemaining(sec);
    setTotalSeconds(sec);
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
