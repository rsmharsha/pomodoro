"use client";

import { useSettings } from "@/hooks/useSettings";

export function SettingsLoader() {
  useSettings();
  return null;
}
