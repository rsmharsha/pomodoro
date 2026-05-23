"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const CIRCUMFERENCE = 2 * Math.PI * 58;

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const prefersReducedMotion = useReducedMotion();
  const [ringProgress, setRingProgress] = useState(0);
  const [showName, setShowName] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      const t = setTimeout(() => {
        setExiting(true);
        setTimeout(onDone, 350);
      }, 400);
      return () => clearTimeout(t);
    }

    const t1 = setTimeout(() => setShowName(true), 420);
    const t2 = setTimeout(() => {
      setRingProgress(1);
    }, 100);
    const t3 = setTimeout(() => {
      setExiting(true);
      setTimeout(onDone, 320);
    }, 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [prefersReducedMotion, onDone]);

  const strokeDashoffset = CIRCUMFERENCE * (1 - ringProgress);

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative flex items-center justify-center">
            {/* Ring */}
            <svg
              width="160"
              height="160"
              viewBox="0 0 160 160"
              className="absolute"
              style={{ transform: "rotate(-90deg)" }}
            >
              <circle
                cx="80"
                cy="80"
                r="58"
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="4"
              />
              <motion.circle
                cx="80"
                cy="80"
                r="58"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                initial={{ strokeDashoffset: CIRCUMFERENCE }}
                animate={{ strokeDashoffset }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 1.2, ease: [0.22, 1, 0.36, 1] }
                }
              />
            </svg>

            {/* Tomato */}
            <motion.div
              initial={prefersReducedMotion ? {} : { scale: 0.6, opacity: 0 }}
              animate={prefersReducedMotion ? {} : { scale: 1, opacity: 1 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 180, damping: 14, duration: 0.4 }
              }
            >
              <motion.div
                animate={prefersReducedMotion ? {} : { scale: [1, 1.03, 1] }}
                transition={
                  prefersReducedMotion
                    ? {}
                    : { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
                }
              >
                <TomatoSVG />
              </motion.div>
            </motion.div>
          </div>

          {/* App name */}
          <motion.p
            className="mt-6 text-[22px] font-medium tracking-tight text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: showName ? 1 : 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            Pomodoro
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TomatoSVG() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <circle cx="60" cy="68" r="44" fill="#E63946" />
      {/* Highlight */}
      <ellipse cx="44" cy="50" rx="12" ry="8" fill="rgba(255,255,255,0.22)" transform="rotate(-20 44 50)" />
      {/* Stem */}
      <rect x="57" y="22" width="6" height="16" rx="3" fill="#2D6A4F" />
      {/* Leaves */}
      <ellipse cx="48" cy="26" rx="12" ry="5" fill="#40916C" transform="rotate(-30 48 26)" />
      <ellipse cx="72" cy="26" rx="12" ry="5" fill="#40916C" transform="rotate(30 72 26)" />
      <ellipse cx="60" cy="22" rx="8" ry="5" fill="#52B788" />
    </svg>
  );
}
