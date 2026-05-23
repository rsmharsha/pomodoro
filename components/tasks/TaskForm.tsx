"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TaskFormProps {
  onSubmit: (name: string) => void;
}

export function TaskForm({ onSubmit }: TaskFormProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add a task…"
        className="flex-1"
      />
      <Button type="submit" size="icon" aria-label="Add task">
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  );
}
