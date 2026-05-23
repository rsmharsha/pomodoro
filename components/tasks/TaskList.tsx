"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AnimatePresence } from "framer-motion";
import { useTasks } from "@/hooks/useTasks";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TaskRow } from "@/components/tasks/TaskRow";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function TaskList() {
  const [tab, setTab] = useState<"active" | "completed" | "archived">("active");
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    uncompleteTask,
    archiveTask,
    unarchiveTask,
    reorderTasks,
  } = useTasks();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const activeTasks = tasks.filter((t) => !t.completedAt && !t.archivedAt);
  const completedTasks = tasks
    .filter((t) => !!t.completedAt && !t.archivedAt)
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));
  const archivedTasks = tasks.filter((t) => !!t.archivedAt);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = activeTasks.findIndex((t) => t.id === active.id);
    const newIndex = activeTasks.findIndex((t) => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...activeTasks];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    reorderTasks(reordered.map((t) => t.id));
  }

  const tabTasks = { active: activeTasks, completed: completedTasks, archived: archivedTasks }[tab];

  return (
    <div className="flex flex-col gap-4">
      <TaskForm onSubmit={addTask} />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="w-full">
          <TabsTrigger value="active" className="flex-1">
            Active <span className="ml-1.5 text-xs text-muted-foreground">({activeTasks.length})</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">
            Completed <span className="ml-1.5 text-xs text-muted-foreground">({completedTasks.length})</span>
          </TabsTrigger>
          <TabsTrigger value="archived" className="flex-1">
            Archived <span className="ml-1.5 text-xs text-muted-foreground">({archivedTasks.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-3">
          {tabTasks.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {tab === "active" ? "No tasks yet — add one above" : `No ${tab} tasks`}
            </p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={tabTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2">
                  <AnimatePresence initial={false}>
                    {tabTasks.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        tab={tab}
                        onComplete={completeTask}
                        onUncomplete={uncompleteTask}
                        onArchive={archiveTask}
                        onUnarchive={unarchiveTask}
                        onDelete={deleteTask}
                        onUpdate={(id, name) => updateTask(id, { name })}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </SortableContext>
            </DndContext>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
