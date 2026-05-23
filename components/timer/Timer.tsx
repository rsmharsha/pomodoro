"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { useTimer } from "@/hooks/useTimer";
import { ProgressRing } from "@/components/timer/ProgressRing";
import { TaskSelector } from "@/components/timer/TaskSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDuration } from "@/lib/utils";
import type { SessionType } from "@/lib/store";

const SESSION_LABELS: Record<SessionType, string> = {
  focus: "Focus",
  short_break: "Short Break",
  long_break: "Long Break",
};

export function Timer() {
  const {
    status,
    sessionType,
    secondsRemaining,
    totalSeconds,
    start,
    pause,
    reset,
    skip,
    switchType,
    setCustomDuration,
  } = useTimer();

  const [customInput, setCustomInput] = useState("");

  const progress = totalSeconds > 0 ? secondsRemaining / totalSeconds : 1;
  const pulsing = secondsRemaining <= 10 && status === "running";

  function handleCustomDuration(e: React.FormEvent) {
    e.preventDefault();
    const min = parseInt(customInput, 10);
    if (!isNaN(min) && min > 0) {
      setCustomDuration(min);
      setCustomInput("");
    }
  }

  return (
    <motion.div
      className="flex flex-col items-center gap-8"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Session type switcher */}
      <div className="flex gap-2">
        {(["focus", "short_break", "long_break"] as SessionType[]).map((type) => (
          <Button
            key={type}
            variant={sessionType === type ? "default" : "ghost"}
            size="sm"
            onClick={() => switchType(type, false)}
          >
            {SESSION_LABELS[type]}
          </Button>
        ))}
      </div>

      {/* Ring + timer */}
      <ProgressRing progress={progress} pulsing={pulsing}>
        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-5xl font-semibold tracking-tight tabular-nums">
            {formatDuration(secondsRemaining)}
          </span>
          <span className="text-sm text-muted-foreground">{SESSION_LABELS[sessionType]}</span>
        </div>
      </ProgressRing>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={reset} aria-label="Reset">
          <RotateCcw className="h-5 w-5" />
        </Button>

        <Button
          size="lg"
          className="w-32 gap-2"
          onClick={status === "running" ? pause : start}
          aria-label={status === "running" ? "Pause" : "Start"}
        >
          {status === "running" ? (
            <>
              <Pause className="h-5 w-5" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              {status === "paused" ? "Resume" : "Start"}
            </>
          )}
        </Button>

        <Button variant="ghost" size="icon" onClick={skip} aria-label="Skip">
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>

      {/* Task selector */}
      <div className="w-full flex flex-col items-center gap-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Working on</p>
        <TaskSelector />
      </div>

      {/* Custom duration */}
      <form onSubmit={handleCustomDuration} className="flex items-center gap-2">
        <Input
          type="number"
          min="1"
          max="999"
          placeholder="Custom min"
          className="w-32 text-center"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
        />
        <Button type="submit" variant="outline" size="sm">
          Set
        </Button>
      </form>
    </motion.div>
  );
}
