"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Calendar, List, ChevronLeft, ChevronRight, AlertCircle,
  Loader2, Clock, MapPin, Users, CheckCircle2, PlayCircle, CalendarClock,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExportButton } from "@/components/export-button";
import { MeetingData } from "@/lib/data/meetings";
import { updateMeetingDate } from "@/lib/actions/meetings";

interface MeetingsClientProps {
  initialMeetings: MeetingData[];
  exportMeetingsCSV: any;
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

function getMeetingStatus(m: MeetingData): "ongoing" | "upcoming" | "ended" {
  if (m.endedAt) return "ended";
  const now = new Date();
  const start = new Date(m.startedAt);
  if (!m.startedAt || isNaN(start.getTime())) return "upcoming";
  // If started in the past and no endedAt — consider it ongoing
  if (start <= now) return "ongoing";
  return "upcoming";
}

function getRelativeLabel(m: MeetingData): string {
  const now = new Date();
  const start = new Date(m.startedAt);
  if (!m.startedAt || isNaN(start.getTime())) return "Tanggal belum diatur";

  const diffMs = start.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (m.endedAt) return "Sudah Selesai";
  if (start <= now) return "Sedang Berlangsung";
  if (diffDays === 0) return "Hari ini";
  if (diffDays === 1) return "Besok";
  if (diffDays > 0 && diffDays <= 7) return `${diffDays} hari lagi`;
  if (diffDays > 7 && diffDays <= 30) return `${Math.floor(diffDays / 7)} minggu lagi`;
  return `${Math.ceil(diffDays / 30)} bulan lagi`;
}

function formatDateFull(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { date: "—", time: "—", dayName: "—" };
  return {
    dayName: d.toLocaleDateString("id-ID", { weekday: "long" }),
    date: d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    time: d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WITA",
  };
}

function getScopeLabel(scope: string) {
  if (scope === "all") return { label: "Seluruh Panitia", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (scope === "division") return { label: "Divisi", cls: "bg-violet-50 text-violet-700 border-violet-200" };
  return { label: "Terbatas", cls: "bg-gray-100 text-gray-600 border-gray-200" };
}

function getNotesBadge(status: string) {
  if (status === "published") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5">
        <FileText className="size-2.5" /> Notulensi Ada
      </span>
    );
  }
  if (status === "draft") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">
        <FileText className="size-2.5" /> Draft
      </span>
    );
  }
  return null;
}

/* ─── Meeting Card ───────────────────────────────────────────────────── */
function MeetingCard({ mtg }: { mtg: MeetingData }) {
  const status = getMeetingStatus(mtg);
  const relativeLabel = getRelativeLabel(mtg);
  const dateInfo = formatDateFull(mtg.startedAt);
  const scopeInfo = getScopeLabel(mtg.scope);

  const statusConfig = {
    ongoing: {
      bar: "bg-emerald-500",
      badgeCls: "bg-emerald-500 text-white",
      cardCls: "border-emerald-200 bg-white hover:border-emerald-400",
      icon: <PlayCircle className="size-3" />,
      pulse: true,
    },
    upcoming: {
      bar: "bg-blue-500",
      badgeCls: "bg-blue-500 text-white",
      cardCls: "border-blue-100 bg-white hover:border-blue-400",
      icon: <CalendarClock className="size-3" />,
      pulse: false,
    },
    ended: {
      bar: "bg-gray-300",
      badgeCls: "bg-gray-200 text-gray-500",
      cardCls: "border-gray-200 bg-gray-50/60 hover:border-gray-300",
      icon: <CheckCircle2 className="size-3" />,
      pulse: false,
    },
  }[status];

  return (
    <Link href={`/dashboard/meetings/${mtg.id}`} className="block group">
      <div
        className={`relative rounded-2xl border overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md ${statusConfig.cardCls}`}
      >
        {/* Left status bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusConfig.bar}`} />

        <div className="pl-5 pr-4 py-4 flex flex-col gap-3">
          {/* Top row: status badge + type + scope */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              {/* Status pill */}
              <span
                className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full ${statusConfig.badgeCls}`}
              >
                {statusConfig.pulse && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                )}
                {!statusConfig.pulse && statusConfig.icon}
                {relativeLabel}
              </span>

              {/* Type badge */}
              <span
                className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  mtg.meetingType === "adhoc"
                    ? "bg-orange-50 text-orange-700 border-orange-200"
                    : "bg-indigo-50 text-indigo-700 border-indigo-200"
                }`}
              >
                {mtg.meetingType === "adhoc" ? "Kondisional" : "Terjadwal"}
              </span>
            </div>

            {/* Notes badge */}
            <div className="flex items-center gap-1.5">
              {getNotesBadge(mtg.notesStatus)}
            </div>
          </div>

          {/* Meeting title */}
          <div>
            <h3
              className={`text-sm font-bold leading-snug group-hover:text-accent-magenta transition-colors ${
                status === "ended" ? "text-gray-500" : "text-on-surface"
              }`}
            >
              {mtg.title}
            </h3>
          </div>

          {/* Date & Time block */}
          <div
            className={`rounded-xl px-3 py-2.5 flex flex-col gap-0.5 ${
              status === "ended"
                ? "bg-gray-100"
                : status === "ongoing"
                ? "bg-emerald-50"
                : "bg-blue-50/60"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Clock
                className={`size-3 shrink-0 ${
                  status === "ended"
                    ? "text-gray-400"
                    : status === "ongoing"
                    ? "text-emerald-600"
                    : "text-blue-600"
                }`}
              />
              <span
                className={`text-[11px] font-mono font-semibold ${
                  status === "ended"
                    ? "text-gray-400"
                    : status === "ongoing"
                    ? "text-emerald-700"
                    : "text-blue-700"
                }`}
              >
                {dateInfo.dayName}, {dateInfo.date}
              </span>
            </div>
            <span
              className={`text-[10px] font-mono pl-4.5 ${
                status === "ended" ? "text-gray-400" : "text-on-surface-variant"
              }`}
            >
              Pukul {dateInfo.time}
            </span>
          </div>

          {/* Footer: location + invitee count + scope */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-3">
              {mtg.location && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-on-surface-variant">
                  <MapPin className="size-3" />
                  {mtg.location}
                </span>
              )}
              {mtg.inviteeCount > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-on-surface-variant">
                  <Users className="size-3" />
                  {mtg.inviteeCount} peserta
                </span>
              )}
            </div>
            <span
              className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${scopeInfo.cls}`}
            >
              {scopeInfo.label}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Section Divider ────────────────────────────────────────────────── */
function SectionDivider({
  icon,
  label,
  count,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`flex items-center gap-2 ${color}`}>
        {icon}
        <span className="text-sm font-bold tracking-tight">{label}</span>
        <span className="text-xs font-mono bg-current/10 rounded-full px-2 py-0.5 opacity-80">
          {count}
        </span>
      </div>
      <div className="flex-1 h-px bg-outline-variant/30" />
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */
export function MeetingsClient({ initialMeetings, exportMeetingsCSV }: MeetingsClientProps) {
  const router = useRouter();
  const [meetings, setMeetings] = useState<MeetingData[]>(initialMeetings);
  const [view, setView] = useState<"daftar" | "kalender">("daftar");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isPending, startTransition] = useTransition();

  // Refresh server component data on mount (e.g. when navigating back)
  useEffect(() => {
    router.refresh();
  }, [router]);

  // Synchronize state when initialMeetings changes
  useEffect(() => {
    setMeetings(initialMeetings);
  }, [initialMeetings]);

  const addToast = (message: string, type: "success" | "error") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  /* ── Group meetings by status ─── */
  const { ongoingMeetings, upcomingMeetings, endedMeetings, scheduledMeetings, unscheduledMeetings } =
    useMemo(() => {
      const ongoing: MeetingData[] = [];
      const upcoming: MeetingData[] = [];
      const ended: MeetingData[] = [];
      const scheduled: MeetingData[] = [];
      const unscheduled: MeetingData[] = [];

      for (const m of meetings) {
        const d = new Date(m.startedAt);
        const validDate = m.startedAt && !isNaN(d.getTime());

        if (!validDate) {
          unscheduled.push(m);
        } else {
          scheduled.push(m);
        }

        const status = getMeetingStatus(m);
        if (status === "ongoing") ongoing.push(m);
        else if (status === "upcoming") upcoming.push(m);
        else ended.push(m);
      }

      // Sort upcoming ascending (nearest first)
      upcoming.sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());
      // Sort ended descending (most recent first)
      ended.sort((a, b) => new Date(b.endedAt ?? b.startedAt).getTime() - new Date(a.endedAt ?? a.startedAt).getTime());

      return { ongoingMeetings: ongoing, upcomingMeetings: upcoming, endedMeetings: ended, scheduledMeetings: scheduled, unscheduledMeetings: unscheduled };
    }, [meetings]);

  /* ── Calendar helpers ─── */
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const startDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean; isToday: boolean; dateString: string }[] = [];

    const isSameDay = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    const formatDateKey = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({ date: d, isCurrentMonth: false, isToday: isSameDay(d, new Date()), dateString: formatDateKey(d) });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, isCurrentMonth: true, isToday: isSameDay(d, new Date()), dateString: formatDateKey(d) });
    }

    const totalCells = days.length <= 35 ? 35 : 42;
    const remaining = totalCells - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false, isToday: isSameDay(d, new Date()), dateString: formatDateKey(d) });
    }

    return days;
  }, [year, month]);

  const meetingsByDate = useMemo(() => {
    const map: Record<string, MeetingData[]> = {};
    for (const mtg of scheduledMeetings) {
      const d = new Date(mtg.startedAt);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const key = `${y}-${m}-${day}`;
      if (!map[key]) map[key] = [];
      map[key].push(mtg);
    }
    for (const key in map) {
      map[key].sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());
    }
    return map;
  }, [scheduledMeetings]);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleDragStart = (e: React.DragEvent, meetingId: string) => {
    e.dataTransfer.setData("text/plain", meetingId);
    setDraggingId(meetingId);
  };
  const handleDragEnd = () => { setDraggingId(null); setDragOverDate(null); };
  const handleDragOver = (e: React.DragEvent, dateString: string) => {
    e.preventDefault();
    if (dragOverDate !== dateString) setDragOverDate(dateString);
  };

  const handleDrop = async (e: React.DragEvent, dateString: string) => {
    e.preventDefault();
    const meetingId = e.dataTransfer.getData("text/plain") || draggingId;
    setDraggingId(null);
    setDragOverDate(null);
    if (!meetingId) return;

    const mtg = meetings.find((m) => m.id === meetingId);
    if (!mtg) return;

    const targetDate = new Date(dateString);
    const originalDate = new Date(mtg.startedAt);

    if (!isNaN(originalDate.getTime())) {
      targetDate.setHours(originalDate.getHours(), originalDate.getMinutes(), originalDate.getSeconds(), originalDate.getMilliseconds());
    } else {
      targetDate.setHours(9, 0, 0, 0);
    }

    const newStartedAt = targetDate.toISOString();
    const previousMeetings = meetings;
    setMeetings((prev) => prev.map((m) => (m.id === meetingId ? { ...m, startedAt: newStartedAt } : m)));

    startTransition(async () => {
      const res = await updateMeetingDate(meetingId, newStartedAt);
      if (res?.error) {
        setMeetings(previousMeetings);
        addToast(res.error, "error");
      } else {
        addToast(`Jadwal "${mtg.title}" berhasil dipindahkan`, "success");
      }
    });
  };

  const monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

  /* ──────────────────────────────────── RENDER */
  return (
    <div className="flex flex-col gap-8">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-accent-magenta font-mono text-xs font-bold tracking-widest uppercase mb-1">
            Meeting Planner
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">Rapat Kepanitiaan</h1>
          <p className="mt-2 text-base text-on-surface-variant">
            Rencanakan rapat, bagikan agenda, dan kelola notula rapat.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <ExportButton label="Export CSV" filename="rapat" fetchCsv={exportMeetingsCSV} />
          <Link href="/dashboard/meetings/new">
            <Button className="cursor-pointer">
              <Plus className="size-4" />
              Buat Rapat
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Stats Strip ────────────────────────────────── */}
      {meetings.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex flex-col gap-1">
            <span className="text-2xl font-extrabold text-emerald-700">{ongoingMeetings.length}</span>
            <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Berlangsung
            </span>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 flex flex-col gap-1">
            <span className="text-2xl font-extrabold text-blue-700">{upcomingMeetings.length}</span>
            <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider">
              Akan Datang
            </span>
          </div>
          <div className="bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 flex flex-col gap-1">
            <span className="text-2xl font-extrabold text-gray-500">{endedMeetings.length}</span>
            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider">
              Selesai
            </span>
          </div>
        </div>
      )}

      {/* ── Control Bar ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/40 pb-4">
        <div className="flex items-center gap-2">
          <Calendar className="size-5 text-error" />
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Jadwal Pertemuan</h2>
          {isPending && <Loader2 className="size-4 animate-spin text-accent-magenta ml-2" />}
        </div>
        <div className="flex bg-surface-container rounded-lg p-0.5 border border-outline-variant/30 self-start sm:self-auto">
          <button
            onClick={() => setView("daftar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md font-medium transition-all cursor-pointer ${
              view === "daftar" ? "bg-white text-on-surface shadow-xs font-bold" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <List className="size-3.5" /> Daftar
          </button>
          <button
            onClick={() => setView("kalender")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md font-medium transition-all cursor-pointer ${
              view === "kalender" ? "bg-white text-on-surface shadow-xs font-bold" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Calendar className="size-3.5" /> Kalender
          </button>
        </div>
      </div>

      {/* ── Views ──────────────────────────────────────── */}
      {view === "daftar" ? (
        meetings.length === 0 ? (
          <div className="bg-white border border-outline-variant/60 rounded-2xl p-10 text-center">
            <p className="text-sm font-mono text-on-surface-variant mb-4">
              Belum ada agenda rapat. Klik "Buat Rapat" untuk menjadwalkan.
            </p>
            <Link href="/dashboard/meetings/new">
              <Button variant="outline" className="cursor-pointer">
                <Plus className="size-4" /> Buat Rapat Baru
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {/* ── Ongoing ─────────────────────────── */}
            {ongoingMeetings.length > 0 && (
              <div>
                <SectionDivider
                  icon={<PlayCircle className="size-4" />}
                  label="Sedang Berlangsung"
                  count={ongoingMeetings.length}
                  color="text-emerald-600"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ongoingMeetings.map((m) => <MeetingCard key={m.id} mtg={m} />)}
                </div>
              </div>
            )}

            {/* ── Upcoming ────────────────────────── */}
            {upcomingMeetings.length > 0 && (
              <div>
                <SectionDivider
                  icon={<CalendarClock className="size-4" />}
                  label="Rapat Mendatang"
                  count={upcomingMeetings.length}
                  color="text-blue-600"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingMeetings.map((m) => <MeetingCard key={m.id} mtg={m} />)}
                </div>
              </div>
            )}

            {/* ── Ended ───────────────────────────── */}
            {endedMeetings.length > 0 && (
              <div>
                <SectionDivider
                  icon={<CheckCircle2 className="size-4" />}
                  label="Rapat Selesai"
                  count={endedMeetings.length}
                  color="text-gray-400"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-80">
                  {endedMeetings.map((m) => <MeetingCard key={m.id} mtg={m} />)}
                </div>
              </div>
            )}
          </div>
        )
      ) : (
        /* ── Calendar View ─────────────────────────────── */
        <div className="flex flex-col lg:flex-row gap-6 items-start animate-in fade-in duration-300">
          {/* Main Calendar Grid */}
          <div className="flex-1 w-full overflow-x-auto select-none">
            <div className="min-w-[800px] lg:min-w-0 flex flex-col gap-4">
              {/* Calendar Nav */}
              <div className="flex items-center justify-between bg-white border border-outline-variant/60 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-on-surface font-display">
                    {monthNames[month]} {year}
                  </h3>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {scheduledMeetings.length} Rapat Terjadwal
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button variant="outline" size="sm" onClick={handleToday} className="h-8 text-xs font-mono cursor-pointer">
                    Hari Ini
                  </Button>
                  <div className="flex items-center border border-outline-variant/60 rounded-lg p-0.5">
                    <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-7 w-7 cursor-pointer">
                      <ChevronLeft className="size-4" />
                    </Button>
                    <div className="h-4 w-px bg-outline-variant/60" />
                    <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-7 w-7 cursor-pointer">
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Grid */}
              <div className="border-t border-l border-outline-variant/60 rounded-2xl overflow-hidden bg-white grid grid-cols-7">
                {["Min","Sen","Sel","Rab","Kam","Jum","Sab"].map((dayName, idx) => (
                  <div
                    key={dayName}
                    className={`text-center py-2.5 text-xs font-mono uppercase font-bold text-on-surface-variant bg-surface-container-low border-r border-b border-outline-variant/60 ${
                      idx === 0 || idx === 6 ? "text-error/70" : ""
                    }`}
                  >
                    {dayName}
                  </div>
                ))}

                {calendarDays.map((cell) => {
                  const dayMeetings = meetingsByDate[cell.dateString] || [];
                  const isHovered = dragOverDate === cell.dateString;

                  return (
                    <div
                      key={cell.dateString}
                      onDragOver={(e) => handleDragOver(e, cell.dateString)}
                      onDragLeave={() => setDragOverDate(null)}
                      onDrop={(e) => handleDrop(e, cell.dateString)}
                      className={`border-r border-b border-outline-variant/60 p-2 flex flex-col gap-1.5 min-h-[130px] transition-colors relative ${
                        !cell.isCurrentMonth ? "bg-surface-container-low/40" : "bg-white"
                      } ${isHovered ? "bg-accent-magenta/5 border-accent-magenta/30" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-mono font-medium ${cell.isCurrentMonth ? "text-on-surface-variant/70" : "text-on-surface-variant/30"}`}>
                          {cell.date.getDate() === 1 && `${monthNames[cell.date.getMonth()].substring(0, 3)} `}
                        </span>
                        {cell.isToday ? (
                          <span className="bg-error text-white font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs shadow-sm">
                            {cell.date.getDate()}
                          </span>
                        ) : (
                          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${cell.isCurrentMonth ? "text-on-surface" : "text-on-surface-variant/30"}`}>
                            {cell.date.getDate()}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto max-h-[100px] scrollbar-thin">
                        {dayMeetings.map((mtg) => {
                          const status = getMeetingStatus(mtg);
                          const timeStr = new Date(mtg.startedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
                          return (
                            <Link href={`/dashboard/meetings/${mtg.id}`} key={mtg.id}>
                              <div
                                draggable
                                onDragStart={(e) => handleDragStart(e, mtg.id)}
                                onDragEnd={handleDragEnd}
                                className={`group p-2 rounded-xl border text-left cursor-grab active:cursor-grabbing hover:shadow-xs transition-all ${
                                  draggingId === mtg.id ? "opacity-40" : ""
                                } ${
                                  status === "ended"
                                    ? "bg-gray-50 border-gray-200 hover:border-gray-300"
                                    : status === "ongoing"
                                    ? "bg-emerald-50 border-emerald-200 hover:border-emerald-400"
                                    : mtg.meetingType === "adhoc"
                                    ? "bg-orange-50 border-orange-200 hover:bg-orange-100"
                                    : "bg-indigo-50 border-indigo-200 hover:bg-indigo-100"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <span className={`text-[9px] font-mono font-bold leading-none ${
                                    status === "ended" ? "text-gray-400" :
                                    status === "ongoing" ? "text-emerald-700" :
                                    mtg.meetingType === "adhoc" ? "text-orange-600" : "text-indigo-600"
                                  }`}>
                                    {timeStr}
                                  </span>
                                  {status === "ongoing" && (
                                    <span className="relative flex h-1.5 w-1.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                                    </span>
                                  )}
                                  {status === "ended" && <CheckCircle2 className="size-2.5 text-gray-400" />}
                                </div>
                                <h4 className={`text-xs font-semibold leading-tight line-clamp-2 group-hover:text-accent-magenta transition-colors ${status === "ended" ? "text-gray-400" : "text-on-surface"}`}>
                                  {mtg.title}
                                </h4>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Unscheduled Sidebar */}
          <div className="w-full lg:w-72 shrink-0 bg-white border border-outline-variant/60 rounded-2xl p-4 flex flex-col gap-4 self-stretch">
            <div>
              <h3 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                <AlertCircle className="size-4 text-error" />
                Rapat Tanpa Jadwal ({unscheduledMeetings.length})
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-normal">
                Tarik rapat ke sel kalender untuk menjadwalkannya.
              </p>
            </div>

            <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[400px] lg:max-h-[500px] pr-1">
              {unscheduledMeetings.length === 0 ? (
                <div className="border border-dashed border-outline-variant/60 rounded-xl p-6 text-center text-xs text-on-surface-variant font-mono">
                  Tidak ada rapat tanpa jadwal
                </div>
              ) : (
                unscheduledMeetings.map((mtg) => (
                  <div
                    key={mtg.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, mtg.id)}
                    onDragEnd={handleDragEnd}
                    className={`group p-3 rounded-xl border border-outline-variant/60 bg-surface-container-low cursor-grab active:cursor-grabbing hover:border-accent-magenta/50 transition-all ${
                      draggingId === mtg.id ? "opacity-40" : ""
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        mtg.meetingType === "adhoc"
                          ? "bg-orange-50 text-orange-700 border-orange-200"
                          : "bg-indigo-50 text-indigo-700 border-indigo-200"
                      }`}>
                        {mtg.meetingType === "adhoc" ? "Kondisional" : "Terjadwal"}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold leading-snug text-on-surface group-hover:text-accent-magenta transition-colors mb-1">
                      {mtg.title}
                    </h4>
                    <span className="text-[10px] font-mono text-error font-semibold">Tanggal Tidak Valid</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notifications ─────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto px-4 py-3 rounded-xl shadow-lg text-xs font-mono border flex items-center gap-2 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
              t.type === "success"
                ? "bg-accent-green/10 text-emerald-800 border-accent-green/30"
                : "bg-error/10 text-error border-error/30"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${t.type === "success" ? "bg-accent-green" : "bg-error"}`} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
