"use client";

import { motion } from "framer-motion";

interface ProgressRingProps {
  progress: number; // 0–1, where 1 = full (time remaining = full)
  size?: number;
  strokeWidth?: number;
  pulsing?: boolean;
  children?: React.ReactNode;
}

export function ProgressRing({
  progress,
  size = 280,
  strokeWidth = 8,
  pulsing = false,
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{
            strokeDashoffset: offset,
            opacity: pulsing ? [1, 0.5, 1] : 1,
          }}
          transition={{
            strokeDashoffset: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
            opacity: pulsing ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" } : {},
          }}
        />
      </svg>
      <div className="relative z-10 flex items-center justify-center">{children}</div>
    </div>
  );
}
