"use client";

import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, DEFAULT_SETTINGS, type Settings } from "@/lib/db";
import { useStore } from "@/lib/store";

export function useSettings() {
  const { settings, setSettings, settingsLoaded, setSettingsLoaded } = useStore();

  // Seed defaults once — must be outside useLiveQuery (which is read-only)
  useEffect(() => {
    db.settings.get("singleton").then((s) => {
      if (!s) db.settings.put(DEFAULT_SETTINGS);
    });
  }, []);

  // Pure read — no writes inside useLiveQuery
  const dbSettings = useLiveQuery(() => db.settings.get("singleton"), []);

  useEffect(() => {
    if (dbSettings) {
      setSettings({ ...DEFAULT_SETTINGS, ...dbSettings });
      setSettingsLoaded(true);
    }
  }, [dbSettings, setSettings, setSettingsLoaded]);

  async function updateSettings(patch: Partial<Settings>) {
    const updated = { ...settings, ...patch };
    await db.settings.put(updated);
    setSettings(updated);
  }

  return { settings, settingsLoaded, updateSettings };
}
