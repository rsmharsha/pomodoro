"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db, type Task } from "@/lib/db";
import { uuid } from "@/lib/utils";

export function useTasks() {
  const tasks = useLiveQuery(() => db.tasks.orderBy("order").toArray(), []);

  async function addTask(name: string) {
    const all = await db.tasks.orderBy("order").toArray();
    const maxOrder = all.length > 0 ? Math.max(...all.map((t) => t.order)) : -1;
    await db.tasks.add({
      id: uuid(),
      name,
      createdAt: Date.now(),
      completedAt: null,
      archivedAt: null,
      order: maxOrder + 1,
    });
  }

  async function updateTask(id: string, patch: Partial<Task>) {
    await db.tasks.update(id, patch);
  }

  async function deleteTask(id: string) {
    await db.tasks.delete(id);
  }

  async function completeTask(id: string) {
    await db.tasks.update(id, { completedAt: Date.now() });
  }

  async function uncompleteTask(id: string) {
    await db.tasks.update(id, { completedAt: null });
  }

  async function archiveTask(id: string) {
    await db.tasks.update(id, { archivedAt: Date.now() });
  }

  async function unarchiveTask(id: string) {
    await db.tasks.update(id, { archivedAt: null });
  }

  async function reorderTasks(ids: string[]) {
    await db.transaction("rw", db.tasks, async () => {
      for (let i = 0; i < ids.length; i++) {
        await db.tasks.update(ids[i], { order: i });
      }
    });
  }

  return {
    tasks: tasks ?? [],
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    uncompleteTask,
    archiveTask,
    unarchiveTask,
    reorderTasks,
  };
}
