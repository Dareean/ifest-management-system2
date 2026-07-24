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
      {/* ── Toolbar: Tabs on Left, Dropdowns on Right ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/20 pb-4 mb-2">
        {isApprover ? (
          <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl w-fit">
            {SECRETARY_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSecretaryTab(tab.key)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  secretaryTab === tab.key
                    ? "bg-white shadow-sm text-on-surface"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-white/50"
                }`}
              >
                {tab.label}
                {secretaryCounts[tab.key] > 0 && (
                  <span
                    className={`text-[10px] font-bold font-mono min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 ${
                      secretaryTab === tab.key
                        ? tab.key === "needs_action"
                          ? "bg-error/10 text-error"
                          : "bg-primary/10 text-primary"
                        : "bg-outline-variant/40 text-on-surface-variant"
                    }`}
                  >
                    {secretaryCounts[tab.key]}
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl w-fit">
            {REQUESTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setRequesterTab(tab.key)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  requesterTab === tab.key
                    ? "bg-white shadow-sm text-on-surface"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-white/50"
                }`}
              >
                {tab.label}
                {requesterCounts[tab.key] > 0 && (
                  <span
                    className={`text-[10px] font-bold font-mono min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 ${
                      requesterTab === tab.key
                        ? "bg-primary/10 text-primary"
                        : "bg-outline-variant/40 text-on-surface-variant"
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
          <div className="flex flex-wrap items-center gap-2">
            {/* Division dropdown */}
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="h-9 rounded-lg border border-outline-variant/60 bg-surface-bright px-3 text-xs font-bold text-on-surface focus:border-primary focus:outline-none cursor-pointer"
            >
              <option value="">Semua Divisi</option>
              {divisions.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Priority dropdown */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="h-9 rounded-lg border border-outline-variant/60 bg-surface-bright px-3 text-xs font-bold text-on-surface focus:border-primary focus:outline-none cursor-pointer"
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>

            {/* Reset button */}
            {(selectedDivision || selectedPriority) && (
              <button
                onClick={() => {
                  setSelectedDivision("");
                  setSelectedPriority("");
                }}
                className="h-9 px-3 flex items-center gap-1 text-xs font-bold text-on-surface-variant hover:text-error hover:bg-error/5 border border-outline-variant/40 rounded-lg transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Empty State ── */}
      {displayed.length === 0 && (
        <div className="bg-white border border-outline-variant/60 rounded-2xl p-12 text-center">
          <Mail className="size-10 text-on-surface-variant/20 mx-auto mb-3" />
          <p className="text-sm font-medium text-on-surface-variant">
            {isApprover
              ? "Tidak ada surat yang sesuai filter."
              : "Belum ada permohonan surat di kategori ini."}
          </p>
          {!isApprover && (
            <Link href="/dashboard/letters/new">
              <Button variant="outline" className="mt-4 cursor-pointer">
                <Plus className="size-4" /> Ajukan Sekarang
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* ── Card Grid ── */}
      {displayed.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayed.map((letter) => {
            const status = getStatusDisplay(letter.status);
            const prio = getPriorityDisplay(letter.priority);
            const isCurrentAction = activeActionId === letter.id;

            return (
              <div
                key={letter.id}
                className="bg-white border border-outline-variant/60 rounded-2xl flex flex-col hover:border-accent-magenta/50 hover:shadow-sm transition-all shadow-xs"
              >
                {/* Card Clickable Content */}
                <Link href={`/dashboard/letters/${letter.id}`} className="block p-6 flex-1">
                  {/* Status & Priority Row */}
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <Badge variant={prio.variant} className="text-[10px] font-mono px-2 py-0.5">
                        {prio.label}
                      </Badge>
                      <Badge variant={status.variant} className="text-[10px] font-mono px-2 py-0.5 uppercase tracking-wide">
                        {status.label}
                      </Badge>
                    </div>
                    <span className="text-[10px] font-mono text-on-surface-variant">
                      {new Date(letter.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Subject */}
                  <h3 className="font-sans text-base font-bold text-on-surface group-hover:text-accent-magenta leading-snug mb-3 line-clamp-2">
                    {letter.subject}
                  </h3>

                  {/* Metadata */}
                  <div className="flex flex-col gap-1.5 text-xs font-mono text-on-surface-variant">
                    <div className="flex items-center gap-2">
                      <User className="size-3.5 shrink-0 opacity-60" />
                      <span className="truncate">
                        {letter.requester}
                        {isApprover && <> &middot; <strong className="text-on-surface font-semibold">{letter.division}</strong></>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="size-3.5 shrink-0 opacity-60" />
                      <span className="truncate">
                        {letter.letterType.toUpperCase()}
                        {letter.category && ` — ${letter.category}`}
                      </span>
                    </div>
                    {letter.targetInstitution && (
                      <div className="flex items-center gap-2">
                        <Building2 className="size-3.5 shrink-0 opacity-60" />
                        <span className="truncate">{letter.targetInstitution}</span>
                      </div>
                    )}
                    {letter.deadlineAt && (
                      <div className="flex items-center gap-2 text-error font-medium">
                        <Clock className="size-3.5 shrink-0" />
                        <span>
                          Tenggat:{" "}
                          {new Date(letter.deadlineAt).toLocaleDateString("id-ID", {
                            day: "numeric", month: "long", year: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* ── Secretary Quick Action Bar ── */}
                {isApprover && (
                  <div className="border-t border-outline-variant/30 px-6 py-3 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-on-surface-variant font-semibold uppercase tracking-wider">
                      Aksi Cepat
                    </span>
                    <div className="flex items-center gap-2">
                      {(letter.status === "requested" || letter.status === "in_revision") && (
                        <Button
                          onClick={(e) => handleStartProcessing(letter.id, e)}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs font-mono border-primary/30 text-primary hover:bg-primary/5 cursor-pointer gap-1.5"
                          disabled={isCurrentAction && isPending}
                        >
                          {isCurrentAction && isPending ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <Send className="size-3" />
                          )}
                          Proses Surat
                        </Button>
                      )}
                      {letter.status === "processing" && (
                        <span className="text-[11px] font-sans font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                          Sedang Diproses
                        </span>
                      )}
                      {letter.status === "sent" && (
                        <span className="text-[11px] font-sans font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                          <Check className="size-3.5" /> Selesai
                        </span>
                      )}
                      <Link href={`/dashboard/letters/${letter.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs font-mono text-on-surface-variant hover:text-on-surface cursor-pointer"
                        >
                          Detail →
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* ── Requester Status Indicator ── */}
                {!isApprover && (
                  <div className="border-t border-outline-variant/30 px-6 py-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {letter.status === "requested" && (
                        <>
                          <div className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/40 animate-pulse" />
                          <span className="text-[11px] font-mono text-on-surface-variant">Menunggu diproses sekretaris</span>
                        </>
                      )}
                      {letter.status === "processing" && (
                        <>
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span className="text-[11px] font-mono text-amber-700 font-semibold">Sedang diproses sekretaris</span>
                        </>
                      )}
                      {letter.status === "in_revision" && (
                        <>
                          <div className="w-1.5 h-1.5 rounded-full bg-accent-coral" />
                          <span className="text-[11px] font-mono text-accent-coral font-semibold">Dalam revisi</span>
                        </>
                      )}
                      {letter.status === "sent" && (
                        <>
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span className="text-[11px] font-mono text-primary font-semibold">Dokumen siap diunduh</span>
                        </>
                      )}
                    </div>
                    <Link href={`/dashboard/letters/${letter.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs font-mono text-on-surface-variant hover:text-on-surface cursor-pointer"
                      >
                        Lihat Status →
                      </Button>
                    </Link>
                  </div>
                )}
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
