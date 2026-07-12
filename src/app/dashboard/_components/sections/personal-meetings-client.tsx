"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Check, X, Clock } from "lucide-react";
import Link from "next/link";
import { updateRsvp } from "@/lib/actions/meeting-workflow";

type Meeting = {
  id: string;
  inviteeId: string;
  title: string;
  startedAt: string;
  meetingType: string;
  rsvpStatus: string;
  absenceReason: string | null;
  endedAt: string | null;
  scope: string;
  notesPublished: string | null;
};

function getNotesBadge(meeting: {
  endedAt: string | null;
  notesPublished: string | null;
}) {
  if (!meeting.endedAt) return null;
  if (meeting.notesPublished) {
    return (
      <Badge variant="success" className="text-[9px] font-mono px-2 py-0">
        Notulensi Ada
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-[9px] font-mono px-2 py-0">
      Belum Ada Notulensi
    </Badge>
  );
}

function RsvpBadge({ status }: { status: string }) {
  const cfg =
    status === "accepted"
      ? { label: "Hadir", className: "bg-accent-green/10 text-accent-green border-accent-green/30" }
      : status === "declined"
      ? { label: "Izin", className: "bg-error-container text-error border-error/30" }
      : { label: "Pending", className: "bg-accent-lilac/10 text-accent-lilac border-accent-lilac/30" };
  return (
    <Badge variant="outline" className={`text-[9px] font-mono px-2 py-0 ${cfg.className}`}>
      {cfg.label}
    </Badge>
  );
}

function IzinModal({
  open,
  title,
  onClose,
  onSubmit,
  loading,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl border border-outline-variant/60 p-6 max-w-sm w-full flex flex-col gap-5">
        <div>
          <p className="text-xs font-mono text-on-surface-variant uppercase tracking-wider mb-1">Konfirmasi Izin</p>
          <h3 className="text-base font-bold text-on-surface leading-tight">{title}</h3>
        </div>
        <div>
          <label className="caption block mb-1.5 text-on-surface-variant font-semibold text-sm">
            Alasan Ketidakhadiran
          </label>
          <Input
            placeholder="Contoh: Ada ujian / dinas luar kota"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading}
            autoFocus
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={loading} className="cursor-pointer">
            Batal
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            disabled={loading || !reason.trim()}
            onClick={() => onSubmit(reason.trim())}
            className="cursor-pointer"
          >
            {loading ? "Menyimpan..." : "Konfirmasi Izin"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MeetingCard({ mtg }: { mtg: Meeting }) {
  const [rsvp, setRsvp] = useState(mtg.rsvpStatus);
  const [modalOpen, setModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isEnded = !!mtg.endedAt;

  async function handleHadir() {
    startTransition(async () => {
      setRsvp("accepted");
      const res = await updateRsvp(mtg.inviteeId, "accepted");
      if (res?.error) setRsvp(mtg.rsvpStatus);
    });
  }

  async function handleIzin(reason: string) {
    startTransition(async () => {
      setRsvp("declined");
      const res = await updateRsvp(mtg.inviteeId, "declined", reason);
      if (res?.error) setRsvp(mtg.rsvpStatus);
      setModalOpen(false);
    });
  }

  return (
    <>
      <IzinModal
        open={modalOpen}
        title={mtg.title}
        onClose={() => setModalOpen(false)}
        onSubmit={handleIzin}
        loading={isPending}
      />

      <div className={`bg-white border border-outline-variant/60 rounded-xl p-4 flex flex-col gap-3 transition-all ${isPending ? "opacity-60 pointer-events-none" : ""}`}>
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <Link href={`/dashboard/meetings/${mtg.id}`} className="min-w-0 flex-1 hover:underline underline-offset-2">
            <p className="text-sm font-bold text-on-surface truncate">{mtg.title}</p>
          </Link>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant={mtg.meetingType === "adhoc" ? "warning" : "info"} className="text-[9px] font-mono px-2 py-0">
              {mtg.meetingType === "adhoc" ? "Kondisional" : "Terjadwal"}
            </Badge>
            <RsvpBadge status={rsvp} />
          </div>
        </div>

        {/* Time row */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-mono text-on-surface-variant flex items-center gap-1">
            <Clock className="size-3" />
            {new Date(mtg.startedAt).toLocaleDateString("id-ID", {
              day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
            })}
          </p>
          <div className="flex items-center gap-1">
            <FileText className="size-3 text-on-surface-variant" />
            {getNotesBadge(mtg)}
          </div>
        </div>

        {/* RSVP shortcut buttons (only show if meeting not ended) */}
        {!isEnded && (
          <div className="border-t border-outline-variant/20 pt-3 flex items-center gap-2">
            <span className="text-[10px] font-mono text-on-surface-variant flex-1">Konfirmasi kehadiran:</span>
            <button
              onClick={handleHadir}
              disabled={isPending || rsvp === "accepted"}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                rsvp === "accepted"
                  ? "bg-accent-green/20 text-accent-green border-accent-green/50"
                  : "bg-white border-outline-variant hover:bg-accent-green/10 hover:border-accent-green/40 hover:text-accent-green text-on-surface-variant"
              }`}
            >
              <Check className="size-3" />
              Hadir
            </button>
            <button
              onClick={() => setModalOpen(true)}
              disabled={isPending || rsvp === "declined"}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                rsvp === "declined"
                  ? "bg-error-container text-error border-error/50"
                  : "bg-white border-outline-variant hover:bg-error-container hover:border-error/40 hover:text-error text-on-surface-variant"
              }`}
            >
              <X className="size-3" />
              Izin
            </button>
          </div>
        )}

        {/* Show absence reason if declined */}
        {rsvp === "declined" && mtg.absenceReason && (
          <p className="text-[10px] font-mono text-error/70 italic border-t border-outline-variant/20 pt-2">
            Alasan: {mtg.absenceReason}
          </p>
        )}
      </div>
    </>
  );
}

export function PersonalMeetingsClient({ meetings }: { meetings: Meeting[] }) {
  if (meetings.length === 0) {
    return (
      <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 text-center">
        <p className="text-sm font-mono text-on-surface-variant">Belum ada undangan rapat.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {meetings.map((mtg) => (
        <MeetingCard key={mtg.id} mtg={mtg} />
      ))}
    </div>
  );
}
