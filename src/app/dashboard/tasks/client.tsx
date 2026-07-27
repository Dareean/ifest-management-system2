"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { 
  FileText, Calendar, User, ListTodo, Info, Trash2, Plus, 
  MessageSquare, LayoutGrid, Kanban, TableProperties, CircleDot, 
  AlertCircle, ChevronRight, X, Clock, HelpCircle, CheckCircle2
} from "lucide-react";
import { createTask, deleteTask, updateTask } from "@/lib/actions/tasks";
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

const statusMap: Record<string, { label: string; dotClass: string; pillClass: string }> = {
  todo: { label: "Not started", dotClass: "bg-slate-400", pillClass: "bg-[#f1f1f0] text-[#787774] border-transparent" },
  not_started: { label: "Not started", dotClass: "bg-slate-400", pillClass: "bg-[#f1f1f0] text-[#787774] border-transparent" },
  in_progress: { label: "In progress", dotClass: "bg-blue-500", pillClass: "bg-[#e2f2ff] text-[#0b6e9f] border-transparent" },
  stuck: { label: "Stuck", dotClass: "bg-rose-500", pillClass: "bg-[#ffe2dd] text-[#df5b5b] border-transparent" },
  up_next: { label: "Up next", dotClass: "bg-amber-500", pillClass: "bg-[#fbf3db] text-[#c07b03] border-transparent" },
  done: { label: "Done", dotClass: "bg-emerald-500", pillClass: "bg-[#e2f5ec] text-[#0f7b4e] border-transparent" },
};

const priorityClasses: Record<string, string> = {
  high: "text-rose-650 bg-rose-50 border border-rose-100",
  medium: "text-amber-650 bg-amber-50 border border-amber-100",
  low: "text-emerald-650 bg-emerald-50 border border-emerald-100",
};

export function TasksClient({ divisions: initialDivisions, summaries, profile, assignments }: TasksClientProps) {
  const router = useRouter();
  const [activeSupervisor, setActiveSupervisor] = useState<string>("all");
  const [activeDiv, setActiveDiv] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<"all" | "status">("all");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedDivId, setSelectedDivId] = useState<string>("");
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>("");

  // Detailed view modal state
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Edit fields state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("not_started");
  const [editPriority, setEditPriority] = useState("medium");
  const [editDeadline, setEditDeadline] = useState("");
  const [editAssigneeId, setEditAssigneeId] = useState("");
  const [savingDetail, setSavingDetail] = useState(false);
  
  // Custom comments mock list
  const [mockComments, setMockComments] = useState<Record<string, { sender: string; text: string; time: string }[]>>({});
  const [newCommentText, setNewCommentText] = useState("");

  const userLevel = profile?.assignment?.level ?? 0;
  const isBph = userLevel >= 70;
  const isCoordinator = userLevel >= 55 && userLevel < 70;
  
  const userAssignment = assignments.find((a) => a.profileId === profile?.userId);
  const userDivisionId = userAssignment?.divisionId ?? null;

  // Filter divisions: BPH sees all, others only see their assigned division
  const filteredDivisions = initialDivisions.filter((div) => {
    if (!isBph) {
      return div.id === userDivisionId;
    }

    if (activeDiv && div.id !== activeDiv) return false;

    if (activeSupervisor === "all") return true;
    const nameLower = (div.supervisorName ?? "").toLowerCase();
    if (activeSupervisor === "daren") return nameLower.includes("daren") || nameLower.includes("dareean");
    if (activeSupervisor === "gabriel") return nameLower.includes("gabriel");
    if (activeSupervisor === "reyqal") return nameLower.includes("reyqal");
    return true;
  });

  const allTasks = filteredDivisions.flatMap((div) => 
    div.tasks.map((t) => ({ ...t, divisionName: div.name, divisionId: div.id }))
  );

  const totalTasksCount = allTasks.length;
  const completedTasksCount = allTasks.filter((t) => t.status === "done").length;

  const handleOpenDetail = (task: any) => {
    const normStatus = task.status === "todo" ? "not_started" : task.status;
    setSelectedTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditStatus(normStatus);
    setEditPriority(task.priority || "medium");
    setEditDeadline(task.deadline || "");
    setEditAssigneeId(task.assigneeId || "");
    setDetailModalOpen(true);
  };

  async function handleSaveDetail() {
    if (!selectedTask) return;
    setSavingDetail(true);

    const dataPayload: any = {
      title: editTitle,
      description: editDescription || null,
      status: editStatus,
      priority: editPriority,
      deadline: editDeadline || null,
      assigneeId: editAssigneeId || null,
    };

    const result = await updateTask(selectedTask.id, dataPayload);
    setSavingDetail(false);
    if (result.error) {
      alert(result.error);
    } else {
      setDetailModalOpen(false);
      router.refresh();
    }
  }

  async function handleDelete(taskId: string) {
    if (confirm("Hapus task ini?")) {
      const result = await deleteTask(taskId);
      if (result.error) {
        alert(result.error);
      } else {
        setDetailModalOpen(false);
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

  const handleAddComment = (taskId: string) => {
    if (!newCommentText.trim()) return;
    const taskComments = mockComments[taskId] || [];
    const newComment = {
      sender: profile?.fullName || "Panitia",
      text: newCommentText,
      time: "Just now",
    };
    setMockComments({
      ...mockComments,
      [taskId]: [...taskComments, newComment],
    });
    setNewCommentText("");
  };

  const getFilteredAssignees = (divId: string) => {
    if (!divId) return [];
    return assignments.filter((a) => a.divisionId === divId);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const formatDeadline = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const isOverdue = (dateStr: string | null, status: string) => {
    if (!dateStr || status === "done") return false;
    return new Date(dateStr).getTime() < Date.now();
  };

  const canManage = selectedTask ? (isBph || (isCoordinator && userDivisionId === selectedTask.divisionId)) : false;

  return (
    <div className="flex flex-col gap-8 pb-16">
      
      {/* Background Decorative Blur */}
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
              <CircleDot className="size-3 animate-pulse" /> Live Workspace
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            {isBph ? "Task Database" : `Tugas Divisi ${userAssignment?.divisionName ?? ""}`}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl font-normal">
            {isBph 
              ? "Kelola, delegasikan, dan pantau progres seluruh program kerja divisi melalui antarmuka basis data terintegrasi."
              : "Pantau daftar tugas, tenggat waktu, dan status progres pengerjaan divisi Anda secara langsung."}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 md:self-center">
          {(isBph || isCoordinator) && (
            <Button
              onClick={() => {
                setSelectedDivId(isCoordinator ? userDivisionId ?? "" : initialDivisions[0]?.id ?? "");
                setShowTaskForm(true);
              }}
              className="cursor-pointer font-semibold rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 px-4.5 py-2 border-0 transition-all hover:scale-[1.02]"
            >
              <Plus className="size-4" /> New Task
            </Button>
          )}
          <ExportButton label="Export CSV" filename="tasks" fetchCsv={exportTasksCSV} />
        </div>
      </div>

      {/* Supervision Grid - Hidden for non-BPH */}
      {isBph && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Daren Card */}
          <div
            onClick={() => setActiveSupervisor(activeSupervisor === "daren" ? "all" : "daren")}
            className={`group cursor-pointer rounded-3xl p-6 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-40 ${
              activeSupervisor === "daren"
                ? "bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/30 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/5"
                : "bg-white border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md"
            }`}
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">SUPERVISI DIVISI</span>
                  <h3 className="text-xl font-bold text-slate-800 mt-0.5 transition-colors">Daren</h3>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full font-mono font-bold text-[10px] shrink-0 whitespace-nowrap">
                  {initialDivisions.filter(d => (d.supervisorName ?? "").toLowerCase().includes("daren")).reduce((a,b) => a + b.doneTasks, 0)}/
                  {initialDivisions.filter(d => (d.supervisorName ?? "").toLowerCase().includes("daren")).reduce((a,b) => a + b.totalTasks, 0)} Done
                </Badge>
              </div>
            </div>
            <div className="mt-4">
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
                  style={{ width: `${initialDivisions.filter(d => (d.supervisorName ?? "").toLowerCase().includes("daren")).reduce((a,b) => a + b.totalTasks, 0) > 0 ? (initialDivisions.filter(d => (d.supervisorName ?? "").toLowerCase().includes("daren")).reduce((a,b) => a + b.doneTasks, 0) / initialDivisions.filter(d => (d.supervisorName ?? "").toLowerCase().includes("daren")).reduce((a,b) => a + b.totalTasks, 0)) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Gabriel Card */}
          <div
            onClick={() => setActiveSupervisor(activeSupervisor === "gabriel" ? "all" : "gabriel")}
            className={`group cursor-pointer rounded-3xl p-6 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-40 ${
              activeSupervisor === "gabriel"
                ? "bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border-indigo-500/30 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-500/5"
                : "bg-white border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md"
            }`}
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">SUPERVISI DIVISI</span>
                  <h3 className="text-xl font-bold text-slate-800 mt-0.5 transition-colors">Gabriel</h3>
                </div>
                <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full font-mono font-bold text-[10px] shrink-0 whitespace-nowrap">
                  {initialDivisions.filter(d => (d.supervisorName ?? "").toLowerCase().includes("gabriel")).reduce((a,b) => a + b.doneTasks, 0)}/
                  {initialDivisions.filter(d => (d.supervisorName ?? "").toLowerCase().includes("gabriel")).reduce((a,b) => a + b.totalTasks, 0)} Done
                </Badge>
              </div>
            </div>
            <div className="mt-4">
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-500"
                  style={{ width: `${initialDivisions.filter(d => (d.supervisorName ?? "").toLowerCase().includes("gabriel")).reduce((a,b) => a + b.totalTasks, 0) > 0 ? (initialDivisions.filter(d => (d.supervisorName ?? "").toLowerCase().includes("gabriel")).reduce((a,b) => a + b.doneTasks, 0) / initialDivisions.filter(d => (d.supervisorName ?? "").toLowerCase().includes("gabriel")).reduce((a,b) => a + b.totalTasks, 0)) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Reyqal Card */}
          <div
            onClick={() => setActiveSupervisor(activeSupervisor === "reyqal" ? "all" : "reyqal")}
            className={`group cursor-pointer rounded-3xl p-6 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-40 ${
              activeSupervisor === "reyqal"
                ? "bg-gradient-to-br from-rose-500/10 via-orange-500/5 to-transparent border-rose-500/30 ring-2 ring-rose-500/20 shadow-lg shadow-rose-500/5"
                : "bg-white border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md"
            }`}
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">SUPERVISI DIVISI</span>
                  <h3 className="text-xl font-bold text-slate-800 mt-0.5 transition-colors">Reyqal</h3>
                </div>
                <Badge className="bg-rose-50 text-rose-700 border border-rose-100 rounded-full font-mono font-bold text-[10px] shrink-0 whitespace-nowrap">
                  {initialDivisions.filter(d => (d.supervisorName ?? "").toLowerCase().includes("reyqal")).reduce((a,b) => a + b.doneTasks, 0)}/
                  {initialDivisions.filter(d => (d.supervisorName ?? "").toLowerCase().includes("reyqal")).reduce((a,b) => a + b.totalTasks, 0)} Done
                </Badge>
              </div>
            </div>
            <div className="mt-4">
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-400 to-orange-500 transition-all duration-500"
                  style={{ width: `${initialDivisions.filter(d => (d.supervisorName ?? "").toLowerCase().includes("reyqal")).reduce((a,b) => a + b.totalTasks, 0) > 0 ? (initialDivisions.filter(d => (d.supervisorName ?? "").toLowerCase().includes("reyqal")).reduce((a,b) => a + b.doneTasks, 0) / initialDivisions.filter(d => (d.supervisorName ?? "").toLowerCase().includes("reyqal")).reduce((a,b) => a + b.totalTasks, 0)) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar - Hidden for non-BPH */}
      {isBph && (
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
      )}

      {/* Notion Workspace Container (Light Mode) */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 text-slate-800 shadow-sm overflow-hidden font-sans">
        
        {/* Notion Tabs Header */}
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewTab("all")}
              className={`cursor-pointer flex items-center gap-2 pb-2 border-b-2 px-1 text-sm font-semibold transition-all ${
                viewTab === "all" ? "border-slate-800 text-slate-800" : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <TableProperties className="size-4" />
              All tasks
            </button>
            <button
              onClick={() => setViewTab("status")}
              className={`cursor-pointer flex items-center gap-2 pb-2 border-b-2 px-1 text-sm font-semibold transition-all ${
                viewTab === "status" ? "border-slate-800 text-slate-800" : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Kanban className="size-4" />
              By status
            </button>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {completedTasksCount}/{totalTasksCount} completed
          </div>
        </div>

        {/* View content switch */}
        {viewTab === "all" ? (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-400 font-medium">
                  <th className="py-3 px-4 w-[40%] font-semibold border-r border-slate-200/40">Aa To Do List</th>
                  <th className="py-3 px-4 w-[15%] font-semibold border-r border-slate-200/40">Status</th>
                  <th className="py-3 px-4 w-[15%] font-semibold border-r border-slate-200/40">Due date</th>
                  <th className="py-3 px-4 w-[18%] font-semibold border-r border-slate-200/40 font-sans">Project / Main Program</th>
                  <th className="py-3 px-4 w-[12%] font-semibold">PIC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-normal">
                      No tasks found. Click &quot;New Task&quot; to get started.
                    </td>
                  </tr>
                ) : (
                  allTasks.map((task) => {
                    const statusVal = task.status === "todo" ? "not_started" : task.status;
                    const meta = statusMap[statusVal] || statusMap.not_started;
                    const overdue = isOverdue(task.deadline, task.status);
                    const commentsCount = mockComments[task.id]?.length || 0;

                    return (
                      <tr
                        key={task.id}
                        onClick={() => handleOpenDetail(task)}
                        className="hover:bg-slate-50/60 transition-colors cursor-pointer group"
                      >
                        {/* Title */}
                        <td className="py-3.5 px-4 font-bold text-slate-800 border-r border-slate-200/30 flex items-start gap-2 min-w-0">
                          <FileText className="size-4 shrink-0 text-slate-400 mt-0.5" />
                          <div className="truncate flex-1">
                            {task.title}
                            {task.description && (
                              <p className="text-[10px] text-slate-500 font-normal line-clamp-1 mt-0.5">
                                {task.description}
                              </p>
                            )}
                          </div>
                          {commentsCount > 0 && (
                            <span className="flex items-center gap-0.5 text-[9px] text-slate-500 font-semibold bg-slate-50 border border-slate-200/80 px-1.5 py-0.5 rounded shrink-0">
                              <MessageSquare className="size-3" /> {commentsCount}
                            </span>
                          )}
                        </td>

                        {/* Status tag */}
                        <td className="py-3 px-4 border-r border-slate-200/30">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${meta.pillClass}`}>
                            <span className={`size-1.5 rounded-full ${meta.dotClass}`} />
                            {meta.label}
                          </span>
                        </td>

                        {/* Due date */}
                        <td className="py-3 px-4 border-r border-slate-200/30">
                          {task.deadline ? (
                            <span className={`inline-flex items-center gap-1 font-semibold ${overdue ? "text-rose-600" : "text-slate-500"}`}>
                              <Calendar className="size-3.5" />
                              {formatDeadline(task.deadline)}
                            </span>
                          ) : (
                            <span className="text-slate-350 font-normal">-</span>
                          )}
                        </td>

                        {/* Project / Main Program (Division) */}
                        <td className="py-3 px-4 border-r border-slate-200/30 font-sans">
                          <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-lg text-slate-650 font-bold max-w-full truncate">
                            <FileText className="size-3.5 text-slate-400" />
                            {task.divisionName}
                          </span>
                        </td>

                        {/* PIC */}
                        <td className="py-3 px-4">
                          {task.assigneeName ? (
                            <span className="inline-flex items-center gap-2">
                              <span className="size-5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[8px] flex items-center justify-center font-bold font-sans">
                                {getInitials(task.assigneeName)}
                              </span>
                              <span className="text-slate-700 font-bold truncate max-w-[90px]">
                                {task.assigneeName.split(" ")[0]}
                              </span>
                            </span>
                          ) : (
                            <span className="text-slate-350 font-normal">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Kanban Board View (By status) */
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
            
            {/* Loop through each status */}
            {["not_started", "up_next", "in_progress", "stuck", "done"].map((statusKey) => {
              const statusTasks = allTasks.filter(t => {
                const norm = t.status === "todo" ? "not_started" : t.status;
                return norm === statusKey;
              });
              const meta = statusMap[statusKey];

              return (
                <div key={statusKey} className="flex flex-col gap-3 min-w-[200px]">
                  
                  {/* Status Column Header */}
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2 px-1">
                    <div className="flex items-center gap-2">
                      <span className={`size-2.5 rounded-full ${meta.dotClass}`} />
                      <span className="text-xs font-bold text-slate-700">{meta.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-bold">
                      {statusTasks.length}
                    </span>
                  </div>

                  {/* Cards container */}
                  <div className="flex flex-col gap-2.5 min-h-[300px] bg-slate-50/40 p-2 rounded-2xl border border-slate-100">
                    {statusTasks.length === 0 ? (
                      <div className="text-center py-8 text-[10px] text-slate-400 font-mono">
                        No tasks
                      </div>
                    ) : (
                      statusTasks.map((task) => {
                        const overdue = isOverdue(task.deadline, task.status);
                        return (
                          <div
                            key={task.id}
                            onClick={() => handleOpenDetail(task)}
                            className="bg-white border border-slate-200/80 rounded-xl p-3.5 hover:border-slate-300 transition-all cursor-pointer shadow-sm hover:shadow-md text-left flex flex-col gap-2.5"
                          >
                            <h4 className="text-xs font-bold text-slate-800 leading-normal line-clamp-2">
                              {task.title}
                            </h4>

                            <div className="flex flex-col gap-1.5 pt-1.5 border-t border-slate-100">
                              {/* Division tag */}
                              <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded w-fit">
                                <FileText className="size-3 text-slate-400" />
                                <span className="truncate max-w-[120px]">{task.divisionName}</span>
                              </div>

                              {/* Due Date */}
                              {task.deadline && (
                                <div className={`flex items-center gap-1 text-[10px] font-semibold ${overdue ? "text-rose-600" : "text-slate-400"}`}>
                                  <Calendar className="size-3" />
                                  <span>{formatDeadline(task.deadline)}</span>
                                </div>
                              )}

                              {/* PIC display */}
                              {task.assigneeName && (
                                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 mt-1">
                                  <span className="size-4.5 rounded-full bg-slate-100 text-slate-650 text-[8px] flex items-center justify-center font-bold font-sans border border-slate-200">
                                    {getInitials(task.assigneeName)}
                                  </span>
                                  <span className="truncate max-w-[100px]">{task.assigneeName.split(" ")[0]}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

      {/* Notion-Style Detail Modal */}
      <Modal open={detailModalOpen} title="Detail Tugas" onClose={() => setDetailModalOpen(false)}>
        {selectedTask && (
          <div className="bg-white text-slate-800 p-2 text-left font-sans space-y-6">
            
            {/* Modal Top breadcrumbs */}
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 tracking-wider font-mono">
              <div className="flex items-center gap-1.5">
                <span>TASKS</span>
                <ChevronRight className="size-3" />
                <span className="text-slate-600">{selectedTask.divisionName.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2">
                {canManage && (
                  <button
                    onClick={() => handleDelete(selectedTask.id)}
                    className="cursor-pointer text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
                <button
                  onClick={() => setDetailModalOpen(false)}
                  className="cursor-pointer text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Task Title */}
            <div className="space-y-1.5">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                disabled={!canManage}
                placeholder="Untitled Task"
                className="w-full text-2xl font-bold bg-transparent text-slate-900 border-b border-transparent focus:border-slate-200 focus:outline-none py-1.5 transition-colors disabled:cursor-not-allowed"
              />
            </div>

            {/* Notion Properties Grid */}
            <div className="space-y-3.5 max-w-xl text-xs text-slate-700">
              
              {/* Assignee PIC */}
              <div className="grid grid-cols-3 items-center">
                <span className="text-slate-400 font-semibold flex items-center gap-2">
                  <User className="size-4 text-slate-400" />
                  Assignee
                </span>
                <div className="col-span-2">
                  {canManage ? (
                    <select
                      value={editAssigneeId}
                      onChange={(e) => setEditAssigneeId(e.target.value)}
                      className="text-xs bg-slate-50 border border-slate-250 rounded-lg text-slate-700 px-3 py-1.5 w-full focus:outline-none focus:border-slate-400 cursor-pointer"
                    >
                      <option value="">No Assignee</option>
                      {getFilteredAssignees(selectedTask.divisionId).map((a) => (
                        <option key={a.id} value={a.id}>{a.fullName}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="inline-flex items-center gap-2 font-bold text-slate-700">
                      {selectedTask.assigneeName ? (
                        <>
                          <span className="size-5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[8px] flex items-center justify-center font-bold">
                            {getInitials(selectedTask.assigneeName)}
                          </span>
                          {selectedTask.assigneeName}
                        </>
                      ) : (
                        "Empty"
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* Due Date */}
              <div className="grid grid-cols-3 items-center">
                <span className="text-slate-400 font-semibold flex items-center gap-2">
                  <Calendar className="size-4 text-slate-400" />
                  Due date
                </span>
                <div className="col-span-2">
                  {canManage ? (
                    <input
                      type="date"
                      value={editDeadline}
                      onChange={(e) => setEditDeadline(e.target.value)}
                      className="text-xs bg-slate-50 border border-slate-250 rounded-lg text-slate-700 px-3 py-1.5 w-full focus:outline-none focus:border-slate-400"
                    />
                  ) : (
                    <span className="font-bold text-slate-700">
                      {selectedTask.deadline ? formatDeadline(selectedTask.deadline) : "No Due Date"}
                    </span>
                  )}
                </div>
              </div>

              {/* Project / Main Program (Division) */}
              <div className="grid grid-cols-3 items-center">
                <span className="text-slate-400 font-semibold flex items-center gap-2">
                  <FileText className="size-4 text-slate-400" />
                  Project / Main Program
                </span>
                <div className="col-span-2">
                  <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-lg text-slate-650 font-bold">
                    <FileText className="size-3.5 text-slate-400" />
                    {selectedTask.divisionName}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="grid grid-cols-3 items-center">
                <span className="text-slate-400 font-semibold flex items-center gap-2">
                  <CircleDot className="size-4 text-slate-400" />
                  Status
                </span>
                <div className="col-span-2">
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-250 rounded-lg text-slate-700 px-3 py-1.5 w-full focus:outline-none focus:border-slate-400 cursor-pointer"
                  >
                    <option value="not_started">Not started</option>
                    <option value="up_next">Up next</option>
                    <option value="in_progress">In progress</option>
                    <option value="stuck">Stuck</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              {/* Priority */}
              <div className="grid grid-cols-3 items-center">
                <span className="text-slate-400 font-semibold flex items-center gap-2">
                  <AlertCircle className="size-4 text-slate-400" />
                  Priority
                </span>
                <div className="col-span-2">
                  {canManage ? (
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                      className="text-xs bg-slate-50 border border-slate-250 rounded-lg text-slate-700 px-3 py-1.5 w-full focus:outline-none focus:border-slate-400 cursor-pointer"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  ) : (
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${priorityClasses[selectedTask.priority]}`}>
                      {selectedTask.priority}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="grid grid-cols-3 items-start pt-1">
                <span className="text-slate-400 font-semibold flex items-center gap-2 pt-1">
                  <Info className="size-4 text-slate-400" />
                  Description
                </span>
                <div className="col-span-2">
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    disabled={!canManage}
                    placeholder="Add detail description for this task..."
                    className="w-full text-xs bg-slate-50 border border-slate-250 rounded-lg text-slate-700 p-2.5 focus:outline-none focus:border-slate-400 placeholder-slate-400 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

            </div>

            <hr className="border-slate-100 my-6" />

            {/* Comments Area */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Comments</h4>
              
              {/* Comment list */}
              <div className="space-y-3">
                {(mockComments[selectedTask.id] || []).length === 0 ? (
                  <p className="text-[11px] text-slate-400 font-mono italic">No comments yet.</p>
                ) : (
                  (mockComments[selectedTask.id] || []).map((c, i) => (
                    <div key={i} className="flex gap-3 items-start bg-slate-50/50 p-3 rounded-xl border border-slate-200/60 text-xs">
                      <span className="size-6 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[8px] flex items-center justify-center font-bold">
                        {getInitials(c.sender)}
                      </span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700">{c.sender}</span>
                          <span className="text-[9px] text-slate-400 font-mono">{c.time}</span>
                        </div>
                        <p className="text-slate-600 font-normal leading-normal">{c.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Input */}
              <div className="flex gap-3 items-center pt-2">
                <span className="size-6 rounded-full bg-slate-100 border border-slate-200 text-slate-650 text-[8px] flex items-center justify-center font-bold">
                  {getInitials(profile?.fullName || "User")}
                </span>
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddComment(selectedTask.id); }}
                  placeholder="Add a comment..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-350"
                />
                <Button
                  onClick={() => handleAddComment(selectedTask.id)}
                  className="cursor-pointer text-[10px] uppercase font-bold tracking-wider rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 px-3 py-2 h-fit"
                >
                  Send
                </Button>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-2 pt-6 border-t border-slate-150 mt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDetailModalOpen(false)}
                className="cursor-pointer text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-100"
              >
                Close
              </Button>
              <Button
                type="button"
                disabled={savingDetail}
                onClick={handleSaveDetail}
                className="cursor-pointer text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4.5 py-2 border-0"
              >
                {savingDetail ? "Saving..." : "Save Changes"}
              </Button>
            </div>

          </div>
        )}
      </Modal>

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
              {getFilteredAssignees(isCoordinator ? (userDivisionId || "") : selectedDivId).map((a) => (
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
