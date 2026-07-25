"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { CheckCircle, Circle, Plus, Trash2, RotateCcw, Calendar, User, ListTodo, TrendingUp, Info } from "lucide-react";
import { createTask, completeTask, reopenTask, deleteTask } from "@/lib/actions/tasks";
import { exportTasksCSV } from "@/lib/actions/export";
import { ExportButton } from "@/components/export-button";
import type { DivisionWithTasks, DivisionTaskSummary } from "@/lib/data/tasks";

interface TasksClientProps {
  divisions: DivisionWithTasks[];
  summaries: DivisionTaskSummary[];
  profile: any;
  assignments: {
    id: string;
    profileId: string;
    fullName: string;
    nim: string;
    divisionId: string;
    divisionName: string;
  }[];
}

const priorityColors: Record<string, string> = {
  high: "text-error border-error bg-error/10",
  medium: "text-amber-600 border-amber-500 bg-amber-50",
  low: "text-emerald-600 border-emerald-500 bg-emerald-50",
};

export function TasksClient({ divisions: initialDivisions, summaries, profile, assignments }: TasksClientProps) {
  const router = useRouter();
  const [activeSupervisor, setActiveSupervisor] = useState<string>("all");
  const [activeDiv, setActiveDiv] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedDivId, setSelectedDivId] = useState<string>("");
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>("");

  const userLevel = profile?.assignment?.level ?? 0;
  const isBph = userLevel >= 70;
  const isCoordinator = userLevel >= 55 && userLevel < 70;
  
  // Find current user's assignment to identify their division
  const userAssignment = assignments.find((a) => a.profileId === profile?.userId);
  const userDivisionId = userAssignment?.divisionId ?? null;

  // Filter divisions based on supervisor selection
  const filteredDivisions = initialDivisions.filter((div) => {
    // division filter
    if (activeDiv && div.id !== activeDiv) return false;

    // supervisor filter
    if (activeSupervisor === "all") return true;
    const nameLower = (div.supervisorName ?? "").toLowerCase();
    if (activeSupervisor === "daren") return nameLower.includes("daren") || nameLower.includes("dareean");
    if (activeSupervisor === "gabriel") return nameLower.includes("gabriel");
    if (activeSupervisor === "reyqal") return nameLower.includes("reyqal");
    return true;
  });

  const allTasks = initialDivisions.flatMap((div) => 
    div.tasks.map((t) => ({ ...t, divisionName: div.name, divisionId: div.id }))
  );

  const timelineTasks = allTasks
    .filter((t) => t.deadline)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

  // Statistics
  const totalTasksCount = allTasks.length;
  const completedTasksCount = allTasks.filter((t) => t.status === "done").length;

  // Supervisor Group stats
  const getSupervisorStats = (nameKey: string) => {
    const supervisedDivs = initialDivisions.filter((div) => {
      const nameLower = (div.supervisorName ?? "").toLowerCase();
      if (nameKey === "daren") return nameLower.includes("daren") || nameLower.includes("dareean");
      return nameLower.includes(nameKey);
    });
    const total = supervisedDivs.reduce((acc, d) => acc + d.totalTasks, 0);
    const done = supervisedDivs.reduce((acc, d) => acc + d.doneTasks, 0);
    return { total, done, divisionsList: supervisedDivs.map((d) => d.name).join(", ") };
  };

  const darenStats = getSupervisorStats("daren");
  const gabrielStats = getSupervisorStats("gabriel");
  const reyqalStats = getSupervisorStats("reyqal");

  async function handleComplete(taskId: string) {
    const result = await completeTask(taskId);
    if (result.error) {
      alert(result.error);
    } else {
      router.refresh();
    }
  }

  async function handleReopen(taskId: string) {
    const result = await reopenTask(taskId);
    if (result.error) {
      alert(result.error);
    } else {
      router.refresh();
    }
  }

  async function handleDelete(taskId: string) {
    if (confirm("Hapus task ini?")) {
      const result = await deleteTask(taskId);
      if (result.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    }
  }

  async function handleCreateTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    
    // Set division explicitly if coordinator (disabled input isn't submitted in FormData)
    if (isCoordinator && userDivisionId) {
      fd.set("division_id", userDivisionId);
    }

    const result = await createTask(null, fd);
    if ((result as any)?.error) {
      alert((result as any).error);
    } else {
      setShowTaskForm(false);
      router.refresh();
    }
  }

  // Get assignees filtered by division
  const getFilteredAssignees = () => {
    const divId = isCoordinator ? userDivisionId : selectedDivId;
    if (!divId) return [];
    return assignments.filter((a) => a.divisionId === divId);
  };

  // Check if current user has edit permission for a division's task
  const canEditTask = (taskDivId: string) => {
    if (isBph) return true;
    if (isCoordinator && userDivisionId === taskDivId) return true;
    return false;
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-accent-magenta font-mono text-xs font-bold tracking-widest uppercase mb-1">
            I-FEST 2026
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
            Task Tracker
          </h1>
          <p className="mt-2 text-base text-on-surface-variant">
            Pantau timeline, tugas, dan progres kerja dari setiap divisi kepanitiaan.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 sm:self-end">
          {(isBph || isCoordinator) && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSelectedDivId(isCoordinator ? userDivisionId ?? "" : initialDivisions[0]?.id ?? "");
                setShowTaskForm(true);
              }}
              className="cursor-pointer font-semibold rounded-full bg-primary text-white flex items-center gap-1.5"
            >
              <Plus className="size-4" /> Tambah Task
            </Button>
          )}
          <ExportButton label="Export CSV" filename="tasks" fetchCsv={exportTasksCSV} />
        </div>
      </div>

      {/* Supervisor Cards Dashboard (Risograph Aesthetics) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daren Card */}
        <div
          onClick={() => setActiveSupervisor(activeSupervisor === "daren" ? "all" : "daren")}
          className={`cursor-pointer rounded-2xl p-6 border-2 transition-all select-none ${
            activeSupervisor === "daren"
              ? "bg-block-mint border-primary scale-[1.02]"
              : "bg-surface-container-low border-outline-variant/60 hover:border-primary/50"
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-on-surface-variant/80 uppercase">SUPERVISI</span>
              <h3 className="text-xl font-black text-on-surface mt-0.5">Daren</h3>
            </div>
            <Badge variant="outline" className="bg-white/80 border-primary/20 text-[10px] font-mono">
              {darenStats.done} / {darenStats.total} TASKS
            </Badge>
          </div>
          <p className="text-xs text-on-surface-variant font-mono mt-3 truncate">
            {darenStats.divisionsList}
          </p>
          <div className="h-1.5 w-full rounded-full bg-white/50 overflow-hidden mt-4">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${darenStats.total > 0 ? (darenStats.done / darenStats.total) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Gabriel Card */}
        <div
          onClick={() => setActiveSupervisor(activeSupervisor === "gabriel" ? "all" : "gabriel")}
          className={`cursor-pointer rounded-2xl p-6 border-2 transition-all select-none ${
            activeSupervisor === "gabriel"
              ? "bg-block-lilac border-primary scale-[1.02]"
              : "bg-surface-container-low border-outline-variant/60 hover:border-primary/50"
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-on-surface-variant/80 uppercase">SUPERVISI</span>
              <h3 className="text-xl font-black text-on-surface mt-0.5">Gabriel</h3>
            </div>
            <Badge variant="outline" className="bg-white/80 border-primary/20 text-[10px] font-mono">
              {gabrielStats.done} / {gabrielStats.total} TASKS
            </Badge>
          </div>
          <p className="text-xs text-on-surface-variant font-mono mt-3 truncate">
            {gabrielStats.divisionsList}
          </p>
          <div className="h-1.5 w-full rounded-full bg-white/50 overflow-hidden mt-4">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${gabrielStats.total > 0 ? (gabrielStats.done / gabrielStats.total) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Reyqal Card */}
        <div
          onClick={() => setActiveSupervisor(activeSupervisor === "reyqal" ? "all" : "reyqal")}
          className={`cursor-pointer rounded-2xl p-6 border-2 transition-all select-none ${
            activeSupervisor === "reyqal"
              ? "bg-block-coral border-primary scale-[1.02]"
              : "bg-surface-container-low border-outline-variant/60 hover:border-primary/50"
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-on-surface-variant/80 uppercase">SUPERVISI</span>
              <h3 className="text-xl font-black text-on-surface mt-0.5">Reyqal</h3>
            </div>
            <Badge variant="outline" className="bg-white/80 border-primary/20 text-[10px] font-mono">
              {reyqalStats.done} / {reyqalStats.total} TASKS
            </Badge>
          </div>
          <p className="text-xs text-on-surface-variant font-mono mt-3 truncate">
            {reyqalStats.divisionsList}
          </p>
          <div className="h-1.5 w-full rounded-full bg-white/50 overflow-hidden mt-4">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${reyqalStats.total > 0 ? (reyqalStats.done / reyqalStats.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2 py-1 items-center justify-between border-b border-outline-variant/30 pb-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeSupervisor === "all" ? "primary" : "ghost"}
            size="sm"
            onClick={() => {
              setActiveSupervisor("all");
              setActiveDiv(null);
            }}
            className="cursor-pointer rounded-full font-mono text-xs uppercase"
          >
            Semua Pengawas
          </Button>
          <Button
            variant={activeSupervisor === "daren" ? "primary" : "ghost"}
            size="sm"
            onClick={() => {
              setActiveSupervisor("daren");
              setActiveDiv(null);
            }}
            className="cursor-pointer rounded-full font-mono text-xs uppercase"
          >
            Daren
          </Button>
          <Button
            variant={activeSupervisor === "gabriel" ? "primary" : "ghost"}
            size="sm"
            onClick={() => {
              setActiveSupervisor("gabriel");
              setActiveDiv(null);
            }}
            className="cursor-pointer rounded-full font-mono text-xs uppercase"
          >
            Gabriel
          </Button>
          <Button
            variant={activeSupervisor === "reyqal" ? "primary" : "ghost"}
            size="sm"
            onClick={() => {
              setActiveSupervisor("reyqal");
              setActiveDiv(null);
            }}
            className="cursor-pointer rounded-full font-mono text-xs uppercase"
          >
            Reyqal
          </Button>
        </div>

        {/* Division Selector Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-on-surface-variant font-mono uppercase">Filter Divisi:</span>
          <select
            value={activeDiv || ""}
            onChange={(e) => setActiveDiv(e.target.value || null)}
            className="text-xs font-mono border border-outline-variant rounded-md bg-white px-2 py-1"
          >
            <option value="">Semua Divisi</option>
            {initialDivisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Division Task Boards & Chronological Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columns 1 & 2: Division Boards */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <ListTodo className="size-5 text-error" />
            <h2 className="text-xl font-bold tracking-tight text-on-surface">Papan Tugas Divisi</h2>
          </div>

          <div className="flex flex-col gap-6">
            {filteredDivisions.length === 0 && (
              <div className="bg-white border border-outline-variant/60 rounded-2xl p-8 text-center">
                <p className="text-sm font-mono text-on-surface-variant">Tidak ada divisi yang sesuai filter.</p>
              </div>
            )}
            
            {filteredDivisions.map((div) => {
              const divProgress = div.totalTasks > 0 ? Math.round((div.doneTasks / div.totalTasks) * 100) : 0;
              return (
                <Card key={div.id} className="bg-white border border-outline-variant/60 rounded-2xl p-6">
                  <CardHeader className="p-0 mb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-lg font-bold text-on-surface">{div.name}</CardTitle>
                          {div.supervisorName && (
                            <Badge variant="outline" className="text-[10px] font-mono border-primary/20 bg-primary/5">
                              Pengawas: {div.supervisorName.split(" ")[0]}
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-xs text-on-surface-variant font-mono mt-1">
                          {div.description || "Tidak ada deskripsi divisi."}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs font-mono shrink-0">
                        {div.doneTasks} / {div.totalTasks} Tasks
                      </Badge>
                    </div>
                  </CardHeader>

                  {/* Progress bar per Division */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant mb-1.5">
                      <span>Progres Tugas</span>
                      <span className="font-bold text-on-surface">{divProgress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-surface-container overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${divProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Task List */}
                  <div className="flex flex-col gap-3 pt-4 border-t border-outline-variant/30">
                    {div.tasks.length === 0 ? (
                      <p className="text-xs text-on-surface-variant font-mono text-center py-2">Belum ada tugas di divisi ini.</p>
                    ) : (
                      div.tasks.map((task) => {
                        const isTaskCreator = canEditTask(div.id);
                        const isTaskAssignee = profile?.userId && assignments.find(a => a.id === task.assigneeId)?.profileId === profile.userId;
                        const canToggleStatus = isTaskCreator || isTaskAssignee;

                        return (
                          <div
                            key={task.id}
                            className={`flex items-start justify-between gap-3 p-3.5 border rounded-xl transition-all ${
                              task.status === "done"
                                ? "bg-surface-container-low/40 border-outline-variant/30 opacity-70"
                                : "bg-white border-outline-variant/60 hover:border-outline-variant"
                            }`}
                          >
                            <div className="flex items-start gap-2.5 min-w-0">
                              <button
                                disabled={!canToggleStatus}
                                onClick={() => (task.status === "done" ? handleReopen(task.id) : handleComplete(task.id))}
                                className={`mt-0.5 shrink-0 transition-colors ${
                                  canToggleStatus ? "cursor-pointer text-primary hover:text-accent-magenta" : "text-on-surface-variant/40"
                                }`}
                              >
                                {task.status === "done" ? (
                                  <CheckCircle className="size-5 text-emerald-600 fill-emerald-100" />
                                ) : (
                                  <Circle className="size-5" />
                                )}
                              </button>
                              <div className="min-w-0">
                                <p className={`text-sm font-bold leading-tight ${task.status === "done" ? "line-through text-on-surface-variant" : "text-on-surface"}`}>
                                  {task.title}
                                </p>
                                {task.description && (
                                  <p className="text-xs text-on-surface-variant font-sans mt-1">
                                    {task.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  {task.priority && (
                                    <Badge variant="outline" className={`text-[9px] font-mono border px-1.5 py-0 ${priorityColors[task.priority]}`}>
                                      {task.priority.toUpperCase()}
                                    </Badge>
                                  )}
                                  {task.deadline && (
                                    <span className="text-[10px] font-mono text-on-surface-variant/80 flex items-center gap-0.5">
                                      <Calendar className="size-3" />
                                      {new Date(task.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                                    </span>
                                  )}
                                  {task.assigneeName && (
                                    <span className="text-[10px] font-mono text-primary flex items-center gap-0.5">
                                      <User className="size-3" />
                                      {task.assigneeName.split(" ")[0]}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Delete Button for Creator/BPH */}
                            {canEditTask(div.id) && (
                              <button
                                onClick={() => handleDelete(task.id)}
                                className="cursor-pointer text-on-surface-variant/40 hover:text-error shrink-0 p-1 transition-colors"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Column 3: Chronological Timeline */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-error" />
            <h2 className="text-xl font-bold tracking-tight text-on-surface">Timeline Kerja</h2>
          </div>

          <Card className="bg-white border border-outline-variant/60 rounded-2xl p-6">
            <p className="text-xs text-on-surface-variant font-mono uppercase tracking-wider mb-4">Urutan Deadline Tugas</p>
            
            {timelineTasks.length === 0 ? (
              <div className="text-center py-8">
                <Info className="size-8 text-on-surface-variant/30 mx-auto mb-2" />
                <p className="text-xs font-mono text-on-surface-variant">Tidak ada deadline aktif.</p>
              </div>
            ) : (
              <div className="relative pl-4 border-l border-primary/20 flex flex-col gap-6 py-2">
                {timelineTasks.map((task) => {
                  const isOverdue = new Date(task.deadline!).getTime() < Date.now() && task.status !== "done";
                  
                  return (
                    <div key={task.id} className="relative group">
                      {/* Timeline node */}
                      <span className={`absolute -left-[21px] top-1.5 size-2.5 rounded-full border-2 border-white ${
                        task.status === "done" 
                          ? "bg-emerald-500" 
                          : isOverdue 
                            ? "bg-error" 
                            : "bg-amber-400"
                      }`} />
                      
                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono text-accent-magenta font-bold tracking-wide uppercase">
                            {task.divisionName}
                          </span>
                          <span className={`text-[9px] font-mono ${isOverdue ? "text-error font-bold" : "text-on-surface-variant"}`}>
                            {new Date(task.deadline!).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                        <p className={`text-sm font-bold mt-1 leading-snug truncate ${task.status === "done" ? "line-through text-on-surface-variant" : "text-on-surface"}`}>
                          {task.title}
                        </p>
                        {task.assigneeName && (
                          <p className="text-[10px] font-mono text-on-surface-variant mt-1">
                            PJ: {task.assigneeName}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

      </div>

      {/* Task Creation Modal */}
      <Modal open={showTaskForm} title="Tambah Tugas Baru" onClose={() => setShowTaskForm(false)}>
          <form onSubmit={handleCreateTask} className="flex flex-col gap-4 py-2">
            
            {/* Division Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold text-on-surface uppercase">Divisi Pelaksana</label>
              {isCoordinator ? (
                <Input
                  disabled
                  value={initialDivisions.find((d) => d.id === userDivisionId)?.name ?? ""}
                  className="font-mono text-sm bg-surface-container"
                />
              ) : (
                <select
                  name="division_id"
                  required
                  value={selectedDivId}
                  onChange={(e) => setSelectedDivId(e.target.value)}
                  className="w-full text-sm font-sans border border-outline-variant rounded-md bg-white px-3 py-2"
                >
                  {initialDivisions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Task Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold text-on-surface uppercase">Judul Tugas</label>
              <Input
                name="title"
                required
                placeholder="Tuliskan nama tugas..."
                className="text-sm rounded-md"
              />
            </div>

            {/* Task Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold text-on-surface uppercase">Deskripsi (Opsional)</label>
              <textarea
                name="description"
                placeholder="Detail instruksi/keterangan tugas..."
                rows={3}
                className="w-full text-sm font-sans border border-outline-variant rounded-md bg-white p-3 focus:outline-none focus:border-accent-magenta"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-bold text-on-surface uppercase">Prioritas</label>
                <select
                  name="priority"
                  className="w-full text-sm border border-outline-variant rounded-md bg-white px-3 py-2"
                >
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Deadline */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-bold text-on-surface uppercase">Deadline (Opsional)</label>
                <input
                  type="date"
                  name="deadline"
                  className="w-full text-sm border border-outline-variant rounded-md bg-white px-3 py-2 focus:outline-none"
                />
              </div>
            </div>

            {/* Assignee Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold text-on-surface uppercase">Penanggung Jawab (Opsional)</label>
              <select
                name="assignee_id"
                value={selectedAssigneeId}
                onChange={(e) => setSelectedAssigneeId(e.target.value)}
                className="w-full text-sm border border-outline-variant rounded-md bg-white px-3 py-2"
              >
                <option value="">-- Pilih PJ --</option>
                {getFilteredAssignees().map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.fullName} ({a.nim})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-outline-variant/30">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowTaskForm(false)}
                className="cursor-pointer text-xs rounded-full font-mono uppercase"
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="cursor-pointer text-xs rounded-full font-mono uppercase"
              >
                Simpan Tugas
              </Button>
            </div>
          </form>
        </Modal>
      </div>
  );
}
