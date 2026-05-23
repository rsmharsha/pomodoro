"use client";

import { useStore } from "@/lib/store";
import { useTasks } from "@/hooks/useTasks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TaskSelector() {
  const activeTaskId = useStore((s) => s.activeTaskId);
  const setActiveTaskId = useStore((s) => s.setActiveTaskId);
  const { tasks } = useTasks();

  const activeTasks = tasks.filter((t) => !t.completedAt && !t.archivedAt);

  return (
    <Select
      value={activeTaskId ?? "none"}
      onValueChange={(v) => setActiveTaskId(v === "none" ? null : v)}
    >
      <SelectTrigger className="w-full max-w-xs">
        <SelectValue placeholder="No task selected" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No task (untracked)</SelectItem>
        {activeTasks.map((task) => (
          <SelectItem key={task.id} value={task.id}>
            {task.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
