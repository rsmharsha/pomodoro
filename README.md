# Pomodoro

A minimal, aesthetic Pomodoro-style study timer. Local-first — all data lives in your browser via IndexedDB.

## Features

- Circular progress timer with focus / short break / long break modes
- Task management with drag-and-drop reordering
- Session logging and stats (daily, weekly, monthly, yearly)
- 10 themes × light/dark (20 variants total)
- Import/export data as JSON
- Splash screen animation on load

## Stack

Next.js 16 · TypeScript · Tailwind CSS · Framer Motion · Zustand · Dexie.js · Recharts · @dnd-kit

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Deploy to Vercel

```bash
npx vercel deploy
```

No environment variables required. The app is fully local-first.

## Data

All data (tasks, sessions, settings) is stored in IndexedDB in your browser. Use **Settings → Export JSON** to back up your data, and **Import JSON** to restore it.
