"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Check, Archive, Trash2, ArchiveRestore, RotateCcw, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import type { Task } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatHoursMinutes } from "@/lib/utils";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

interface TaskRowProps {
  task: Task;
  tab: "active" | "completed" | "archived";
  onComplete: (id: string) => void;
  onUncomplete: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, name: string) => void;
}

export function TaskRow({
  task,
  tab,
  onComplete,
  onUncomplete,
  onArchive,
  onUnarchive,
  onDelete,
  onUpdate,
}: TaskRowProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.name);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: tab !== "active",
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const sessions = useLiveQuery(
    () => db.sessions.where("taskId").equals(task.id).toArray(),
    [task.id]
  );

  const focusSec = sessions?.filter((s) => s.type === "focus").reduce((a, s) => a + s.actualDurationSec, 0) ?? 0;
  const focusCount = sessions?.filter((s) => s.type === "focus").length ?? 0;

  function submitEdit() {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== task.name) {
      onUpdate(task.id, trimmed);
    }
    setEditing(false);
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
    >
      {tab === "active" && (
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}

      <div className="flex-1 min-w-0">
        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitEdit();
            }}
            className="flex gap-2"
          >
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={submitEdit}
              autoFocus
              className="h-7 text-sm"
            />
          </form>
        ) : (
          <p className={`text-sm truncate ${task.completedAt ? "line-through text-muted-foreground" : ""}`}>
            {task.name}
          </p>
        )}
        {focusSec > 0 && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatHoursMinutes(focusSec)} · {focusCount} session{focusCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {tab === "active" && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setEditing(true)}
              aria-label="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onComplete(task.id)}
              aria-label="Mark complete"
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onArchive(task.id)}
              aria-label="Archive"
            >
              <Archive className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
        {tab === "completed" && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onUncomplete(task.id)}
              aria-label="Mark incomplete"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onArchive(task.id)}
              aria-label="Archive"
            >
              <Archive className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
        {tab === "archived" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onUnarchive(task.id)}
            aria-label="Unarchive"
          >
            <ArchiveRestore className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={() => onDelete(task.id)}
          aria-label="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}
