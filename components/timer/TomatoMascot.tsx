"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useStore, type MascotMood } from "@/lib/store";

export function TomatoMascot() {
  const mascotMood = useStore((s) => s.mascotMood);

  return (
    <div className="relative flex flex-col items-center select-none">
      <div className="relative flex items-center justify-center w-32 h-36">
        <AnimatePresence>
          {mascotMood === "completed" && <ParticleBurst key="burst" />}
        </AnimatePresence>
        <MoodMotion mood={mascotMood}>
          <TomatoFace mood={mascotMood} />
        </MoodMotion>
      </div>
      <MoodCaption mood={mascotMood} />
    </div>
  );
}

/* ── Per-mood body animation ─────────────────────────────────────────── */

function MoodMotion({ mood, children }: { mood: MascotMood; children: React.ReactNode }) {
  type AnimDef = { y: number | number[]; rotate?: number | number[]; scale?: number | number[] };
  type TransDef = { duration: number; repeat?: number; ease?: string | number[]; times?: number[] };

  const configs: Record<MascotMood, { anim: AnimDef; trans: TransDef }> = {
    idle: {
      anim: { y: [0, -7, 0] },
      trans: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
    },
    running: {
      anim: { y: [0, -4, 0] },
      trans: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
    },
    paused: {
      anim: { y: [0, 5, 0] },
      trans: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
    },
    completed: {
      anim: {
        y: [0, -32, 0, -20, 0, -10, 0],
        rotate: [0, -8, 8, -4, 4, 0, 0],
        scale: [1, 1.1, 1, 1.05, 1, 1.02, 1],
      },
      trans: {
        duration: 1.1,
        ease: "easeOut",
        times: [0, 0.22, 0.42, 0.58, 0.72, 0.88, 1],
      },
    },
    reset: {
      anim: { y: [0, 12, 10], rotate: [0, -5, -3] },
      trans: { duration: 0.7, ease: "easeOut", times: [0, 0.6, 1] },
    },
  };

  const { anim, trans } = configs[mood];

  return (
    <motion.div
      key={mood}
      animate={anim}
      transition={trans}
      style={{ display: "inline-block", transformOrigin: "bottom center" }}
    >
      {children}
    </motion.div>
  );
}

/* ── Tomato SVG with mood-dependent face ──────────────────────────────── */

function TomatoFace({ mood }: { mood: MascotMood }) {
  return (
    <svg width="110" height="110" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <circle cx="60" cy="68" r="44" fill="#E63946" />
      {/* Highlight */}
      <ellipse cx="44" cy="50" rx="12" ry="8" fill="rgba(255,255,255,0.18)" transform="rotate(-20 44 50)" />
      {/* Stem */}
      <rect x="57" y="22" width="6" height="16" rx="3" fill="#2D6A4F" />
      {/* Leaves */}
      <ellipse cx="48" cy="26" rx="12" ry="5" fill="#40916C" transform="rotate(-30 48 26)" />
      <ellipse cx="72" cy="26" rx="12" ry="5" fill="#40916C" transform="rotate(30 72 26)" />
      <ellipse cx="60" cy="22" rx="8" ry="5" fill="#52B788" />
      {/* Face */}
      <Face mood={mood} />
    </svg>
  );
}

function Face({ mood }: { mood: MascotMood }) {
  const ink = "rgba(0,0,0,0.68)";
  const stroke = { stroke: ink, strokeWidth: 2.2, strokeLinecap: "round" as const, fill: "none" };

  if (mood === "completed") {
    return (
      <>
        {/* Blush */}
        <ellipse cx="44" cy="72" rx="7" ry="4" fill="rgba(255,120,120,0.38)" />
        <ellipse cx="76" cy="72" rx="7" ry="4" fill="rgba(255,120,120,0.38)" />
        {/* Happy crescent eyes */}
        <path d="M 44 61 Q 49 55 54 61" {...stroke} strokeWidth={2.5} />
        <path d="M 66 61 Q 71 55 76 61" {...stroke} strokeWidth={2.5} />
        {/* Star glint on right eye */}
        <circle cx="76" cy="58" r="1.5" fill="rgba(255,255,255,0.9)" />
        {/* Big open smile */}
        <path d="M 46 73 Q 60 88 74 73" {...stroke} strokeWidth={2.6} />
        {/* Little teeth hint */}
        <path d="M 52 73 L 68 73" stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} />
      </>
    );
  }

  if (mood === "reset") {
    return (
      <>
        {/* Sad brows – inner corners raised */}
        <path d="M 43 54 L 52 51" {...stroke} />
        <path d="M 68 51 L 77 54" {...stroke} />
        {/* Normal eyes */}
        <circle cx="49" cy="61" r="3" fill={ink} />
        <circle cx="71" cy="61" r="3" fill={ink} />
        {/* Teardrop */}
        <path
          d="M 49 66 Q 47 72 49 73 Q 51 72 49 66"
          fill="rgba(120,180,255,0.85)"
        />
        {/* Frown */}
        <path d="M 51 80 Q 60 73 69 80" {...stroke} strokeWidth={2.4} />
      </>
    );
  }

  if (mood === "running") {
    return (
      <>
        {/* Determined brows – angled down toward center */}
        <path d="M 43 52 L 53 55" {...stroke} />
        <path d="M 67 55 L 77 52" {...stroke} />
        {/* Focused squint eyes */}
        <ellipse cx="49" cy="62" rx="4" ry="2.8" fill={ink} />
        <ellipse cx="71" cy="62" rx="4" ry="2.8" fill={ink} />
        {/* Tight determined mouth */}
        <path d="M 53 76 L 67 76" {...stroke} strokeWidth={2.4} />
        {/* Sweat drop */}
        <path
          d="M 78 48 Q 76 53 78 54 Q 80 53 78 48"
          fill="rgba(120,200,255,0.75)"
        />
      </>
    );
  }

  if (mood === "paused") {
    return (
      <>
        {/* Droopy half-closed eyes */}
        <circle cx="49" cy="62" r="3" fill={ink} />
        <circle cx="71" cy="62" r="3" fill={ink} />
        {/* Half-lid lines */}
        <path d="M 46 59 Q 49 58 52 59" {...stroke} strokeWidth={1.8} />
        <path d="M 68 59 Q 71 58 74 59" {...stroke} strokeWidth={1.8} />
        {/* Slight frown */}
        <path d="M 53 78 Q 60 73 67 78" {...stroke} strokeWidth={2} />
        {/* Zzz dots */}
        <circle cx="80" cy="46" r="1.8" fill={ink} opacity={0.5} />
        <circle cx="84" cy="41" r="2.2" fill={ink} opacity={0.4} />
        <circle cx="79" cy="36" r="2.8" fill={ink} opacity={0.3} />
      </>
    );
  }

  /* idle – gentle happy */
  return (
    <>
      <circle cx="49" cy="61" r="3" fill={ink} />
      <circle cx="71" cy="61" r="3" fill={ink} />
      {/* Rosy cheeks */}
      <ellipse cx="43" cy="70" rx="5" ry="3" fill="rgba(255,140,140,0.28)" />
      <ellipse cx="77" cy="70" rx="5" ry="3" fill="rgba(255,140,140,0.28)" />
      {/* Gentle smile */}
      <path d="M 52 75 Q 60 83 68 75" {...stroke} strokeWidth={2.4} />
    </>
  );
}

/* ── Particle burst on completion ────────────────────────────────────── */

const PARTICLE_COLORS = ["#FFD166", "#06D6A0", "#118AB2", "#FF6B6B", "#A78BFA", "#FFB347", "#4ECDC4", "#FF8C94"];

function ParticleBurst() {
  return (
    <>
      {PARTICLE_COLORS.map((color, i) => {
        const angle = (i * 45 * Math.PI) / 180;
        const dist = 62 + (i % 3) * 10;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist;
        const size = 8 + (i % 3) * 4;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              background: color,
              top: "50%",
              left: "50%",
              marginTop: -size / 2,
              marginLeft: -size / 2,
            }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{ x: tx, y: ty, scale: [0, 1.3, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 0.75, delay: i * 0.04, ease: "easeOut" }}
          />
        );
      })}
    </>
  );
}

/* ── Small mood caption ───────────────────────────────────────────────── */

const MOOD_CAPTIONS: Record<MascotMood, string> = {
  idle: "Ready",
  running: "Focused",
  paused: "Resting…",
  completed: "Amazing! 🎉",
  reset: "That's okay",
};

function MoodCaption({ mood }: { mood: MascotMood }) {
  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={mood}
        className="text-xs text-muted-foreground text-center mt-1"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.25 }}
      >
        {MOOD_CAPTIONS[mood]}
      </motion.p>
    </AnimatePresence>
  );
}
