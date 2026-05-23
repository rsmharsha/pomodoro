"use client";

import { useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import { useTasks } from "@/hooks/useTasks";
import { useSessions } from "@/hooks/useSessions";
import { useStore } from "@/lib/store";
import { db, DEFAULT_SETTINGS } from "@/lib/db";
import { THEMES } from "@/lib/themes";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { tasks } = useTasks();
  const { sessions } = useSessions();
  const setSettings = useStore((s) => s.setSettings);

  const [focusMin, setFocusMin] = useState(String(Math.round(settings.focusDurationSec / 60)));
  const [shortMin, setShortMin] = useState(String(Math.round(settings.shortBreakSec / 60)));
  const [longMin, setLongMin] = useState(String(Math.round(settings.longBreakSec / 60)));
  const [longEvery, setLongEvery] = useState(String(settings.longBreakEvery));

  async function saveDurations() {
    const focus = parseInt(focusMin) * 60;
    const short = parseInt(shortMin) * 60;
    const long = parseInt(longMin) * 60;
    const every = parseInt(longEvery);
    if (
      isNaN(focus) || isNaN(short) || isNaN(long) || isNaN(every) ||
      focus < 60 || short < 60 || long < 60 || every < 1
    ) return;
    await updateSettings({
      focusDurationSec: focus,
      shortBreakSec: short,
      longBreakSec: long,
      longBreakEvery: every,
    });
  }

  function exportData() {
    const blob = new Blob(
      [JSON.stringify({ tasks, sessions, settings }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pomodoro-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importData(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.tasks) await db.tasks.bulkPut(data.tasks);
      if (data.sessions) await db.sessions.bulkPut(data.sessions);
      if (data.settings) {
        await db.settings.put({ ...DEFAULT_SETTINGS, ...data.settings, id: "singleton" });
        setSettings({ ...DEFAULT_SETTINGS, ...data.settings, id: "singleton" });
      }
    } catch {
      // Could show a toast here
    }
    e.target.value = "";
  }

  async function wipeData() {
    await db.tasks.clear();
    await db.sessions.clear();
    await db.settings.put(DEFAULT_SETTINGS);
    setSettings(DEFAULT_SETTINGS);
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">Settings</h1>

      {/* Durations */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Durations</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <DurationField label="Focus (min)" value={focusMin} onChange={setFocusMin} />
          <DurationField label="Short break" value={shortMin} onChange={setShortMin} />
          <DurationField label="Long break" value={longMin} onChange={setLongMin} />
          <DurationField label="Long every N" value={longEvery} onChange={setLongEvery} />
        </div>
        <Button variant="outline" size="sm" className="w-fit" onClick={saveDurations}>
          Save durations
        </Button>
      </section>

      <Separator />

      {/* Auto-start */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Auto-start</h2>
        <ToggleRow
          label="Auto-start breaks"
          description="Automatically begin break after focus ends"
          checked={settings.autoStartBreak}
          onCheckedChange={(v) => updateSettings({ autoStartBreak: v })}
        />
        <ToggleRow
          label="Auto-start focus"
          description="Automatically begin focus after break ends"
          checked={settings.autoStartFocus}
          onCheckedChange={(v) => updateSettings({ autoStartFocus: v })}
        />
        <ToggleRow
          label="Sound on completion"
          description="Play a chime when a session ends"
          checked={settings.soundEnabled}
          onCheckedChange={(v) => updateSettings({ soundEnabled: v })}
        />
      </section>

      <Separator />

      {/* Display */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Display</h2>
        <ToggleRow
          label="Show mascot"
          description="Display the tomato mascot on the timer page"
          checked={settings.showMascot}
          onCheckedChange={(v) => updateSettings({ showMascot: v })}
        />
        <ToggleRow
          label="Show quotes"
          description="Display motivational quotes on the timer page"
          checked={settings.showQuotes}
          onCheckedChange={(v) => updateSettings({ showQuotes: v })}
        />
      </section>

      <Separator />

      {/* Theme */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Theme</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => updateSettings({ themeName: theme.id })}
              className={cn(
                "rounded-xl border-2 px-3 py-2.5 text-left transition-colors",
                settings.themeName === theme.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}
            >
              <p className="text-sm font-medium">{theme.label}</p>
              <p className="text-xs text-muted-foreground">{theme.description}</p>
            </button>
          ))}
        </div>
      </section>

      <Separator />

      {/* Data */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Data</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={exportData}>
            Export JSON
          </Button>
          <label>
            <Button variant="outline" size="sm" asChild>
              <span>Import JSON</span>
            </Button>
            <input type="file" accept=".json" className="sr-only" onChange={importData} />
          </label>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">Wipe all data</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Wipe all data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently deletes all tasks, sessions, and settings. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={wipeData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Wipe data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>
    </div>
  );
}

function DurationField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        min="1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-center"
      />
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
