import { getUserTasks } from "@/lib/data/personal-dashboard";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

export async function PersonalTasks({ assignmentId }: { assignmentId: string }) {
  const tasks = await getUserTasks(assignmentId);

  return (
    <div className="flex flex-col gap-3">
      {tasks.length === 0 && (
        <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 text-center">
          <p className="text-sm font-mono text-on-surface-variant">Belum ada task.</p>
        </div>
      )}
      {tasks.slice(0, 5).map((task) => (
        <div key={task.id} className="bg-white border border-outline-variant/60 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className={`text-sm font-bold text-on-surface truncate ${task.status === "done" ? "line-through text-on-surface-variant/70" : ""}`}>
              {task.title}
            </p>
            <p className="text-xs text-on-surface-variant truncate mt-0.5 font-mono">
              {task.kpi}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant={task.priority === "high" ? "danger" : task.priority === "medium" ? "warning" : "secondary"} className="text-[9px] font-mono px-2 py-0">
              {task.priority.toUpperCase()}
            </Badge>
            <Badge variant={task.status === "done" ? "success" : "warning"} className="text-[9px] font-mono px-2 py-0">
              {task.status === "done" ? "Done" : "Open"}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
