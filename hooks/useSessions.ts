"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db, type Session } from "@/lib/db";
import { uuid } from "@/lib/utils";

export function useSessions() {
  const sessions = useLiveQuery(
    () => db.sessions.orderBy("startedAt").toArray(),
    []
  );

  async function logSession(session: Omit<Session, "id">) {
    await db.sessions.add({ ...session, id: uuid() });
  }

  return { sessions: sessions ?? [], logSession };
}
