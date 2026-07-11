"use client";

import { useState, useTransition, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, List, ChevronLeft, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { ExportButton } from "@/components/export-button";
import { MeetingData } from "@/lib/data/meetings";
import { updateMeetingDate } from "@/lib/actions/meetings";

interface MeetingsClientProps {
  initialMeetings: MeetingData[];
  exportMeetingsCSV: any; // function reference
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

function getNotesBadge(status: string) {
  if (status === "published") {
    return <Badge variant="success" className="text-[9px] font-mono px-2 py-0">Notulensi Ada</Badge>;
  }
  if (status === "draft") {
    return <Badge variant="warning" className="text-[9px] font-mono px-2 py-0">Draft</Badge>;
  }
  return null;
}

function getScopeBadge(scope: string) {
  if (scope === "all") {
    return <Badge variant="outline" className="text-[9px] font-mono px-2 py-0 bg-accent-green/10 text-accent-green border-accent-green/30">Semua</Badge>;
  }
  if (scope === "division") {
    return <Badge variant="outline" className="text-[9px] font-mono px-2 py-0 bg-accent-lilac/10 text-accent-lilac border-accent-lilac/30">Divisi</Badge>;
  }
  return null;
}

export function MeetingsClient({ initialMeetings, exportMeetingsCSV }: MeetingsClientProps) {
  const [meetings, setMeetings] = useState<MeetingData[]>(initialMeetings);
  const [view, setView] = useState<"daftar" | "kalender">("daftar");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isPending, startTransition] = useTransition();

  const addToast = (message: string, type: "success" | "error") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Divide meetings into scheduled and unscheduled
  const { scheduledMeetings, unscheduledMeetings } = useMemo(() => {
    const scheduled: MeetingData[] = [];
    const unscheduled: MeetingData[] = [];

    for (const m of meetings) {
      const d = new Date(m.startedAt);
      if (!m.startedAt || isNaN(d.getTime())) {
        unscheduled.push(m);
      } else {
        scheduled.push(m);
      }
    }

    return { scheduledMeetings: scheduled, unscheduledMeetings: unscheduled };
  }, [meetings]);

  // Calendar logic helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun, 6 = Sat
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

    // Trailing days from previous month
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: isSameDay(d, new Date()),
        dateString: formatDateKey(d),
      });
    }

    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d,
        isCurrentMonth: true,
        isToday: isSameDay(d, new Date()),
        dateString: formatDateKey(d),
      });
    }

    // Leading days from next month to complete 35 or 42 grid cells
    const totalCells = days.length <= 35 ? 35 : 42;
    const remaining = totalCells - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: isSameDay(d, new Date()),
        dateString: formatDateKey(d),
      });
    }

    return days;
  }, [year, month]);

  // Group scheduled meetings by local date key (YYYY-MM-DD)
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
    // Sort meetings inside each day by time
    for (const key in map) {
      map[key].sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());
    }
    return map;
  }, [scheduledMeetings]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, meetingId: string) => {
    e.dataTransfer.setData("text/plain", meetingId);
    setDraggingId(meetingId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverDate(null);
  };

  const handleDragOver = (e: React.DragEvent, dateString: string) => {
    e.preventDefault();
    if (dragOverDate !== dateString) {
      setDragOverDate(dateString);
    }
  };

  const handleDrop = async (e: React.DragEvent, dateString: string) => {
    e.preventDefault();
    const meetingId = e.dataTransfer.getData("text/plain") || draggingId;
    setDraggingId(null);
    setDragOverDate(null);

    if (!meetingId) return;

    const mtg = meetings.find((m) => m.id === meetingId);
    if (!mtg) return;

    // Calculate new startedAt keeping original hours/minutes if valid
    const targetDate = new Date(dateString); // YYYY-MM-DD
    const originalDate = new Date(mtg.startedAt);

    if (!isNaN(originalDate.getTime())) {
      targetDate.setHours(originalDate.getHours());
      targetDate.setMinutes(originalDate.getMinutes());
      targetDate.setSeconds(originalDate.getSeconds());
      targetDate.setMilliseconds(originalDate.getMilliseconds());
    } else {
      // Unscheduled defaults to 09:00 AM
      targetDate.setHours(9, 0, 0, 0);
    }

    const newStartedAt = targetDate.toISOString();

    // Optimistically update
    const previousMeetings = meetings;
    setMeetings((prev) =>
      prev.map((m) => (m.id === meetingId ? { ...m, startedAt: newStartedAt } : m))
    );

    startTransition(async () => {
      const res = await updateMeetingDate(meetingId, newStartedAt);
      if (res?.error) {
        setMeetings(previousMeetings);
        addToast(res.error, "error");
      } else {
        addToast(`Jadwal "${mtg.title}" berhasil dipindahkan ke ${targetDate.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`, "success");
      }
    });
  };

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-accent-magenta font-mono text-xs font-bold tracking-widest uppercase mb-1">
            Meeting Planner
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
            Rapat Kepanitiaan
          </h1>
          <p className="mt-2 text-base text-on-surface-variant">
            Rencanakan rapat, bagikan agenda, dan kelola notula rapat.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 sm:self-end">
          <ExportButton label="Export CSV" filename="rapat" fetchCsv={exportMeetingsCSV} />
          <Link href="/dashboard/meetings/new">
            <Button className="cursor-pointer">
              <Plus className="size-4" />
              Buat Rapat
            </Button>
          </Link>
        </div>
      </div>

      {/* Control Bar (View Switcher) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/40 pb-4">
        <div className="flex items-center gap-2">
          <Calendar className="size-5 text-error" />
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Jadwal Pertemuan</h2>
          {isPending && <Loader2 className="size-4 animate-spin text-accent-magenta ml-2" />}
        </div>

        {/* Toggle Switcher */}
        <div className="flex bg-surface-container rounded-lg p-0.5 border border-outline-variant/30 self-start sm:self-auto">
          <button
            onClick={() => setView("daftar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md font-medium transition-all cursor-pointer ${
              view === "daftar"
                ? "bg-white text-on-surface shadow-xs font-bold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <List className="size-3.5" />
            Daftar
          </button>
          <button
            onClick={() => setView("kalender")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md font-medium transition-all cursor-pointer ${
              view === "kalender"
                ? "bg-white text-on-surface shadow-xs font-bold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Calendar className="size-3.5" />
            Kalender
          </button>
        </div>
      </div>

      {/* Views Container */}
      {view === "daftar" ? (
        /* List/Grid Cards View */
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetings.map((mtg) => {
              const dateObj = new Date(mtg.startedAt);
              const isDateValid = mtg.startedAt && !isNaN(dateObj.getTime());
              return (
                <Link href={`/dashboard/meetings/${mtg.id}`} key={mtg.id} className="block group">
                  <Card className="bg-white border border-outline-variant/60 rounded-2xl p-6 flex flex-col justify-between h-full hover:border-accent-magenta/50 transition-all">
                    <CardHeader className="p-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                          <Badge variant={mtg.meetingType === "adhoc" ? "warning" : "info"} className="text-[10px] font-mono">
                            {mtg.meetingType === "adhoc" ? "Kondisional" : "Terjadwal"}
                          </Badge>
                          {getScopeBadge(mtg.scope)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {getNotesBadge(mtg.notesStatus)}
                          {mtg.inviteeCount > 0 && (
                            <span className="text-xs font-mono text-on-surface-variant">
                              {mtg.inviteeCount} peserta
                            </span>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-base font-bold text-on-surface group-hover:text-accent-magenta transition-colors leading-tight mb-2">
                        {mtg.title}
                      </CardTitle>
                      <CardDescription className={`text-xs font-mono ${!isDateValid ? "text-error font-bold" : ""}`}>
                        {isDateValid ? (
                          dateObj.toLocaleDateString("id-ID", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })
                        ) : (
                          "Tanggal Tidak Valid"
                        )}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        )
      ) : (
        /* Calendar View */
        <div className="flex flex-col lg:flex-row gap-6 items-start animate-in fade-in duration-300">
          {/* Main Calendar Grid */}
          <div className="flex-1 w-full overflow-x-auto select-none">
            <div className="min-w-[800px] lg:min-w-0 flex flex-col gap-4">
              {/* Calendar Header with Navigation */}
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

              {/* Grid 7 Columns (Minggu - Sabtu) */}
              <div className="border-t border-l border-outline-variant/60 rounded-2xl overflow-hidden bg-white grid grid-cols-7">
                {/* Weekday Names */}
                {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((dayName, idx) => (
                  <div
                    key={dayName}
                    className={`text-center py-2.5 text-xs font-mono uppercase font-bold text-on-surface-variant bg-surface-container-low border-r border-b border-outline-variant/60 ${
                      idx === 0 || idx === 6 ? "text-error/70" : ""
                    }`}
                  >
                    {dayName}
                  </div>
                ))}

                {/* Day Cells */}
                {calendarDays.map((cell) => {
                  const dayMeetings = meetingsByDate[cell.dateString] || [];
                  const isHovered = dragOverDate === cell.dateString;
                  const isCurrentMonth = cell.isCurrentMonth;
                  const isFirstDay = cell.date.getDate() === 1;

                  return (
                    <div
                      key={cell.dateString}
                      onDragOver={(e) => handleDragOver(e, cell.dateString)}
                      onDragLeave={() => setDragOverDate(null)}
                      onDrop={(e) => handleDrop(e, cell.dateString)}
                      className={`border-r border-b border-outline-variant/60 p-2 flex flex-col gap-1.5 min-h-[130px] transition-colors relative ${
                        !isCurrentMonth ? "bg-surface-container-low/40" : "bg-white"
                      } ${isHovered ? "bg-accent-magenta/5 border-accent-magenta/30" : ""}`}
                    >
                      {/* Cell Date Header */}
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-[10px] font-mono font-medium ${
                            isCurrentMonth ? "text-on-surface-variant/70" : "text-on-surface-variant/30"
                          }`}
                        >
                          {isFirstDay && `${monthNames[cell.date.getMonth()].substring(0, 3)} `}
                        </span>
                        {cell.isToday ? (
                          <span className="bg-error text-white font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs shadow-sm">
                            {cell.date.getDate()}
                          </span>
                        ) : (
                          <span
                            className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                              isCurrentMonth ? "text-on-surface" : "text-on-surface-variant/30"
                            }`}
                          >
                            {cell.date.getDate()}
                          </span>
                        )}
                      </div>

                      {/* Day Meetings Content */}
                      <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto max-h-[100px] scrollbar-thin">
                        {dayMeetings.map((mtg) => {
                          const dateObj = new Date(mtg.startedAt);
                          const timeStr = dateObj.toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          });

                          return (
                            <Link href={`/dashboard/meetings/${mtg.id}`} key={mtg.id}>
                              <div
                                draggable
                                onDragStart={(e) => handleDragStart(e, mtg.id)}
                                onDragEnd={handleDragEnd}
                                className={`group p-2 rounded-xl border text-left cursor-grab active:cursor-grabbing hover:shadow-xs hover:border-accent-magenta/40 transition-all ${
                                  draggingId === mtg.id ? "opacity-40" : ""
                                } ${
                                  mtg.meetingType === "adhoc"
                                    ? "bg-accent-coral/5 border-accent-coral/20 hover:bg-accent-coral/10"
                                    : "bg-accent-lilac/5 border-accent-lilac/20 hover:bg-accent-lilac/10"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <span
                                    className={`text-[9px] font-mono font-bold leading-none ${
                                      mtg.meetingType === "adhoc" ? "text-orange-600" : "text-indigo-600"
                                    }`}
                                  >
                                    {timeStr}
                                  </span>
                                  {mtg.scope === "all" && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent-green" title="Semua" />
                                  )}
                                  {mtg.scope === "division" && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent-lilac" title="Divisi" />
                                  )}
                                </div>
                                <h4 className="text-xs font-semibold leading-tight text-on-surface line-clamp-2 group-hover:text-accent-magenta transition-colors">
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

          {/* Unscheduled Sidebar Panel */}
          <div className="w-full lg:w-72 shrink-0 bg-white border border-outline-variant/60 rounded-2xl p-4 flex flex-col gap-4 self-stretch">
            <div>
              <h3 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                <AlertCircle className="size-4 text-error" />
                Rapat Tanpa Jadwal ({unscheduledMeetings.length})
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-normal">
                Rapat di bawah ini belum memiliki tanggal yang valid. Tarik (drag) rapat ke sel kalender di samping untuk menjadwalkannya.
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
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <Badge variant={mtg.meetingType === "adhoc" ? "warning" : "info"} className="text-[8px] font-mono py-0">
                        {mtg.meetingType === "adhoc" ? "Kondisional" : "Terjadwal"}
                      </Badge>
                      {getScopeBadge(mtg.scope)}
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

      {/* Floating Toast Notification Center */}
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
