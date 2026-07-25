"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle2, Circle, Plus, Trash2, Calendar, User, 
  ListTodo, TrendingUp, Info, ShieldAlert, Sparkles, Send, ArrowRight
} from "lucide-react";
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

const priorityClasses: Record<string, string> = {
  high: "text-rose-600 bg-rose-50 border border-rose-100",
  medium: "text-amber-600 bg-amber-50 border border-amber-100",
  low: "text-emerald-600 bg-emerald-50 border border-emerald-100",
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
  
  const userAssignment = assignments.find((a) => a.profileId === profile?.userId);
  const userDivisionId = userAssignment?.divisionId ?? null;

  // Filter divisions
  const filteredDivisions = initialDivisions.filter((div) => {
    if (activeDiv && div.id !== activeDiv) return false;

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

  const totalTasksCount = allTasks.length;
  const completedTasksCount = allTasks.filter((t) => t.status === "done").length;

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

  const getFilteredAssignees = () => {
    const divId = isCoordinator ? userDivisionId : selectedDivId;
    if (!divId) return [];
    return assignments.filter((a) => a.divisionId === divId);
  };

  const canEditTask = (taskDivId: string) => {
    if (isBph) return true;
    if (isCoordinator && userDivisionId === taskDivId) return true;
    return false;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex flex-col gap-8 pb-16">
      
      {/* Decorative gradient blur in background */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-80 h-80 bg-rose-200/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Panel */}
      <div className="relative bg-white/75 backdrop-blur-md border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-primary/5 text-primary text-xs font-mono font-bold tracking-widest px-2.5 py-1 rounded-full uppercase border border-primary/10">
              I-FEST 2026
            </span>
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              <Sparkles className="size-3" /> Live Sync
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Task Timeline Tracker
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl font-normal">
            Pemantauan timeline terarah, delegasi tugas dinamis, dan sistem koordinasi terpadu di bawah pimpinan BPH Inti.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 md:self-center">
          {(isBph || isCoordinator) && (
            <Button
              onClick={() => {
                setSelectedDivId(isCoordinator ? userDivisionId ?? "" : initialDivisions[0]?.id ?? "");
                setShowTaskForm(true);
              }}
              className="cursor-pointer font-semibold rounded-full bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-sm flex items-center gap-1.5 px-4 py-2 border-0 transition-all hover:scale-[1.02]"
            >
              <Plus className="size-4" /> Tambah Task
            </Button>
          )}
          <ExportButton label="Export CSV" filename="tasks" fetchCsv={exportTasksCSV} />
        </div>
      </div>

      {/* Supervision Grid - Sleek Glassmorphic Overhaul */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Daren Card */}
        <div
          onClick={() => setActiveSupervisor(activeSupervisor === "daren" ? "all" : "daren")}
          className={`group cursor-pointer rounded-3xl p-6 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-48 ${
            activeSupervisor === "daren"
              ? "bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/30 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/5"
              : "bg-white border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md"
          }`}
        >
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">SUPERVISI DIVISI</span>
                <h3 className="text-xl font-bold text-slate-800 mt-0.5 group-hover:text-emerald-700 transition-colors">Daren</h3>
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full font-mono font-bold text-[10px] shrink-0 whitespace-nowrap">
                {darenStats.done}/{darenStats.total} Done
              </Badge>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-3 line-clamp-2">
              Mengawasi divisi: <span className="font-semibold text-slate-600">{darenStats.divisionsList}</span>
            </p>
          </div>
          
          <div className="mt-4">
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
                style={{ width: `${darenStats.total > 0 ? (darenStats.done / darenStats.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Gabriel Card */}
        <div
          onClick={() => setActiveSupervisor(activeSupervisor === "gabriel" ? "all" : "gabriel")}
          className={`group cursor-pointer rounded-3xl p-6 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-48 ${
            activeSupervisor === "gabriel"
              ? "bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border-indigo-500/30 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-500/5"
              : "bg-white border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md"
          }`}
        >
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">SUPERVISI DIVISI</span>
                <h3 className="text-xl font-bold text-slate-800 mt-0.5 group-hover:text-indigo-700 transition-colors">Gabriel</h3>
              </div>
              <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full font-mono font-bold text-[10px] shrink-0 whitespace-nowrap">
                {gabrielStats.done}/{gabrielStats.total} Done
              </Badge>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-3 line-clamp-2">
              Mengawasi divisi: <span className="font-semibold text-slate-600">{gabrielStats.divisionsList}</span>
            </p>
          </div>

          <div className="mt-4">
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-500"
                style={{ width: `${gabrielStats.total > 0 ? (gabrielStats.done / gabrielStats.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Reyqal Card */}
        <div
          onClick={() => setActiveSupervisor(activeSupervisor === "reyqal" ? "all" : "reyqal")}
          className={`group cursor-pointer rounded-3xl p-6 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-48 ${
            activeSupervisor === "reyqal"
              ? "bg-gradient-to-br from-rose-500/10 via-orange-500/5 to-transparent border-rose-500/30 ring-2 ring-rose-500/20 shadow-lg shadow-rose-500/5"
              : "bg-white border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md"
          }`}
        >
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">SUPERVISI DIVISI</span>
                <h3 className="text-xl font-bold text-slate-800 mt-0.5 group-hover:text-rose-700 transition-colors">Reyqal</h3>
              </div>
              <Badge className="bg-rose-50 text-rose-700 border border-rose-100 rounded-full font-mono font-bold text-[10px] shrink-0 whitespace-nowrap">
                {reyqalStats.done}/{reyqalStats.total} Done
              </Badge>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-3 line-clamp-2">
              Mengawasi divisi: <span className="font-semibold text-slate-600">{reyqalStats.divisionsList}</span>
            </p>
          </div>

          <div className="mt-4">
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-400 to-orange-500 transition-all duration-500"
                style={{ width: `${reyqalStats.total > 0 ? (reyqalStats.done / reyqalStats.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar with Sleek Glass Look */}
      <div className="flex flex-col sm:flex-row gap-4 py-2 items-start sm:items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex flex-wrap gap-1.5 bg-slate-100/60 p-1 rounded-full border border-slate-200/20">
          <button
            onClick={() => { setActiveSupervisor("all"); setActiveDiv(null); }}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold font-sans transition-all ${
              activeSupervisor === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => { setActiveSupervisor("daren"); setActiveDiv(null); }}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold font-sans transition-all ${
              activeSupervisor === "daren" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Daren
          </button>
          <button
            onClick={() => { setActiveSupervisor("gabriel"); setActiveDiv(null); }}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold font-sans transition-all ${
              activeSupervisor === "gabriel" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Gabriel
          </button>
          <button
            onClick={() => { setActiveSupervisor("reyqal"); setActiveDiv(null); }}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold font-sans transition-all ${
              activeSupervisor === "reyqal" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Reyqal
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono uppercase">Filter Divisi:</span>
          <select
            value={activeDiv || ""}
            onChange={(e) => setActiveDiv(e.target.value || null)}
            className="text-xs font-semibold border border-slate-200/80 rounded-full bg-white px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer shadow-sm text-slate-700"
          >
            <option value="">Semua Divisi</option>
            {initialDivisions.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Boards Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Task Board */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-900/5 rounded-xl border border-slate-900/10 text-slate-800">
              <ListTodo className="size-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800">Daftar Tugas Divisi</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDivisions.length === 0 && (
              <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
                <Info className="size-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500">Tidak ada divisi yang sesuai dengan filter saat ini.</p>
              </div>
            )}
            
            {filteredDivisions.map((div) => {
              const divProgress = div.totalTasks > 0 ? Math.round((div.doneTasks / div.totalTasks) * 100) : 0;
              return (
                <div key={div.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                  
                  {/* Div Header */}
                  <div className="flex items-start justify-between gap-4 border-b border-slate-50 pb-4 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-lg font-bold text-slate-800 leading-tight">{div.name}</h3>
                        {div.supervisorName && (
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/40">
                            PIC: {div.supervisorName.split(" ")[0]}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-sans font-normal">
                        {div.description || "Divisi operasional I-FEST 2026."}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono font-bold text-slate-500 border-slate-200 bg-slate-50/50 shrink-0 whitespace-nowrap">
                      {div.doneTasks} / {div.totalTasks} Tasks
                    </Badge>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-6 space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 font-sans">
                      <span>Progres Penyelesaian</span>
                      <span className="font-bold text-slate-800">{divProgress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-slate-900 to-slate-700 transition-all duration-500"
                        style={{ width: `${divProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Task List */}
                  <div className="space-y-3">
                    {div.tasks.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-slate-100 rounded-2xl bg-slate-50/20">
                        <p className="text-xs text-slate-400 font-sans">Belum ada tugas terdaftar. Klik + Tambah Task di atas.</p>
                      </div>
                    ) : (
                      div.tasks.map((task) => {
                        const isTaskCreator = canEditTask(div.id);
                        const isTaskAssignee = profile?.userId && assignments.find(a => a.id === task.assigneeId)?.profileId === profile.userId;
                        const canToggleStatus = isTaskCreator || isTaskAssignee;

                        return (
                          <div
                            key={task.id}
                            className={`flex items-start justify-between gap-3 p-4 border rounded-2xl transition-all duration-200 ${
                              task.status === "done"
                                ? "bg-slate-50/30 border-slate-100 opacity-60"
                                : "bg-white border-slate-100/80 hover:border-slate-200 shadow-sm hover:shadow"
                            }`}
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <button
                                disabled={!canToggleStatus}
                                onClick={() => (task.status === "done" ? handleReopen(task.id) : handleComplete(task.id))}
                                className={`mt-0.5 shrink-0 transition-all ${
                                  canToggleStatus ? "cursor-pointer text-slate-400 hover:text-slate-900 scale-105 active:scale-95" : "text-slate-300"
                                }`}
                              >
                                {task.status === "done" ? (
                                  <CheckCircle2 className="size-5 text-emerald-500 fill-emerald-50" />
                                ) : (
                                  <Circle className="size-5" />
                                )}
                              </button>
                              
                              <div className="min-w-0 space-y-1">
                                <p className={`text-sm font-bold leading-snug ${task.status === "done" ? "line-through text-slate-400 font-medium" : "text-slate-800"}`}>
                                  {task.title}
                                </p>
                                {task.description && (
                                  <p className="text-xs text-slate-500 font-sans font-normal leading-relaxed">
                                    {task.description}
                                  </p>
                                )}
                                
                                <div className="flex items-center gap-3 pt-1 flex-wrap">
                                  {task.priority && (
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${priorityClasses[task.priority]}`}>
                                      {task.priority}
                                    </span>
                                  )}
                                  {task.deadline && (
                                    <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                                      <Calendar className="size-3.5" />
                                      {new Date(task.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                                    </span>
                                  )}
                                  {task.assigneeName && (
                                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                                      <span className="size-4 rounded-full bg-slate-200 text-slate-700 text-[8px] flex items-center justify-center font-bold">
                                        {getInitials(task.assigneeName)}
                                      </span>
                                      {task.assigneeName.split(" ")[0]}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {canEditTask(div.id) && (
                              <button
                                onClick={() => handleDelete(task.id)}
                                className="cursor-pointer text-slate-300 hover:text-rose-500 shrink-0 p-1 rounded-lg hover:bg-rose-50 transition-all duration-200"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Premium Roadmap Timeline */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-900/5 rounded-xl border border-slate-900/10 text-slate-800">
              <TrendingUp className="size-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800">Timeline Rencana Kerja</h2>
          </div>

          <Card className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-200/10 to-transparent blur-xl pointer-events-none" />
            <div className="flex justify-between items-center mb-6">
              <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">URUTAN TENGGAT WAKTU</p>
              <Badge className="bg-indigo-50 border-indigo-100 text-indigo-600 rounded-full font-mono text-[9px] px-2.5 shrink-0 whitespace-nowrap">
                {timelineTasks.length} Aktif
              </Badge>
            </div>
            
            {timelineTasks.length === 0 ? (
              <div className="text-center py-10">
                <Info className="size-8 text-slate-200 mx-auto mb-3" />
                <p className="text-xs font-mono text-slate-400">Tidak ada tanggal tenggat waktu yang terpasang.</p>
              </div>
            ) : (
              <div className="relative pl-5 border-l border-slate-100 flex flex-col gap-6 py-2">
                {timelineTasks.map((task) => {
                  const isOverdue = new Date(task.deadline!).getTime() < Date.now() && task.status !== "done";
                  
                  return (
                    <div key={task.id} className="relative group">
                      {/* Interactive glowing node */}
                      <span className={`absolute -left-[26px] top-1.5 size-3 rounded-full border-2 border-white transition-all duration-300 ${
                        task.status === "done" 
                          ? "bg-emerald-500 shadow-sm shadow-emerald-500/50" 
                          : isOverdue 
                            ? "bg-rose-500 shadow-md shadow-rose-500/50 animate-pulse" 
                            : "bg-amber-400 shadow-sm shadow-amber-400/50"
                      }`} />
                      
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                            {task.divisionName}
                          </span>
                          <span className={`text-[10px] font-mono ${isOverdue ? "text-rose-500 font-bold" : "text-slate-400"}`}>
                            {new Date(task.deadline!).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                        <p className={`text-sm font-bold leading-snug truncate ${task.status === "done" ? "line-through text-slate-400 font-medium" : "text-slate-700 group-hover:text-slate-900 transition-colors"}`}>
                          {task.title}
                        </p>
                        {task.assigneeName && (
                          <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 mt-1">
                            <User className="size-3" />
                            <span>PJ: {task.assigneeName.split(" ")[0]}</span>
                          </div>
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
      <Modal open={showTaskForm} title="Buat Tugas Baru" onClose={() => setShowTaskForm(false)}>
        <form onSubmit={handleCreateTask} className="space-y-5 py-2">
          
          {/* Division Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 font-sans uppercase tracking-wider">Divisi Pelaksana</label>
            {isCoordinator ? (
              <Input
                disabled
                value={initialDivisions.find((d) => d.id === userDivisionId)?.name ?? ""}
                className="font-semibold text-sm bg-slate-50 border-slate-200/80 rounded-xl text-slate-500 cursor-not-allowed"
              />
            ) : (
              <select
                name="division_id"
                required
                value={selectedDivId}
                onChange={(e) => setSelectedDivId(e.target.value)}
                className="w-full text-sm font-semibold border border-slate-200/80 rounded-xl bg-white px-3.5 py-2.5 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 cursor-pointer text-slate-700"
              >
                {initialDivisions.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 font-sans uppercase tracking-wider">Judul Tugas</label>
            <Input
              name="title"
              required
              placeholder="Tuliskan nama tugas secara singkat..."
              className="text-sm rounded-xl border-slate-200/80 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 px-3.5 py-2.5"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 font-sans uppercase tracking-wider">Deskripsi Lengkap (Opsional)</label>
            <textarea
              name="description"
              placeholder="Detail penjelasan atau tautan instruksi kerja tugas..."
              rows={3}
              className="w-full text-sm font-sans border border-slate-200/80 rounded-xl bg-white p-3.5 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-slate-700"
            />
          </div>

          {/* Grid: Priority & Deadline */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 font-sans uppercase tracking-wider">Prioritas</label>
              <select
                name="priority"
                className="w-full text-sm font-semibold border border-slate-200/80 rounded-xl bg-white px-3 py-2.5 focus:outline-none focus:border-slate-900 cursor-pointer text-slate-700"
              >
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 font-sans uppercase tracking-wider">Batas Tenggat (Deadline)</label>
              <input
                type="date"
                name="deadline"
                className="w-full text-sm font-semibold border border-slate-200/80 rounded-xl bg-white px-3 py-2 focus:outline-none focus:border-slate-900 text-slate-700"
              />
            </div>
          </div>

          {/* Assignee */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 font-sans uppercase tracking-wider">Penanggung Jawab (PJ)</label>
            <select
              name="assignee_id"
              value={selectedAssigneeId}
              onChange={(e) => setSelectedAssigneeId(e.target.value)}
              className="w-full text-sm font-semibold border border-slate-200/80 rounded-xl bg-white px-3 py-2.5 focus:outline-none focus:border-slate-900 cursor-pointer text-slate-700"
            >
              <option value="">-- Pilih Anggota Divisi --</option>
              {getFilteredAssignees().map((a) => (
                <option key={a.id} value={a.id}>
                  {a.fullName} ({a.nim})
                </option>
              ))}
            </select>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowTaskForm(false)}
              className="cursor-pointer text-xs rounded-full font-mono uppercase font-bold text-slate-500 hover:bg-slate-100"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="cursor-pointer text-xs rounded-full font-sans uppercase font-bold bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 border-0"
            >
              Simpan Tugas
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
