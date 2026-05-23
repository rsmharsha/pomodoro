"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { QUOTES, getRandomQuote } from "@/lib/quotes";

export function QuotesPanel() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const sessionStartedAt = useStore((s) => s.sessionStartedAt);
  const prevStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (sessionStartedAt !== null && sessionStartedAt !== prevStartRef.current) {
      prevStartRef.current = sessionStartedAt;
      const { index } = getRandomQuote(idx);
      setIdx(index);
    }
  }, [sessionStartedAt, idx]);

  const quote = QUOTES[idx];

  return (
    <div className="flex flex-col gap-2 w-[200px]">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
        Keep going
      </p>
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[13px] leading-snug text-foreground/80 italic line-clamp-3">
            &ldquo;{quote.text}&rdquo;
          </p>
          <p className="mt-2.5 text-xs text-muted-foreground font-medium not-italic">
            — {quote.author}
          </p>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={() => {
          const { index } = getRandomQuote(idx);
          setIdx(index);
        }}
        className="mt-3 text-[10px] text-muted-foreground hover:text-foreground transition-colors text-left underline underline-offset-2"
      >
        Another quote
      </button>
    </div>
  );
}
