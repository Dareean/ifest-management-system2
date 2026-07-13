"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { RichTextDisplay } from "@/components/ui/rich-text-display";
import {
  ArrowLeft, ExternalLink, MapPin, Clock,
  Check, X, HelpCircle, Users, FileText, StopCircle,
  CalendarDays, BookOpen, ListChecks, Lightbulb,
  ChevronDown, ChevronUp, PenLine, CalendarPlus,
} from "lucide-react";
import { updateRsvp, saveNotes, publishNotes, endMeeting, markAttendance } from "@/lib/actions/meeting-workflow";
import type { MeetingDetail } from "@/lib/data/meeting-detail";
import { cn } from "@/lib/utils";
import { generateGoogleCalendarUrl } from "@/lib/utils/calendar";

/* ─── RSVP helpers ─────────────────────────────────────────────── */

const rsvpColors: Record<string, string> = {
  pending: "bg-surface-container border-outline-variant text-on-surface-variant",
  accepted: "bg-accent-green/10 border-accent-green/30 text-accent-green",
  declined: "bg-error-container border-error/30 text-error",
};

const rsvpIcons: Record<string, React.ReactNode> = {
  pending: <HelpCircle className="size-3.5" />,
  accepted: <Check className="size-3.5" />,
  declined: <X className="size-3.5" />,
};

const rsvpLabel: Record<string, string> = {
  accepted: "Hadir",
  declined: "Tidak Hadir",
  pending: "Pending",
};

/* ─── Stat / Info pill ──────────────────────────────────────────── */
function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 size-8 rounded-full bg-surface-container flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">{label}</span>
        <span className="text-sm font-medium text-on-surface leading-snug break-words">{value}</span>
      </div>
    </div>
  );
}

/* ─── Section header ────────────────────────────────────────────── */
function SectionLabel({ icon, label, accent = false }: { icon: React.ReactNode; label: string; accent?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className={accent ? "text-accent-magenta" : "text-on-surface-variant"}>{icon}</span>
      <h2 className={cn(
        "text-xs font-mono font-bold tracking-widest uppercase",
        accent ? "text-accent-magenta" : "text-on-surface-variant"
      )}>
        {label}
      </h2>
    </div>
  );
}

/* ─── Invitee avatar bg ─────────────────────────────────────────── */
const avatarColors = [
  "bg-block-lime", "bg-block-lilac", "bg-block-mint",
  "bg-block-coral", "bg-block-pink",
];
function getAvatarBg(name: string) {
  return avatarColors[name.charCodeAt(0) % avatarColors.length];
}
function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

/* ─── Main component ────────────────────────────────────────────── */
export function MeetingDetailClient({
  meeting,
  currentUserAssignmentId,
  currentUserIsApprover,
}: {
  meeting: MeetingDetail;
  currentUserAssignmentId: string | null;
  currentUserIsApprover: boolean;
}) {
  const router = useRouter();
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [notesContent, setNotesContent] = useState(meeting.notes?.content ?? "");
  const [showAllInvitees, setShowAllInvitees] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState<string | null>(null);

  const [notesState, notesAction, notesPending] = useActionState(saveNotes, null);

  const startDate = new Date(meeting.startedAt);
  const formattedDate = startDate.toLocaleDateString("id-ID", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const formattedTime = startDate.toLocaleTimeString("id-ID", {
    hour: "2-digit", minute: "2-digit",
  });

  const isCreator = meeting.creatorId === currentUserAssignmentId;
  const isSekretarisAllMeeting = currentUserIsApprover && meeting.scope === "all";
  const canWriteNotes = isCreator || isSekretarisAllMeeting;

  const notesPublished = meeting.notes?.publishedAt;
  const notesExist = !!meeting.notes;
  const meetingEnded = !!meeting.endedAt;

  const now = new Date();
  const meetingStatus = meeting.endedAt
    ? "ended"
    : startDate <= now
    ? "ongoing"
    : "upcoming";

  async function handleRsvp(inviteeId: string, status: string) {
    const result = await updateRsvp(inviteeId, status);
    if (result.error) setActionMsg(result.error);
    else router.refresh();
  }

  async function handleEnd() {
    const result = await endMeeting(meeting.id);
    if (result.error) setActionMsg(result.error);
    else router.refresh();
  }

  async function handleMarkAttendance(
    inviteeId: string,
    currentStatus: string,
  ) {
    const nextStatus =
      currentStatus === "accepted" ? "declined" :
      currentStatus === "declined" ? "pending" : "accepted";
    setAttendanceLoading(inviteeId);
    const result = await markAttendance(meeting.id, inviteeId, nextStatus as "accepted" | "declined" | "pending");
    setAttendanceLoading(null);
    if (result.error) setActionMsg(result.error);
    else router.refresh();
  }

  async function handlePublish() {
    const result = await publishNotes(meeting.id);
    if (result.error) setActionMsg(result.error);
    else router.refresh();
  }

  /* Hitung RSVP summary */
  const rsvpCounts = meeting.invitees.reduce(
    (acc, inv) => {
      acc[inv.rsvpStatus] = (acc[inv.rsvpStatus] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const inviteesToShow = showAllInvitees ? meeting.invitees : meeting.invitees.slice(0, 8);

  /* ───────────────────────────────────────────── RENDER */
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 px-4 py-6">

      {/* ── BACK + HEADER ─────────────────────────────── */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-mono text-on-surface-variant hover:text-on-surface transition-colors mb-5 cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Daftar Rapat
        </button>

        {/* Badges row */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {meetingStatus === "ongoing" && (
            <Badge
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-mono px-2.5 py-0.5 flex items-center gap-1.5"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              Sedang Berlangsung
            </Badge>
          )}

          {meetingStatus === "upcoming" && (
            <Badge
              className="bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-mono px-2.5 py-0.5"
            >
              Akan Datang
            </Badge>
          )}

          {meetingStatus === "ended" && (
            <Badge
              variant="secondary"
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-[10px] font-mono px-2.5 py-0.5"
            >
              Selesai
            </Badge>
          )}

          <Badge
            variant={meeting.meetingType === "adhoc" ? "warning" : "info"}
            className="text-[10px] font-mono px-2.5 py-0.5"
          >
            {meeting.meetingType === "adhoc" ? "Kondisional" : "Terjadwal"}
          </Badge>

          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-mono px-2.5 py-0.5",
              meeting.scope === "all"
                ? "bg-accent-green/10 text-accent-green border-accent-green/30"
                : meeting.scope === "division"
                ? "bg-accent-lilac/10 text-accent-lilac border-accent-lilac/30"
                : "bg-surface-container text-on-surface-variant border-outline-variant"
            )}
          >
            {meeting.scope === "all"
              ? "Seluruh Panitia"
              : meeting.scope === "division"
              ? "Divisi"
              : "Terbatas"}
          </Badge>

          {notesPublished && (
            <Badge variant="success" className="text-[10px] font-mono px-2.5 py-0.5">
              Notulensi Tersedia
            </Badge>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface leading-tight">
          {meeting.title}
        </h1>
      </div>

      {/* ── ERROR MSG ─────────────────────────────────── */}
      {actionMsg && (
        <div className="text-sm text-error bg-error-container border border-error/20 rounded-xl p-4 font-mono">
          {actionMsg}
        </div>
      )}

      {/* ── MAIN LAYOUT: 2/3 + 1/3 ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* ═══ LEFT COLUMN: agenda + notulensi ══════════ */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* ── Agenda ─────────────────────────────────── */}
          {meeting.agenda && (
            <section className="bg-white border border-outline-variant/60 rounded-[24px] overflow-hidden">
              <div className="px-6 pt-5 pb-4 border-b border-outline-variant/20 flex items-center justify-between">
                <SectionLabel icon={<CalendarDays className="size-4" />} label="Agenda Rapat" />
              </div>
              <div className="px-6 py-5">
                <p className="whitespace-pre-wrap text-on-surface font-sans leading-relaxed text-sm">
                  {meeting.agenda}
                </p>
              </div>
            </section>
          )}

          {/* ── Notulensi ──────────────────────────────── */}
          <section className="bg-white border border-outline-variant/60 rounded-[24px] overflow-hidden">
            {/* Section header */}
            <div className="px-6 pt-5 pb-4 border-b border-outline-variant/20 flex items-center justify-between gap-3">
              <SectionLabel icon={<BookOpen className="size-4" />} label="Notulensi Rapat" accent />
              <div className="flex items-center gap-2">
                {notesPublished ? (
                  <Badge variant="success" className="text-[10px] font-mono px-2.5 py-0.5">
                    Dipublikasikan
                  </Badge>
                ) : notesExist ? (
                  <Badge variant="warning" className="text-[10px] font-mono px-2.5 py-0.5">
                    Draft
                  </Badge>
                ) : null}

                {/* Edit button inside header for authorized users */}
                {canWriteNotes && !meetingEnded && (
                  <button
                    onClick={() => setShowNotesModal(true)}
                    className="flex items-center gap-1.5 text-[10px] font-mono font-bold bg-surface-container hover:bg-surface-container-high px-3 py-1.5 rounded-full transition-colors cursor-pointer text-on-surface-variant hover:text-on-surface border border-outline-variant/40"
                  >
                    <PenLine className="size-3" />
                    {notesExist ? "Edit" : "Tulis Notulensi"}
                  </button>
                )}
              </div>
            </div>

            {/* Body */}
            {notesPublished ? (
              /* ── Published notulensi */
              <div className="px-6 py-5 flex flex-col gap-6">
                {/* Meta info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-mono">
                  <span className="font-bold text-on-surface">
                    Ditulis oleh: {meeting.notes!.writer}
                  </span>
                  <span className="text-on-surface-variant">
                    {new Date(meeting.notes!.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Rich text body */}
                <RichTextDisplay html={meeting.notes!.content} />

                {/* Decision Points */}
                {meeting.notes!.decisionPoints.length > 0 && (
                  <div className="rounded-2xl bg-block-lilac/20 border border-block-lilac/40 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="size-4 text-accent-lilac" />
                      <p className="text-xs font-mono font-bold tracking-widest uppercase text-on-surface">
                        Poin Keputusan
                      </p>
                    </div>
                    <ul className="flex flex-col gap-2">
                      {meeting.notes!.decisionPoints.map((dp: string, i: number) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-on-surface">
                          <span className="size-5 rounded-full bg-block-lilac flex items-center justify-center text-[10px] font-mono font-bold text-primary shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="leading-snug">{dp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Items */}
                {meeting.notes!.actionItems.length > 0 && (
                  <div className="rounded-2xl bg-block-lime/30 border border-block-lime/50 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <ListChecks className="size-4 text-on-surface" />
                      <p className="text-xs font-mono font-bold tracking-widest uppercase text-on-surface">
                        Action Items
                      </p>
                    </div>
                    <ul className="flex flex-col gap-2">
                      {meeting.notes!.actionItems.map((ai: string, i: number) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-on-surface">
                          <span className="size-5 rounded-full border-2 border-on-surface flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5 bg-white">
                            {i + 1}
                          </span>
                          <span className="leading-snug">{ai}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              /* ── No notes / not published yet */
              <div className="px-6 py-10 flex flex-col items-center gap-3 text-center">
                <div className="size-14 rounded-full bg-surface-container flex items-center justify-center">
                  <BookOpen className="size-6 text-on-surface-variant" />
                </div>
                {!meetingEnded ? (
                  <>
                    <p className="text-sm font-bold text-on-surface">
                      Rapat masih berlangsung
                    </p>
                    <p className="text-xs text-on-surface-variant font-mono max-w-xs">
                      Notulensi akan tersedia setelah rapat selesai dan diproses oleh sekretaris.
                    </p>
                  </>
                ) : notesExist && !notesPublished ? (
                  <>
                    <p className="text-sm font-bold text-on-surface">
                      Notulensi sedang diproses
                    </p>
                    <p className="text-xs text-on-surface-variant font-mono max-w-xs">
                      Draft notulensi sudah dibuat, menunggu dipublikasikan oleh penyelenggara.
                    </p>
                    {canWriteNotes && (
                      <Button
                        size="sm"
                        onClick={handlePublish}
                        className="mt-2 cursor-pointer"
                      >
                        Publikasikan Sekarang
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold text-on-surface">
                      Belum ada notulensi
                    </p>
                    <p className="text-xs text-on-surface-variant font-mono max-w-xs">
                      Notulensi rapat ini belum dibuat oleh penyelenggara.
                    </p>
                  </>
                )}
              </div>
            )}
          </section>
        </div>

        {/* ═══ RIGHT COLUMN: info + actions ═════════════ */}
        <div className="lg:col-span-1 flex flex-col gap-5">

          {/* ── Aksi Moderasi (top priority for creator) */}
          {canWriteNotes && !meetingEnded && (
            <div className="bg-block-lilac/20 border border-block-lilac/40 rounded-[24px] p-5 flex flex-col gap-4">
              <SectionLabel icon={<PenLine className="size-4" />} label="Aksi Pengelola" />
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => setShowNotesModal(true)}
                  className="w-full cursor-pointer justify-center"
                  size="sm"
                >
                  <FileText className="size-4" />
                  {notesExist ? "Edit Notulensi" : "Buat Notulensi"}
                </Button>
                {notesExist && !notesPublished && (
                  <Button
                    onClick={handlePublish}
                    variant="outline"
                    className="w-full cursor-pointer justify-center"
                    size="sm"
                  >
                    Publikasikan Notulensi
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleEnd}
                  className="w-full cursor-pointer justify-center text-error border-error/30 hover:bg-error-container"
                  size="sm"
                >
                  <StopCircle className="size-4" />
                  Akhiri Rapat
                </Button>
              </div>
            </div>
          )}

          {/* ── Detail Rapat ─────────────────────────── */}
          <div className="bg-white border border-outline-variant/60 rounded-[24px] p-5 flex flex-col gap-5">
            <SectionLabel icon={<CalendarDays className="size-4" />} label="Detail Rapat" />

            <div className="flex flex-col gap-4">
              <MetaItem
                icon={<Clock className="size-4 text-on-surface-variant" />}
                label="Waktu"
                value={
                  <span>
                    {formattedDate}
                    <br />
                    <span className="text-xs font-mono text-on-surface-variant">
                      Pukul {formattedTime} WITA
                    </span>
                  </span>
                }
              />

              {meeting.location && (
                <MetaItem
                  icon={<MapPin className="size-4 text-on-surface-variant" />}
                  label="Lokasi"
                  value={meeting.location}
                />
              )}

              <MetaItem
                icon={<Users className="size-4 text-on-surface-variant" />}
                label="Penyelenggara"
                value={meeting.creator}
              />
            </div>

            {meeting.meetingLink && (
              <a
                href={meeting.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-block-lilac hover:bg-block-lilac/70 text-primary font-mono text-xs font-bold py-3 px-4 rounded-full transition-colors border border-primary cursor-pointer"
              >
                <ExternalLink className="size-4" />
                Gabung Link Meeting
              </a>
            )}

            <a
              href={generateGoogleCalendarUrl({
                title: meeting.title,
                description: meeting.agenda,
                location: meeting.location ?? meeting.meetingLink ?? undefined,
                startedAt: meeting.startedAt,
                endedAt: meeting.endedAt,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-mono text-xs font-bold py-3 px-4 rounded-full transition-colors border border-outline-variant/60 cursor-pointer"
            >
              <CalendarPlus className="size-4" />
              Tambah ke Google Calendar
            </a>
          </div>

          {/* ── RSVP Summary ────────────────────────── */}
          <div className="bg-white border border-outline-variant/60 rounded-[24px] p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <SectionLabel icon={<Users className="size-4" />} label="Kehadiran" />
              <span className="text-xs font-mono text-on-surface-variant">
                {meeting.invitees.length} diundang
              </span>
            </div>

            {/* RSVP bar */}
            {meeting.invitees.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex h-2 rounded-full overflow-hidden bg-surface-container gap-0.5">
                  {(rsvpCounts["accepted"] ?? 0) > 0 && (
                    <div
                      className="bg-accent-green rounded-full transition-all"
                      style={{ width: `${((rsvpCounts["accepted"] ?? 0) / meeting.invitees.length) * 100}%` }}
                    />
                  )}
                  {(rsvpCounts["declined"] ?? 0) > 0 && (
                    <div
                      className="bg-error rounded-full transition-all"
                      style={{ width: `${((rsvpCounts["declined"] ?? 0) / meeting.invitees.length) * 100}%` }}
                    />
                  )}
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-accent-green inline-block" />
                    {rsvpCounts["accepted"] ?? 0} Hadir
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-error inline-block" />
                    {rsvpCounts["declined"] ?? 0} Tidak Hadir
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-outline-variant inline-block" />
                    {rsvpCounts["pending"] ?? 0} Pending
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── UNDANGAN: full width below ────────────────── */}
      <section className="bg-white border border-outline-variant/60 rounded-[24px] overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-outline-variant/20 flex items-center justify-between">
          <SectionLabel icon={<Users className="size-4" />} label={`Undangan Rapat (${meeting.invitees.length})`} />
          {meeting.invitees.length > 8 && (
            <button
              onClick={() => setShowAllInvitees((v) => !v)}
              className="flex items-center gap-1 text-[10px] font-mono text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors"
            >
              {showAllInvitees ? (
                <><ChevronUp className="size-3.5" /> Sembunyikan</>
              ) : (
                <><ChevronDown className="size-3.5" /> Lihat semua ({meeting.invitees.length})</>
              )}
            </button>
          )}
        </div>

        {meeting.invitees.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-xs font-mono text-on-surface-variant">Belum ada undangan peserta.</p>
          </div>
        ) : (
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {inviteesToShow.map((inv) => {
                const isMe = inv.assignmentId === currentUserAssignmentId;
                return (
                  <div
                    key={inv.id}
                    className={cn(
                      "flex flex-col gap-3 p-4 rounded-2xl border transition-all",
                      isMe
                        ? "border-accent-magenta/30 bg-accent-magenta/5"
                        : "border-outline-variant/40 bg-surface"
                    )}
                  >
                    {/* Avatar + Name */}
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "size-9 rounded-full flex items-center justify-center text-xs font-bold text-primary shrink-0",
                          getAvatarBg(inv.name)
                        )}
                      >
                        {getInitials(inv.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-on-surface truncate leading-tight">
                          {inv.name}
                          {isMe && (
                            <span className="ml-1 text-[9px] text-accent-magenta font-mono">(Kamu)</span>
                          )}
                        </p>
                        <p className="text-[10px] text-on-surface-variant font-mono truncate mt-0.5">
                          {inv.email}
                        </p>
                      </div>
                    </div>

                    {/* RSVP row */}
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={cn(
                          "flex items-center gap-1 text-[9px] font-mono px-2 py-0.5",
                          rsvpColors[inv.rsvpStatus] ?? ""
                        )}
                      >
                        {rsvpIcons[inv.rsvpStatus]}
                        {rsvpLabel[inv.rsvpStatus] ?? "Pending"}
                      </Badge>

                      {/* RSVP Action — only for current user (self RSVP) */}
                      {isMe && !meetingEnded && (
                        <div className="flex items-center gap-1.5">
                          {inv.rsvpStatus !== "accepted" && (
                            <button
                              onClick={() => handleRsvp(inv.id, "accepted")}
                              className="p-1.5 rounded-full bg-white hover:bg-accent-green/20 border border-outline-variant hover:border-accent-green/50 text-accent-green transition-all cursor-pointer"
                              title="Konfirmasi hadir"
                            >
                              <Check className="size-3" />
                            </button>
                          )}
                          {inv.rsvpStatus !== "declined" && (
                            <button
                              onClick={() => handleRsvp(inv.id, "declined")}
                              className="p-1.5 rounded-full bg-white hover:bg-error-container border border-outline-variant hover:border-error/50 text-error transition-all cursor-pointer"
                              title="Konfirmasi tidak hadir"
                            >
                              <X className="size-3" />
                            </button>
                          )}
                        </div>
                      )}

                      {/* Attendance override — hanya untuk creator, untuk anggota lain */}
                      {isCreator && !isMe && (
                        <button
                          onClick={() => handleMarkAttendance(inv.id, inv.rsvpStatus)}
                          disabled={attendanceLoading === inv.id}
                          title={
                            inv.rsvpStatus === "accepted"
                              ? "Tandai Tidak Hadir"
                              : inv.rsvpStatus === "declined"
                              ? "Reset ke Pending"
                              : "Tandai Hadir"
                          }
                          className={cn(
                            "p-1.5 rounded-full border transition-all cursor-pointer disabled:opacity-40",
                            attendanceLoading === inv.id
                              ? "bg-surface-container border-outline-variant"
                              : inv.rsvpStatus === "accepted"
                              ? "bg-white hover:bg-error-container border-accent-green/40 hover:border-error/50 text-error"
                              : "bg-white hover:bg-accent-green/20 border-outline-variant hover:border-accent-green/50 text-accent-green"
                          )}
                        >
                          {attendanceLoading === inv.id ? (
                            <span className="size-3 block rounded-full border-2 border-current border-t-transparent animate-spin" />
                          ) : inv.rsvpStatus === "accepted" ? (
                            <X className="size-3" />
                          ) : (
                            <Check className="size-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Show more / less toggle */}
            {meeting.invitees.length > 8 && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setShowAllInvitees((v) => !v)}
                  className="text-xs font-mono text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 cursor-pointer transition-colors py-2 px-4 rounded-full hover:bg-surface-container"
                >
                  {showAllInvitees ? (
                    <><ChevronUp className="size-3.5" /> Sembunyikan</>
                  ) : (
                    <><ChevronDown className="size-3.5" /> Lihat semua {meeting.invitees.length} undangan</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── NOTES MODAL ───────────────────────────────── */}
      {canWriteNotes && (
        <Modal open={showNotesModal} onClose={() => setShowNotesModal(false)} title="Tulis / Edit Notulensi" size="lg">
          {notesState?.error && (
            <p className="text-red-500 text-xs font-mono mb-4">{notesState.error}</p>
          )}
          <form action={notesAction} className="flex flex-col gap-5">
            <input type="hidden" name="meetingId" value={meeting.id} />
            <input type="hidden" name="content" value={notesContent} />
            <input type="hidden" name="decisionPoints" id="decisionPoints" value={JSON.stringify(meeting.notes?.decisionPoints ?? [])} />
            <input type="hidden" name="actionItems" id="actionItems" value={JSON.stringify(meeting.notes?.actionItems ?? [])} />

            <div>
              <label className="caption block mb-2 text-on-surface-variant font-semibold">
                Isi Notulensi
              </label>
              <RichTextEditor
                content={meeting.notes?.content ?? ""}
                onChange={setNotesContent}
                placeholder="Tulis jalannya rapat di sini..."
              />
            </div>

            <div>
              <label className="caption block mb-1.5 text-on-surface-variant font-semibold">
                Action Items
              </label>
              <p className="text-[10px] font-mono text-on-surface-variant mb-2">
                Pisahkan setiap item dengan baris baru
              </p>
              <textarea
                id="actionItemsTextarea"
                defaultValue={(meeting.notes?.actionItems ?? []).join("\n")}
                onChange={(e) => {
                  const items = e.target.value.split("\n").filter(Boolean);
                  (document.getElementById("actionItems") as HTMLInputElement).value = JSON.stringify(items);
                }}
                className="flex min-h-[90px] w-full rounded-xl border border-primary bg-surface-bright px-4 py-3 text-sm font-sans text-on-surface placeholder:text-on-surface-variant focus:border-accent-magenta focus:outline-none resize-y"
                placeholder={`Contoh:\nBuat draft proposal sponsorship\nKirim undangan ke sponsor`}
              />
            </div>

            <div>
              <label className="caption block mb-1.5 text-on-surface-variant font-semibold">
                Poin Keputusan
              </label>
              <p className="text-[10px] font-mono text-on-surface-variant mb-2">
                Pisahkan setiap poin dengan baris baru
              </p>
              <textarea
                id="decisionPointsTextarea"
                defaultValue={(meeting.notes?.decisionPoints ?? []).join("\n")}
                onChange={(e) => {
                  const items = e.target.value.split("\n").filter(Boolean);
                  (document.getElementById("decisionPoints") as HTMLInputElement).value = JSON.stringify(items);
                }}
                className="flex min-h-[90px] w-full rounded-xl border border-primary bg-surface-bright px-4 py-3 text-sm font-sans text-on-surface placeholder:text-on-surface-variant focus:border-accent-magenta focus:outline-none resize-y"
                placeholder={`Contoh:\nTanggal rapat berikutnya: 20 Juli\nSponsorship disetujui`}
              />
            </div>

            <div className="flex gap-2 justify-end pt-1 border-t border-outline-variant/20">
              <Button type="button" variant="ghost" onClick={() => setShowNotesModal(false)} className="cursor-pointer">
                Batal
              </Button>
              <Button
                type="submit"
                disabled={notesPending || !notesContent || notesContent === "<p></p>"}
                className="cursor-pointer"
              >
                {notesPending ? "Menyimpan..." : "Simpan Notulensi"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
