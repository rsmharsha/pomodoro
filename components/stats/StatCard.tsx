"use client";

import { motion } from "framer-motion";
import { formatHoursMinutes } from "@/lib/utils";

interface StatCardProps {
  label: string;
  seconds: number;
  index: number;
}

export function StatCard({ label, seconds, index }: StatCardProps) {
  return (
    <motion.div
      className="rounded-2xl border border-border bg-card px-5 py-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">
        {seconds > 0 ? formatHoursMinutes(seconds) : "—"}
      </p>
    </motion.div>
  );
}
