import { TaskList } from "@/components/tasks/TaskList";

export default function TasksPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Tasks</h1>
      <TaskList />
    </div>
  );
}
