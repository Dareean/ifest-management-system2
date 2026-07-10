"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ColorBlock } from "@/components/blocks/color-block";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { CheckCircle, Circle, Plus, Trash2, RotateCcw, Flag } from "lucide-react";
import { createTask, completeTask, reopenTask, deleteTask } from "@/lib/actions/tasks";
import type { KpiWithTasks, DivisionKpiSummary } from "@/lib/data/kpi";

const priorityColors: Record<string, string> = {
  high: "text-red-500",
  medium: "text-amber-500",
  low: "text-gray-400",
};

const priorityLabels: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function KpiClient({ kpis: initialKpis, summaries }: { kpis: KpiWithTasks[]; summaries: DivisionKpiSummary[] }) {
  const router = useRouter();
  const [activeDiv, setActiveDiv] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskKpiId, setTaskKpiId] = useState<string | null>(null);
  const [taskDivId, setTaskDivId] = useState<string | null>(null);
  const [taskFormAction, setTaskFormAction] = useState<((formData: FormData) => void) | null>(null);

  // Client-side filtering
  const filteredKpis = activeDiv
    ? initialKpis.filter((k) => k.divisionId === activeDiv)
    : initialKpis;

  const activeSummary = activeDiv
    ? summaries.find((s) => s.divisionId === activeDiv)
    : null;

  const filteredSummaries = activeDiv
    ? summaries.filter((s) => s.divisionId === activeDiv)
    : summaries;

  async function handleComplete(taskId: string) {
    if (confirm("Tandai task ini selesai?")) {
      const result = await completeTask(taskId);
      if (!result.error) router.refresh();
    }
  }

  async function handleReopen(taskId: string) {
    const result = await reopenTask(taskId);
    if (!result.error) router.refresh();
  }

  async function handleDelete(taskId: string) {
    if (confirm("Hapus task ini?")) {
      const result = await deleteTask(taskId);
      if (!result.error) router.refresh();
    }
  }

  async function handleCreateTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const result = await createTask(null, fd);
    if ((result as any)?.error) {
      alert((result as any).error);
    } else {
      setShowTaskForm(false);
      router.refresh();
    }
  }

  const totalKpis = initialKpis.length;
  const totalTasks = initialKpis.reduce((acc, k) => acc + k.totalTasks, 0);
  const doneTasks = initialKpis.reduce((acc, k) => acc + k.doneTasks, 0);

  return (
    <div className="flex flex-col gap-section-gap">
      {/* Header */}
      <div>
        <p className="eyebrow text-on-surface-variant">I-FEST 2026</p>
        <h1 className="text-4xl font-semibold tracking-tight leading-none">KPI Tracker</h1>
        <p className="mt-sm text-on-surface-variant">
          Pantau pencapaian KPI dan task setiap divisi.
        </p>
      </div>

      {/* Overview */}
      <ColorBlock color="lilac">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-semibold">{totalKpis}</CardTitle>
              <CardDescription>Total KPI</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-semibold">{totalTasks}</CardTitle>
              <CardDescription>Total Tasks</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-semibold">{doneTasks}/{totalTasks}</CardTitle>
              <CardDescription>Selesai</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </ColorBlock>

      {/* Divisi Filter */}
      <div className="flex flex-wrap gap-sm">
        <Button
          variant={activeDiv === null ? "primary" : "ghost"}
          size="sm"
          onClick={() => setActiveDiv(null)}
        >
          Semua Divisi
        </Button>
        {summaries.map((s) => (
          <Button
            key={s.divisionId}
            variant={activeDiv === s.divisionId ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveDiv(s.divisionId)}
          >
            {s.divisionName}
          </Button>
        ))}
      </div>

      {/* Divisi Progress Cards */}
      <ColorBlock color="mint">
        <p className="eyebrow text-on-surface-variant mb-md">
          Ringkasan {activeSummary ? activeSummary.divisionName : "Semua Divisi"}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {(activeDiv ? filteredSummaries : summaries).map((s) => {
            const progress = s.totalTasks > 0 ? Math.round((s.doneTasks / s.totalTasks) * 100) : 0;
            return (
              <Card key={s.divisionId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{s.divisionName}</CardTitle>
                    <Badge variant="outline">{s.totalKpis} KPI</Badge>
                  </div>
                  <CardDescription>
                    {s.milestoneKpis} milestone &middot; {s.doneTasks}/{s.totalTasks} tasks
                  </CardDescription>
                </CardHeader>
                <div className="px-lg pb-lg">
                  <div className="h-2 w-full rounded-full bg-surface-container">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </ColorBlock>

      {/* KPI Detail per Divisi */}
      <ColorBlock color="coral">
        <p className="eyebrow text-on-surface-variant mb-md">
          {activeDiv ? (activeSummary?.divisionName ?? "") : "Semua"} — KPI & Task
        </p>
        <div className="flex flex-col gap-lg">
          {filteredKpis.map((kpi) => {
            const kpiProgress = kpi.totalTasks > 0
              ? Math.round((kpi.doneTasks / kpi.totalTasks) * 100)
              : 0;

            return (
              <Card key={kpi.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-sm">
                        <CardTitle className="text-base">{kpi.title}</CardTitle>
                        {kpi.isMilestone && <Badge variant="warning">Milestone</Badge>}
                      </div>
                      <CardDescription className="mt-xs">
                        {kpi.target.length > 150 ? kpi.target.slice(0, 150) + "..." : kpi.target}
                      </CardDescription>
                      {kpi.deadline && (
                        <p className="caption text-on-surface-variant mt-xs">
                          Deadline: {new Date(kpi.deadline).toLocaleDateString("id-ID", {
                            day: "numeric", month: "long", year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline">
                      {kpi.doneTasks}/{kpi.totalTasks}
                    </Badge>
                  </div>
                </CardHeader>

                {/* Progress bar per KPI */}
                <div className="px-lg pb-sm">
                  <div className="h-1.5 w-full rounded-full bg-surface-container">
                    <div
                      className="h-1.5 rounded-full bg-primary transition-all"
                      style={{ width: `${kpiProgress}%` }}
                    />
                  </div>
                </div>

                {/* Task list */}
                <div className="px-lg pb-lg">
                  {kpi.tasks.length > 0 && (
                    <div className="space-y-1 mb-sm">
                      {kpi.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-sm py-1 px-2 rounded-md hover:bg-surface-container/50 transition-colors group"
                        >
                          <button
                            onClick={() => task.status === "done" ? handleReopen(task.id) : handleComplete(task.id)}
                            className="flex-shrink-0"
                          >
                            {task.status === "done" ? (
                              <CheckCircle className="size-4 text-emerald-500" />
                            ) : (
                              <Circle className="size-4 text-on-surface-variant" />
                            )}
                          </button>
                          <span className={`flex-1 text-sm ${task.status === "done" ? "line-through text-on-surface-variant" : ""}`}>
                            {task.title}
                          </span>
                          <Flag className={`size-3 ${priorityColors[task.priority] ?? ""}`} />
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                          >
                            <Trash2 className="size-3 text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setTaskKpiId(kpi.id);
                      setTaskDivId(kpi.divisionId);
                      setShowTaskForm(true);
                    }}
                    className="flex items-center gap-1 text-xs text-accent-magenta hover:underline mt-1"
                  >
                    <Plus className="size-3" />
                    Tambah Task
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </ColorBlock>

      {/* Task Form Modal */}
      <Modal open={showTaskForm} onClose={() => setShowTaskForm(false)} title="Tambah Task">
        <form onSubmit={handleCreateTask} className="flex flex-col gap-md">
          <input type="hidden" name="kpi_item_id" value={taskKpiId ?? ""} />
          <input type="hidden" name="division_id" value={taskDivId ?? ""} />
          <div>
            <label className="caption block mb-xs text-on-surface-variant">Judul Task</label>
            <Input name="title" required placeholder="Contoh: Buat draft proposal" />
          </div>
          <div>
            <label className="caption block mb-xs text-on-surface-variant">Deskripsi</label>
            <textarea
              name="description"
              className="flex min-h-[80px] w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface placeholder:text-on-surface-variant focus:border-accent-magenta focus:outline-none resize-y"
              placeholder="Deskripsi opsional..."
            />
          </div>
          <div className="flex gap-md">
            <div className="flex-1">
              <label className="caption block mb-xs text-on-surface-variant">Prioritas</label>
              <select
                name="priority"
                className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:border-accent-magenta focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium" selected>Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="caption block mb-xs text-on-surface-variant">Deadline</label>
              <Input name="deadline" type="date" />
            </div>
          </div>
          <div className="flex gap-sm justify-end">
            <Button type="button" variant="ghost" onClick={() => setShowTaskForm(false)}>Batal</Button>
            <Button type="submit">Tambah Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
