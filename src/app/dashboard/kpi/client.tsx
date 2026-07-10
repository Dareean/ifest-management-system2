"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { CheckCircle, Circle, Plus, Trash2, RotateCcw, Flag, TrendingUp, Target } from "lucide-react";
import { createTask, completeTask, reopenTask, deleteTask } from "@/lib/actions/tasks";
import { exportKpiCSV } from "@/lib/actions/export";
import { ExportButton } from "@/components/export-button";
import type { KpiWithTasks, DivisionKpiSummary } from "@/lib/data/kpi";

const priorityColors: Record<string, string> = {
  high: "text-error",
  medium: "text-accent-coral",
  low: "text-on-surface-variant/60",
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
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-accent-magenta font-mono text-xs font-bold tracking-widest uppercase mb-1">
            I-FEST 2026
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
            KPI Tracker
          </h1>
          <p className="mt-2 text-base text-on-surface-variant">
            Pantau pencapaian KPI dan task setiap divisi.
          </p>
        </div>
        <div className="shrink-0 sm:self-end">
          <ExportButton label="Export CSV" filename="kpi" fetchCsv={exportKpiCSV} />
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Card 1: Total KPI */}
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6 transition-all hover:border-outline-variant">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">TOTAL KPI</p>
          <p className="text-4xl font-black text-on-surface my-2 leading-none">{totalKpis}</p>
          <p className="text-xs text-on-surface-variant font-mono">Ditetapkan</p>
        </div>

        {/* Card 2: Total Tasks */}
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6 transition-all hover:border-outline-variant">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">TOTAL TASKS</p>
          <p className="text-4xl font-black text-on-surface my-2 leading-none">{totalTasks}</p>
          <p className="text-xs text-on-surface-variant font-mono">Task dikelola</p>
        </div>

        {/* Card 3: Selesai */}
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6 transition-all hover:border-outline-variant">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">TASK SELESAI</p>
          <p className="text-4xl font-black text-on-surface my-2 leading-none">{doneTasks} / {totalTasks}</p>
          <p className="text-xs text-on-surface-variant font-mono">Tugas terselesaikan</p>
        </div>
      </div>

      {/* Divisi Filter */}
      <div className="flex flex-wrap gap-2 py-1">
        <Button
          variant={activeDiv === null ? "primary" : "ghost"}
          size="sm"
          onClick={() => setActiveDiv(null)}
          className="cursor-pointer"
        >
          Semua Divisi
        </Button>
        {summaries.map((s) => (
          <Button
            key={s.divisionId}
            variant={activeDiv === s.divisionId ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveDiv(s.divisionId)}
            className="cursor-pointer"
          >
            {s.divisionName}
          </Button>
        ))}
      </div>

      {/* Divisi Progress Cards */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-5 text-error" />
          <h2 className="text-xl font-bold tracking-tight text-on-surface">
            Ringkasan {activeSummary ? activeSummary.divisionName : "Semua Divisi"}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeDiv ? filteredSummaries : summaries).map((s) => {
            const progress = s.totalTasks > 0 ? Math.round((s.doneTasks / s.totalTasks) * 100) : 0;
            return (
              <Card key={s.divisionId} className="bg-white border border-outline-variant/60 rounded-2xl">
                <CardHeader className="p-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold">{s.divisionName}</CardTitle>
                    <Badge variant="outline" className="text-[10px] font-mono">{s.totalKpis} KPI</Badge>
                  </div>
                  <CardDescription className="text-xs font-mono mt-1">
                    {s.milestoneKpis} milestone &middot; {s.doneTasks}/{s.totalTasks} tasks
                  </CardDescription>
                </CardHeader>
                <div className="px-6 pb-6">
                  <div className="h-1.5 w-full rounded-full bg-surface-container overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* KPI Detail per Divisi */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Target className="size-5 text-error" />
          <h2 className="text-xl font-bold tracking-tight text-on-surface">
            {activeDiv ? (activeSummary?.divisionName ?? "") : "Semua"} — KPI & Task
          </h2>
        </div>

        <div className="flex flex-col gap-6">
          {filteredKpis.length === 0 && (
            <div className="bg-white border border-outline-variant/60 rounded-2xl p-8 text-center">
              <p className="text-sm font-mono text-on-surface-variant">Belum ada KPI untuk divisi ini.</p>
            </div>
          )}
          {filteredKpis.map((kpi) => {
            const kpiProgress = kpi.totalTasks > 0
              ? Math.round((kpi.doneTasks / kpi.totalTasks) * 100)
              : 0;

            return (
              <Card key={kpi.id} className="bg-white border border-outline-variant/60 rounded-2xl p-6">
                <CardHeader className="p-0 mb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-base font-bold text-on-surface">{kpi.title}</CardTitle>
                        {kpi.isMilestone && <Badge variant="warning" className="text-[10px] font-mono px-2 py-0.5">Milestone</Badge>}
                      </div>
                      <CardDescription className="mt-2 text-sm text-on-surface-variant font-sans">
                        {kpi.target}
                      </CardDescription>
                      {kpi.deadline && (
                        <p className="caption text-xs text-on-surface-variant mt-2 font-mono">
                          Deadline: {new Date(kpi.deadline).toLocaleDateString("id-ID", {
                            day: "numeric", month: "long", year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs font-mono shrink-0">
                      {kpi.doneTasks}/{kpi.totalTasks} Tasks
                    </Badge>
                  </div>
                </CardHeader>

                {/* Progress bar per KPI */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant mb-1.5">
                    <span>Progress KPI</span>
                    <span className="font-bold text-on-surface">{kpiProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-surface-container overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${kpiProgress}%` }}
                    />
                  </div>
                </div>

                {/* Task list */}
                <div className="pt-2 border-t border-outline-variant/30">
                  {kpi.tasks.length > 0 ? (
                    <div className="space-y-1.5 mb-3">
                      {kpi.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 py-1.5 px-3 rounded-lg hover:bg-surface-container/30 transition-colors group"
                        >
                          <button
                            onClick={() => task.status === "done" ? handleReopen(task.id) : handleComplete(task.id)}
                            className="flex-shrink-0 cursor-pointer"
                          >
                            {task.status === "done" ? (
                              <CheckCircle className="size-4 text-accent-green" />
                            ) : (
                              <Circle className="size-4 text-on-surface-variant" />
                            )}
                          </button>
                          <span className={`flex-1 text-sm font-sans ${task.status === "done" ? "line-through text-on-surface-variant/70" : "text-on-surface"}`}>
                            {task.title}
                          </span>
                          <Flag className={`size-3.5 ${priorityColors[task.priority] ?? ""}`} />
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer hover:bg-error-container/20 rounded"
                          >
                            <Trash2 className="size-3.5 text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs font-mono text-on-surface-variant mb-3">Belum ada task ditambahkan.</p>
                  )}

                  <button
                    onClick={() => {
                      setTaskKpiId(kpi.id);
                      setTaskDivId(kpi.divisionId);
                      setShowTaskForm(true);
                    }}
                    className="flex items-center gap-1 text-xs text-accent-magenta hover:underline font-semibold font-sans mt-2 cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    Tambah Task
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Task Form Modal */}
      <Modal open={showTaskForm} onClose={() => setShowTaskForm(false)} title="Tambah Task">
        <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
          <input type="hidden" name="kpi_item_id" value={taskKpiId ?? ""} />
          <input type="hidden" name="division_id" value={taskDivId ?? ""} />
          <div>
            <label className="caption block mb-1 text-on-surface-variant">Judul Task</label>
            <Input name="title" required placeholder="Contoh: Buat draft proposal" />
          </div>
          <div>
            <label className="caption block mb-1 text-on-surface-variant">Deskripsi</label>
            <textarea
              name="description"
              className="flex min-h-[80px] w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface placeholder:text-on-surface-variant focus:border-accent-magenta focus:outline-none resize-y"
              placeholder="Deskripsi opsional..."
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="caption block mb-1 text-on-surface-variant">Prioritas</label>
              <select
                name="priority"
                className="flex h-11 w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface focus:border-accent-magenta focus:outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%231d1b1d%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-10"
              >
                <option value="low">Low</option>
                <option value="medium" selected>Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="caption block mb-1 text-on-surface-variant">Deadline</label>
              <Input name="deadline" type="date" />
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <Button type="button" variant="ghost" onClick={() => setShowTaskForm(false)} className="cursor-pointer">
              Batal
            </Button>
            <Button type="submit" className="cursor-pointer">
              Tambah Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
