"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { 
  FileText, Calendar, User, ListTodo, Info, Trash2, Plus, 
  Search, CheckCircle2, Clock, AlertCircle, Check, X, Loader2
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

const statusMap: Record<string, { label: string; dotClass: string; badgeVariant: "secondary" | "warning" | "info" | "success" | "danger" }> = {
  todo: { label: "Belum Selesai", dotClass: "bg-slate-400", badgeVariant: "secondary" },
  not_started: { label: "Belum Selesai", dotClass: "bg-slate-400", badgeVariant: "secondary" },
  in_progress: { label: "Sedang Dikerjakan", dotClass: "bg-blue-500", badgeVariant: "info" },
  stuck: { label: "Terkendala", dotClass: "bg-rose-500", badgeVariant: "danger" },
  up_next: { label: "Antrean", dotClass: "bg-amber-500", badgeVariant: "warning" },
  done: { label: "Selesai", dotClass: "bg-emerald-500", badgeVariant: "success" },
};

const priorityLabels: Record<string, { label: string; variant: "danger" | "warning" | "secondary" }> = {
  high: { label: "Tinggi", variant: "danger" },
  medium: { label: "Sedang", variant: "warning" },
  low: { label: "Rendah", variant: "secondary" },
};

export function TasksClient({ divisions: initialDivisions, profile, assignments }: TasksClientProps) {
  const router = useRouter();
  const [filterTab, setFilterTab] = useState<"all" | "mine" | "todo" | "in_progress" | "done">("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals & Form State
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [createPending, setCreatePending] = useState(false);
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

  const userAssignment = assignments.find((a) => a.profileId === profile?.userId);
  const userAssignmentId = userAssignment?.id ?? null;
  const userDivisionId = userAssignment?.divisionId ?? initialDivisions[0]?.id ?? "";

  // Flatten all tasks
  const allTasks = useMemo(() => {
    return initialDivisions.flatMap((div) => 
      div.tasks.map((t) => ({ ...t, divisionName: div.name, divisionId: div.id }))
    );
  }, [initialDivisions]);

  // Counts
  const totalTasksCount = allTasks.length;
  const mineTasksCount = allTasks.filter((t) => t.assigneeId === userAssignmentId).length;
  const todoTasksCount = allTasks.filter((t) => t.status === "todo" || t.status === "not_started").length;
  const inProgressTasksCount = allTasks.filter((t) => t.status === "in_progress").length;
  const doneTasksCount = allTasks.filter((t) => t.status === "done").length;

  // Filtered List
  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      // Tab filter
      if (filterTab === "mine" && task.assigneeId !== userAssignmentId) return false;
      if (filterTab === "todo" && task.status !== "todo" && task.status !== "not_started") return false;
      if (filterTab === "in_progress" && task.status !== "in_progress") return false;
      if (filterTab === "done" && task.status !== "done") return false;

      // Priority filter
      if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = (task.description || "").toLowerCase().includes(q);
        const matchDiv = (task.divisionName || "").toLowerCase().includes(q);
        const matchPic = (task.assigneeName || "").toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchDiv && !matchPic) return false;
      }

      return true;
    });
  }, [allTasks, filterTab, priorityFilter, searchQuery, userAssignmentId]);

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

  async function handleToggleStatus(task: any) {
    const nextStatus = task.status === "done" ? "todo" : task.status === "todo" || task.status === "not_started" ? "in_progress" : "done";
    const result = await updateTask(task.id, { status: nextStatus });
    if (result.error) {
      alert(result.error);
    } else {
      router.refresh();
    }
  }

  async function handleSaveDetail() {
    if (!selectedTask) return;
    setSavingDetail(true);

    const result = await updateTask(selectedTask.id, {
      title: editTitle,
      description: editDescription || null,
      status: editStatus,
      priority: editPriority,
      deadline: editDeadline || null,
      assigneeId: editAssigneeId || null,
    });

    setSavingDetail(false);
    if (result.error) {
      alert(result.error);
    } else {
      setDetailModalOpen(false);
      router.refresh();
    }
  }

  async function handleDelete(taskId: string) {
    if (confirm("Hapus tugas ini secara permanen?")) {
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
    setCreatePending(true);
    const fd = new FormData(e.currentTarget);
    const res = await createTask(null, fd);
    setCreatePending(false);

    if (res?.error) {
      alert(res.error);
    } else {
      setShowTaskForm(false);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <p className="text-accent-magenta font-mono text-[10px] font-bold uppercase tracking-widest mb-1">
            MANAJEMEN TUGAS
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface font-sans">
            Daftar Tugas Saya & Divisi
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant font-sans">
            Kelola, atur prioritas, dan selesaikan seluruh tugas personal dan program kerja divisi Anda.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 sm:self-end">
          <ExportButton label="Export CSV" filename="tasks" fetchCsv={exportTasksCSV} />
          <Button
            onClick={() => setShowTaskForm(true)}
            className="h-9 px-4 rounded-xl text-xs font-mono font-bold uppercase bg-[#04000D] text-[#DCEEB1] hover:bg-black gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="size-4" /> Tambah Tugas
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-[#04000D]/5 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex items-center gap-4">
          <div className="size-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <ListTodo className="size-5" />
          </div>
          <div>
            <p className="text-[9px] font-mono font-bold text-on-surface-variant/70 uppercase tracking-wider">TOTAL TUGAS</p>
            <p className="text-2xl md:text-3xl font-extrabold text-on-surface leading-none mt-1 font-sans">{totalTasksCount}</p>
          </div>
        </div>

        <div className="bg-white border border-[#04000D]/5 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex items-center gap-4">
          <div className="size-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <AlertCircle className="size-5" />
          </div>
          <div>
            <p className="text-[9px] font-mono font-bold text-on-surface-variant/70 uppercase tracking-wider">BELUM SELESAI</p>
            <p className="text-2xl md:text-3xl font-extrabold text-amber-600 leading-none mt-1 font-sans">{todoTasksCount}</p>
          </div>
        </div>

        <div className="bg-white border border-[#04000D]/5 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex items-center gap-4">
          <div className="size-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Clock className="size-5" />
          </div>
          <div>
            <p className="text-[9px] font-mono font-bold text-on-surface-variant/70 uppercase tracking-wider">SEDANG DIKERJAKAN</p>
            <p className="text-2xl md:text-3xl font-extrabold text-blue-600 leading-none mt-1 font-sans">{inProgressTasksCount}</p>
          </div>
        </div>

        <div className="bg-white border border-[#04000D]/5 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex items-center gap-4">
          <div className="size-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <p className="text-[9px] font-mono font-bold text-on-surface-variant/70 uppercase tracking-wider">SELESAI</p>
            <p className="text-2xl md:text-3xl font-extrabold text-emerald-600 leading-none mt-1 font-sans">{doneTasksCount}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#04000D]/5 p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: `Semua (${totalTasksCount})` },
            { id: "mine", label: `Tugas Saya (${mineTasksCount})` },
            { id: "todo", label: `Belum Selesai (${todoTasksCount})` },
            { id: "in_progress", label: `Sedang Dikerjakan (${inProgressTasksCount})` },
            { id: "done", label: `Selesai (${doneTasksCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                filterTab === tab.id
                  ? "bg-[#04000D] text-[#DCEEB1] shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Priority Filter & Search Bar */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-mono font-bold text-slate-700 focus:border-slate-900 focus:outline-none cursor-pointer shadow-xs"
          >
            <option value="all">Semua Prioritas</option>
            <option value="high">Prioritas Tinggi</option>
            <option value="medium">Prioritas Sedang</option>
            <option value="low">Prioritas Rendah</option>
          </select>

          <div className="relative flex-1 sm:w-60">
            <Search className="size-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama tugas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs font-sans font-medium text-slate-900 focus:border-slate-900 focus:outline-none transition-all placeholder:text-slate-400 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white border border-[#04000D]/5 rounded-2xl p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
          <ListTodo className="size-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-sans font-medium text-slate-600">
            Tidak ada tugas ditemukan.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredTasks.map((task) => {
            const st = statusMap[task.status] || statusMap.todo;
            const prio = priorityLabels[task.priority] || priorityLabels.medium;
            const isDone = task.status === "done";

            return (
              <div
                key={task.id}
                className="bg-white border border-[#04000D]/5 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:border-accent-magenta/40 transition-all group"
              >
                {/* Left Side: Checkbox & Title */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(task)}
                    title={isDone ? "Tandai Belum Selesai" : "Tandai Selesai"}
                    className={`mt-0.5 size-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      isDone
                        ? "bg-emerald-500 border-emerald-600 text-white"
                        : "border-slate-300 hover:border-slate-800 bg-white"
                    }`}
                  >
                    {isDone && <Check className="size-3.5 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => handleOpenDetail(task)}>
                    <h3 className={`text-base font-bold font-sans transition-colors leading-snug ${
                      isDone ? "line-through text-slate-400" : "text-slate-900 group-hover:text-accent-magenta"
                    }`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-xs text-slate-500 font-sans mt-0.5 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-mono text-slate-400">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                        Divisi {task.divisionName}
                      </span>
                      {task.assigneeName && (
                        <span className="flex items-center gap-1 text-slate-600">
                          <User className="size-3" />
                          {task.assigneeName}
                        </span>
                      )}
                      {task.deadline && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="size-3" />
                          {task.deadline}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Badges & Details Action */}
                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                  <Badge variant={prio.variant} className="text-[10px] font-mono px-2.5 py-0.5 font-bold rounded-full">
                    {prio.label}
                  </Badge>
                  <Badge variant={st.badgeVariant} className="text-[10px] font-mono px-2.5 py-0.5 font-bold uppercase rounded-full">
                    {st.label}
                  </Badge>
                  <button
                    onClick={() => handleOpenDetail(task)}
                    className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Info className="size-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Creation Modal */}
      {showTaskForm && (
        <Modal isOpen={showTaskForm} onClose={() => setShowTaskForm(false)} title="Buat Tugas Baru">
          <form onSubmit={handleCreateTask} className="flex flex-col gap-5 pt-2">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1.5">
                Judul Tugas <span className="text-pink-500">*</span>
              </label>
              <Input
                name="title"
                placeholder="Contoh: Menyusun Proposal Sponsorship"
                required
                className="h-11 rounded-2xl border-slate-200 text-sm font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1.5">
                Deskripsi Poin Tugas
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="Tuliskan rincian tugas di sini..."
                className="w-full rounded-2xl border border-slate-200 p-3 text-sm font-sans focus:border-slate-900 focus:outline-none resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1.5">
                  Divisi Pelaksana <span className="text-pink-500">*</span>
                </label>
                <select
                  name="division_id"
                  defaultValue={userDivisionId}
                  required
                  className="w-full h-11 rounded-2xl border border-slate-200 px-3 text-sm font-sans font-medium text-slate-900 focus:border-slate-900 focus:outline-none cursor-pointer"
                >
                  {initialDivisions.map((div) => (
                    <option key={div.id} value={div.id}>
                      {div.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1.5">
                  Penanggung Jawab (PIC)
                </label>
                <select
                  name="assignee_id"
                  defaultValue={userAssignmentId ?? ""}
                  className="w-full h-11 rounded-2xl border border-slate-200 px-3 text-sm font-sans font-medium text-slate-900 focus:border-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="">Belum Ditentukan</option>
                  {assignments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.fullName} ({a.divisionName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1.5">
                  Prioritas
                </label>
                <select
                  name="priority"
                  defaultValue="medium"
                  className="w-full h-11 rounded-2xl border border-slate-200 px-3 text-sm font-sans font-medium text-slate-900 focus:border-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="high">Tinggi</option>
                  <option value="medium">Sedang</option>
                  <option value="low">Rendah</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1.5">
                  Tenggat Waktu (Deadline)
                </label>
                <Input
                  type="date"
                  name="deadline"
                  className="h-11 rounded-2xl border-slate-200 text-sm font-sans"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
              <Button type="button" variant="ghost" onClick={() => setShowTaskForm(false)} className="rounded-xl font-mono text-xs">
                Batal
              </Button>
              <Button
                type="submit"
                disabled={createPending}
                className="bg-[#04000D] text-[#DCEEB1] hover:bg-black rounded-xl font-mono text-xs font-bold px-5"
              >
                {createPending ? <Loader2 className="size-4 animate-spin" /> : "Simpan Tugas"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Task Detail & Edit Modal */}
      {detailModalOpen && selectedTask && (
        <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="Detail & Edit Tugas">
          <div className="flex flex-col gap-5 pt-2">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1.5">
                Judul Tugas
              </label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="h-11 rounded-2xl border-slate-200 text-sm font-sans font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1.5">
                Deskripsi Poin Tugas
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-slate-200 p-3 text-sm font-sans focus:border-slate-900 focus:outline-none resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1.5">
                  Status Tugas
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full h-11 rounded-2xl border border-slate-200 px-3 text-sm font-sans font-medium text-slate-900 focus:border-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="not_started">Belum Selesai</option>
                  <option value="in_progress">Sedang Dikerjakan</option>
                  <option value="done">Selesai</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1.5">
                  Prioritas
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="w-full h-11 rounded-2xl border border-slate-200 px-3 text-sm font-sans font-medium text-slate-900 focus:border-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="high">Tinggi</option>
                  <option value="medium">Sedang</option>
                  <option value="low">Rendah</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1.5">
                  Penanggung Jawab (PIC)
                </label>
                <select
                  value={editAssigneeId}
                  onChange={(e) => setEditAssigneeId(e.target.value)}
                  className="w-full h-11 rounded-2xl border border-slate-200 px-3 text-sm font-sans font-medium text-slate-900 focus:border-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="">Belum Ditentukan</option>
                  {assignments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.fullName} ({a.divisionName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1.5">
                  Tenggat Waktu (Deadline)
                </label>
                <Input
                  type="date"
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                  className="h-11 rounded-2xl border-slate-200 text-sm font-sans"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleDelete(selectedTask.id)}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl font-mono text-xs gap-1.5 cursor-pointer"
              >
                <Trash2 className="size-4" /> Hapus Tugas
              </Button>

              <div className="flex items-center gap-3">
                <Button type="button" variant="ghost" onClick={() => setDetailModalOpen(false)} className="rounded-xl font-mono text-xs">
                  Batal
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveDetail}
                  disabled={savingDetail}
                  className="bg-[#04000D] text-[#DCEEB1] hover:bg-black rounded-xl font-mono text-xs font-bold px-5 cursor-pointer"
                >
                  {savingDetail ? <Loader2 className="size-4 animate-spin" /> : "Simpan Perubahan"}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
