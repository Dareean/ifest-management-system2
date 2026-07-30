"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Clock, Building2, User, Tag, Check, AlertCircle,
  Loader2, Mail, FileText, RotateCcw, ExternalLink, Send,
} from "lucide-react";
import Link from "next/link";
import { LetterData, getStatusDisplay, getPriorityDisplay } from "@/lib/data/letters";
import { startProcessingLetter } from "@/lib/actions/letter-workflow";

interface LettersClientProps {
  initialLetters: LetterData[];
  isApprover: boolean; // true = Sekretaris Panitia
  divisions?: { id: string; name: string; slug: string }[];
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

// ─── Tab definitions ────────────────────────────────────────────────────────

type SecretaryTab = "all" | "needs_action" | "processing" | "sent";
type RequesterTab = "active" | "sent";

const SECRETARY_TABS: { key: SecretaryTab; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "needs_action", label: "Butuh Tindakan" },
  { key: "processing", label: "Diproses" },
  { key: "sent", label: "Selesai" },
];

const REQUESTER_TABS: { key: RequesterTab; label: string }[] = [
  { key: "active", label: "Aktif" },
  { key: "sent", label: "Selesai" },
];

function filterSecretary(letters: LetterData[], tab: SecretaryTab) {
  if (tab === "all") return letters;
  if (tab === "needs_action") return letters.filter((l) => l.status === "requested" || l.status === "in_revision");
  if (tab === "processing") return letters.filter((l) => l.status === "processing");
  if (tab === "sent") return letters.filter((l) => l.status === "sent");
  return letters;
}

function filterRequester(letters: LetterData[], tab: RequesterTab) {
  if (tab === "active") return letters.filter((l) => l.status !== "sent");
  if (tab === "sent") return letters.filter((l) => l.status === "sent");
  return letters;
}

const PRIORITIES = [
  { value: "", label: "Semua Prioritas" },
  { value: "tinggi", label: "🔴 Tinggi" },
  { value: "sedang", label: "🟡 Sedang" },
  { value: "rendah", label: "🟢 Rendah" },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export function LettersClient({ initialLetters, isApprover, divisions }: LettersClientProps) {
  const [letters, setLetters] = useState<LetterData[]>(initialLetters);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isPending, startTransition] = useTransition();
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Filter states
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");

  // Sync state when server-filtered initialLetters changes
  useEffect(() => {
    setLetters(initialLetters);
  }, [initialLetters]);

  // Tab state — separate per role
  const [secretaryTab, setSecretaryTab] = useState<SecretaryTab>("all");
  const [requesterTab, setRequesterTab] = useState<RequesterTab>("active");

  const addToast = (message: string, type: "success" | "error") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  };

  const handleStartProcessing = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const previous = letters;
    setLetters((prev) => prev.map((l) => (l.id === id ? { ...l, status: "processing" } : l)));
    setActiveActionId(id);

    startTransition(async () => {
      const res = await startProcessingLetter(id);
      setActiveActionId(null);
      if (res?.error) {
        setLetters(previous);
        addToast(res.error, "error");
      } else {
        addToast("Surat berhasil mulai diproses.", "success");
      }
    });
  };

  // ── Filtered lists ────────────────────────────────────────────────────────
  
  // Base filtered list by division and priority
  const baseFilteredLetters = letters.filter((l) => {
    if (selectedDivision && l.divisionSlug !== selectedDivision) return false;
    if (selectedPriority && l.priority !== selectedPriority) return false;
    return true;
  });

  const displayed = isApprover
    ? filterSecretary(baseFilteredLetters, secretaryTab)
    : filterRequester(baseFilteredLetters, requesterTab);

  // Tab counts based on baseFilteredLetters
  const secretaryCounts: Record<SecretaryTab, number> = {
    all: baseFilteredLetters.length,
    needs_action: baseFilteredLetters.filter((l) => l.status === "requested" || l.status === "in_revision").length,
    processing: baseFilteredLetters.filter((l) => l.status === "processing").length,
    sent: baseFilteredLetters.filter((l) => l.status === "sent").length,
  };

  const requesterCounts: Record<RequesterTab, number> = {
    active: baseFilteredLetters.filter((l) => l.status !== "sent").length,
    sent: baseFilteredLetters.filter((l) => l.status === "sent").length,
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* ── Top Stat Summary Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
            TOTAL PERMOHONAN
          </span>
          <span className="text-2xl font-black text-slate-900 font-sans mt-1">
            {baseFilteredLetters.length}
          </span>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold tracking-widest text-amber-500 uppercase">
            BUTUH TINDAKAN
          </span>
          <span className="text-2xl font-black text-amber-600 font-sans mt-1">
            {secretaryCounts.needs_action}
          </span>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold tracking-widest text-blue-500 uppercase">
            SEDANG DIPROSES
          </span>
          <span className="text-2xl font-black text-blue-600 font-sans mt-1">
            {secretaryCounts.processing}
          </span>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-500 uppercase">
            SELESAI / TTD
          </span>
          <span className="text-2xl font-black text-emerald-600 font-sans mt-1">
            {secretaryCounts.sent}
          </span>
        </div>
      </div>

      {/* ── Section Title & Toolbar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-pink-50 text-pink-500 rounded-xl">
            <Mail className="size-4" />
          </div>
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900 font-sans">
            Daftar Permohonan
          </h2>
          <span className="text-xs font-mono font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {displayed.length}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Tabs Pill Container */}
          {isApprover ? (
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl w-fit">
              {SECRETARY_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSecretaryTab(tab.key)}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                    secretaryTab === tab.key
                      ? "bg-white shadow-xs text-slate-900"
                      : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  {tab.label}
                  {secretaryCounts[tab.key] > 0 && (
                    <span
                      className={`text-[9px] font-bold font-mono min-w-[16px] h-[16px] flex items-center justify-center rounded-full px-1 ${
                        secretaryTab === tab.key
                          ? tab.key === "needs_action"
                            ? "bg-pink-100 text-pink-600"
                            : "bg-slate-900 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {secretaryCounts[tab.key]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl w-fit">
              {REQUESTER_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setRequesterTab(tab.key)}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                    requesterTab === tab.key
                      ? "bg-white shadow-xs text-slate-900"
                      : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  {tab.label}
                  {requesterCounts[tab.key] > 0 && (
                    <span
                      className={`text-[9px] font-bold font-mono min-w-[16px] h-[16px] flex items-center justify-center rounded-full px-1 ${
                        requesterTab === tab.key
                          ? "bg-slate-900 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {requesterCounts[tab.key]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Dropdown Filters (Sekretaris only) */}
          {isApprover && divisions && divisions.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="h-8 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold font-mono text-slate-700 focus:border-slate-900 focus:outline-none cursor-pointer shadow-xs"
              >
                <option value="">Semua Divisi</option>
                {divisions.map((d) => (
                  <option key={d.slug} value={d.slug}>
                    {d.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="h-8 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold font-mono text-slate-700 focus:border-slate-900 focus:outline-none cursor-pointer shadow-xs"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>

              {(selectedDivision || selectedPriority) && (
                <button
                  onClick={() => {
                    setSelectedDivision("");
                    setSelectedPriority("");
                  }}
                  className="h-8 px-2.5 flex items-center gap-1 text-[11px] font-bold font-mono text-pink-500 hover:bg-pink-50 border border-pink-200 rounded-xl transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Empty State ── */}
      {displayed.length === 0 && (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-xs">
          <Mail className="size-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500 font-sans">
            {isApprover
              ? "Tidak ada surat yang sesuai dengan filter."
              : "Belum ada permohonan surat di kategori ini."}
          </p>
          {!isApprover && (
            <Link href="/dashboard/letters/new">
              <Button variant="outline" size="sm" className="mt-4 cursor-pointer rounded-xl font-mono text-xs">
                <Plus className="size-4" /> Ajukan Sekarang
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* ── Card Grid (2 Columns) ── */}
      {displayed.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayed.map((letter) => {
            const status = getStatusDisplay(letter.status);
            const prio = getPriorityDisplay(letter.priority);
            const isCurrentAction = activeActionId === letter.id;

            return (
              <div
                key={letter.id}
                className="bg-white border border-[#04000D]/5 rounded-2xl p-6 flex flex-col justify-between hover:border-accent-magenta/30 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-md transition-all group"
              >
                {/* Main Card Link Area */}
                <Link href={`/dashboard/letters/${letter.id}`} className="block flex-1">
                  {/* Status & Priority Header */}
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={prio.variant} className="text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                        {prio.label}
                      </Badge>
                      <Badge variant={status.variant} className="text-[10px] font-mono px-2.5 py-0.5 uppercase tracking-wide rounded-full font-bold">
                        {status.label}
                      </Badge>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 font-medium">
                      {(() => {
                        const date = new Date(letter.createdAt);
                        const dStr = date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
                        const tStr = date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
                        return `${dStr} • ${tStr} WITA`;
                      })()}
                    </span>
                  </div>

                  {/* Subject Title */}
                  <h3 className="font-sans text-lg font-black text-slate-900 group-hover:text-pink-500 transition-colors leading-snug mb-3 line-clamp-2">
                    {letter.subject}
                  </h3>

                  {/* Metadata List */}
                  <div className="flex flex-col gap-2 text-xs font-mono text-slate-500 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-200/50 pb-1.5">
                      <FileText className="size-4 shrink-0 text-pink-500" />
                      <span>No. Surat: <strong className="font-mono text-pink-600 font-black">{letter.trackingNo.includes('/') ? '' : '#'}{letter.trackingNo}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="size-4 shrink-0 text-slate-400" />
                      <span className="truncate">
                        {letter.requester}
                        {isApprover && <> &middot; <strong className="text-slate-800 font-bold">{letter.division}</strong></>}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Tag className="size-4 shrink-0 text-slate-400" />
                      <span className="truncate">
                        {letter.letterType.toUpperCase()}
                        {letter.category && ` — ${letter.category}`}
                      </span>
                    </div>

                    {letter.targetInstitution && (
                      <div className="flex items-center gap-2">
                        <Building2 className="size-4 shrink-0 text-slate-400" />
                        <span className="truncate text-slate-700 font-semibold">{letter.targetInstitution}</span>
                      </div>
                    )}

                    {letter.deadlineAt && (
                      <div className="flex items-center gap-2 text-pink-600 font-bold pt-1 border-t border-slate-200/50">
                        <Clock className="size-4 shrink-0 text-pink-500" />
                        <span>
                          Tenggat:{" "}
                          {(() => {
                            const date = new Date(letter.deadlineAt);
                            const dStr = date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
                            const tStr = date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
                            return `${dStr} • ${tStr} WITA`;
                          })()}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* ── Card Action Footer ── */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                    AKSI CEPAT
                  </span>

                  <div className="flex items-center gap-2">
                    {isApprover && (letter.status === "requested" || letter.status === "in_revision") && (
                      <Button
                        onClick={(e) => handleStartProcessing(letter.id, e)}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs font-mono font-bold border-slate-300 text-slate-800 hover:bg-slate-900 hover:text-white rounded-xl cursor-pointer gap-1.5 shadow-xs"
                        disabled={isCurrentAction && isPending}
                      >
                        {isCurrentAction && isPending ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Send className="size-3 text-pink-500" />
                        )}
                        Proses Surat
                      </Button>
                    )}

                    {letter.status === "processing" && (
                      <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                        Sedang Diproses
                      </span>
                    )}

                    {letter.status === "sent" && (
                      <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 flex items-center gap-1">
                        <Check className="size-3.5" /> Selesai
                      </span>
                    )}

                    <Link href={`/dashboard/letters/${letter.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs font-mono font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                      >
                        Detail →
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Toast Notifications ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto px-4 py-3 rounded-xl shadow-lg text-xs font-mono border flex items-center gap-2 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
              t.type === "success"
                ? "bg-white text-emerald-800 border-emerald-200"
                : "bg-white text-error border-error/30"
            }`}
          >
            <div className={`w-2 h-2 rounded-full shrink-0 ${t.type === "success" ? "bg-emerald-500" : "bg-error"}`} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
