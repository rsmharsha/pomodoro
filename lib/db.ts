import Dexie, { type Table } from "dexie";

export interface Task {
  id: string;
  name: string;
  createdAt: number;
  completedAt: number | null;
  archivedAt: number | null;
  order: number;
}

export interface Session {
  id: string;
  taskId: string | null;
  startedAt: number;
  endedAt: number;
  plannedDurationSec: number;
  actualDurationSec: number;
  type: "focus" | "short_break" | "long_break";
}

export interface Settings {
  id: "singleton";
  focusDurationSec: number;
  shortBreakSec: number;
  longBreakSec: number;
  longBreakEvery: number;
  autoStartBreak: boolean;
  autoStartFocus: boolean;
  themeName: string;
  soundEnabled: boolean;
  showMascot: boolean;
  showQuotes: boolean;
}

class PomodoroDb extends Dexie {
  tasks!: Table<Task, string>;
  sessions!: Table<Session, string>;
  settings!: Table<Settings, string>;

  constructor() {
    super("PomodoroDb");
    this.version(1).stores({
      tasks: "id, createdAt, completedAt, archivedAt, order",
      sessions: "id, taskId, startedAt, endedAt, type",
      settings: "id",
    });
  }
}

export const db = new PomodoroDb();

export const DEFAULT_SETTINGS: Settings = {
  id: "singleton",
  focusDurationSec: 1500,
  shortBreakSec: 300,
  longBreakSec: 900,
  longBreakEvery: 4,
  autoStartBreak: false,
  autoStartFocus: false,
  themeName: "slate",
  soundEnabled: true,
  showMascot: true,
  showQuotes: true,
};

export async function getSettings(): Promise<Settings> {
  const s = await db.settings.get("singleton");
  if (!s) {
    await db.settings.put(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
  return s;
}
