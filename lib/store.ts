"use client";

import { create } from "zustand";
import { DEFAULT_SETTINGS, type Settings } from "@/lib/db";

export type SessionType = "focus" | "short_break" | "long_break";

export type TimerStatus = "idle" | "running" | "paused";

export type MascotMood = "idle" | "running" | "paused" | "completed" | "reset";

interface TimerState {
  status: TimerStatus;
  sessionType: SessionType;
  secondsRemaining: number;
  totalSeconds: number;
  activeTaskId: string | null;
  sessionStartedAt: number | null;
  completedFocusSessions: number;
  customDurationSec: number | null;

  setStatus: (status: TimerStatus) => void;
  setSessionType: (type: SessionType) => void;
  setSecondsRemaining: (s: number) => void;
  setTotalSeconds: (s: number) => void;
  setActiveTaskId: (id: string | null) => void;
  setSessionStartedAt: (ts: number | null) => void;
  incrementCompletedFocusSessions: () => void;
  resetCompletedFocusSessions: () => void;
  setCustomDurationSec: (s: number | null) => void;
  mascotMood: MascotMood;
  setMascotMood: (mood: MascotMood) => void;
}

interface SettingsState {
  settings: Settings;
  setSettings: (s: Settings) => void;
  settingsLoaded: boolean;
  setSettingsLoaded: (b: boolean) => void;
}

type StoreState = TimerState & SettingsState;

export const useStore = create<StoreState>((set) => ({
  status: "idle",
  sessionType: "focus",
  secondsRemaining: DEFAULT_SETTINGS.focusDurationSec,
  totalSeconds: DEFAULT_SETTINGS.focusDurationSec,
  activeTaskId: null,
  sessionStartedAt: null,
  completedFocusSessions: 0,
  customDurationSec: null,

  setStatus: (status) => set({ status }),
  setSessionType: (sessionType) => set({ sessionType }),
  setSecondsRemaining: (secondsRemaining) => set({ secondsRemaining }),
  setTotalSeconds: (totalSeconds) => set({ totalSeconds }),
  setActiveTaskId: (activeTaskId) => set({ activeTaskId }),
  setSessionStartedAt: (sessionStartedAt) => set({ sessionStartedAt }),
  incrementCompletedFocusSessions: () =>
    set((s) => ({ completedFocusSessions: s.completedFocusSessions + 1 })),
  resetCompletedFocusSessions: () => set({ completedFocusSessions: 0 }),
  setCustomDurationSec: (customDurationSec) => set({ customDurationSec }),
  mascotMood: "idle",
  setMascotMood: (mascotMood) => set({ mascotMood }),

  settings: DEFAULT_SETTINGS,
  setSettings: (settings) => set({ settings }),
  settingsLoaded: false,
  setSettingsLoaded: (settingsLoaded) => set({ settingsLoaded }),
}));
