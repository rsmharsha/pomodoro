"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useStore } from "@/lib/store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <ThemeAttributeSync />
      {children}
    </NextThemesProvider>
  );
}

function ThemeAttributeSync() {
  const themeName = useStore((s) => s.settings.themeName);
  const settingsLoaded = useStore((s) => s.settingsLoaded);

  React.useEffect(() => {
    if (!settingsLoaded) return;
    document.documentElement.setAttribute("data-theme", themeName);
  }, [themeName, settingsLoaded]);

  return null;
}
