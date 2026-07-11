"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  ArrowLeft, ExternalLink, MapPin, Clock,
  Check, X, HelpCircle, Users, FileText, Send, StopCircle,
} from "lucide-react";
import { updateRsvp, saveNotes, publishNotes, endMeeting } from "@/lib/actions/meeting-workflow";
import type { MeetingDetail } from "@/lib/data/meeting-detail";
import { cn } from "@/lib/utils";

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

export function MeetingDetailClient({ meeting }: { meeting: MeetingDetail }) {
  const router = useRouter();
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const [notesState, notesAction, notesPending] = useActionState(saveNotes, null);

  const startDate = new Date(meeting.startedAt);
  const formattedDate = startDate.toLocaleDateString("id-ID", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const formattedTime = startDate.toLocaleTimeString("id-ID", {
    hour: "2-digit", minute: "2-digit",
  });

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

  async function handlePublish() {
    const result = await publishNotes(meeting.id);
    if (result.error) setActionMsg(result.error);
    else router.refresh();
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 px-4 py-6">
      {/* Header */}
      <div className="flex flex-col gap-3 pb-6 border-b border-outline-variant/30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-surface-container transition-colors shrink-0 cursor-pointer animate-fade-in"
            title="Kembali"
          >
            <ArrowLeft className="size-5 text-on-surface" />
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={meeting.meetingType === "adhoc" ? "warning" : "info"} className="text-[10px] font-mono shrink-0 px-2.5 py-0.5">
              {meeting.meetingType === "adhoc" ? "Kondisional" : "Terjadwal"}
            </Badge>
            {meeting.endedAt && (
              <Badge variant="secondary" className="text-[10px] font-mono shrink-0 px-2.5 py-0.5">
                Selesai
              </Badge>
            )}
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface leading-tight break-words">
          {meeting.title}
        </h1>
      </div>

      {actionMsg && (
        <div className="text-sm text-error bg-error-container border border-error/20 rounded-xl p-4 font-mono">
          {actionMsg}
        </div>
      )}

      {/* Main Grid: Left side for content, Right side for info & actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Agenda & Notula */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Agenda */}
          {meeting.agenda && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <FileText className="size-5 text-accent-magenta" />
                <h2 className="text-lg font-bold tracking-tight text-on-surface uppercase font-mono">
                  Agenda Rapat
                </h2>
              </div>
              <div className="bg-white border border-outline-variant/60 rounded-[24px] p-6 sm:p-8">
                <p className="whitespace-pre-wrap text-on-surface font-sans leading-relaxed text-sm sm:text-base">
                  {meeting.agenda}
                </p>
              </div>
            </div>
          )}

          {/* Notula Rapat */}
          {meeting.notes && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FileText className="size-5 text-accent-magenta" />
                  <h2 className="text-lg font-bold tracking-tight text-on-surface uppercase font-mono">
                    Notula Rapat
                  </h2>
                </div>
                <div>
                  {meeting.notes.publishedAt ? (
                    <Badge variant="success" className="text-xs font-mono px-3 py-1">Published</Badge>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge variant="warning" className="text-xs font-mono px-3 py-1">Draft</Badge>
                      <Button size="sm" variant="outline" onClick={handlePublish} className="cursor-pointer">
                        <Send className="size-3.5" />
                        Publikasikan
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white border border-outline-variant/60 rounded-[24px] p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/20 pb-4 mb-4 text-xs font-mono text-on-surface-variant">
                  <span className="font-bold text-on-surface">Ditulis oleh: {meeting.notes.writer}</span>
                  <span>
                    {new Date(meeting.notes.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>

                <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed text-on-surface font-sans mb-6">
                  {meeting.notes.content}
                </p>

                {meeting.notes.decisionPoints.length > 0 && (
                  <div className="border-t border-outline-variant/20 pt-4 mb-6">
                    <p className="text-xs font-mono font-bold tracking-wider text-accent-magenta uppercase mb-3">
                      Poin Keputusan
                    </p>
                    <ul className="space-y-2">
                      {meeting.notes.decisionPoints.map((dp: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-on-surface font-sans">
                          <span className="size-1.5 rounded-full bg-accent-magenta mt-2 shrink-0" />
                          <span>{dp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {meeting.notes.actionItems.length > 0 && (
                  <div className="border-t border-outline-variant/20 pt-4">
                    <p className="text-xs font-mono font-bold tracking-wider text-accent-magenta uppercase mb-3">
                      Action Items
                    </p>
                    <ul className="space-y-2">
                      {meeting.notes.actionItems.map((ai: string, i: number) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-on-surface font-sans">
                          <span className="flex items-center justify-center size-4 rounded-full border border-primary text-[10px] font-mono font-bold mt-0.5 shrink-0 bg-surface-container">
                            {i + 1}
                          </span>
                          <span>{ai}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Details, Actions, & Invitees */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Detail Rapat Info Card */}
          <div className="bg-white border border-outline-variant/60 rounded-[24px] p-6 flex flex-col gap-5">
            <h3 className="font-mono text-sm font-bold tracking-wider uppercase text-on-surface-variant border-b border-outline-variant/20 pb-3">
              Detail Rapat
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <Clock className="size-4 text-on-surface-variant mt-0.5 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs font-mono text-on-surface-variant uppercase">Waktu</span>
                  <span className="text-sm font-sans font-medium text-on-surface leading-tight mt-0.5">
                    {formattedDate}
                  </span>
                  <span className="text-xs font-mono text-on-surface-variant mt-0.5">
                    Pukul {formattedTime} WITA
                  </span>
                </div>
              </div>

              {meeting.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="size-4 text-on-surface-variant mt-0.5 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs font-mono text-on-surface-variant uppercase">Lokasi</span>
                    <span className="text-sm font-sans font-medium text-on-surface leading-tight mt-0.5">
                      {meeting.location}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Users className="size-4 text-on-surface-variant mt-0.5 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs font-mono text-on-surface-variant uppercase">Penyelenggara</span>
                  <span className="text-sm font-sans font-medium text-on-surface leading-tight mt-0.5">
                    {meeting.creator}
                  </span>
                </div>
              </div>
            </div>

            {meeting.meetingLink && (
              <div className="pt-2 border-t border-outline-variant/20">
                <a
                  href={meeting.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-block-lilac hover:bg-block-lilac/80 text-primary font-mono text-xs font-bold py-3 px-4 rounded-full transition-colors border border-primary cursor-pointer"
                >
                  <ExternalLink className="size-4" />
                  Gabung Link Meeting
                </a>
              </div>
            )}
          </div>

          {/* Aksi Moderasi Control Card */}
          {!meeting.endedAt && (
            <div className="bg-white border border-outline-variant/60 rounded-[24px] p-6 flex flex-col gap-4">
              <h3 className="font-mono text-sm font-bold tracking-wider uppercase text-on-surface-variant border-b border-outline-variant/20 pb-3">
                Aksi Moderasi
              </h3>
              <div className="flex flex-col gap-2.5">
                <Button onClick={() => setShowNotesModal(true)} className="w-full cursor-pointer justify-center" size="sm">
                  <FileText className="size-4" />
                  {meeting.notes ? "Edit Notula" : "Buat Notula"}
                </Button>
                <Button variant="outline" onClick={handleEnd} className="w-full cursor-pointer justify-center" size="sm">
                  <StopCircle className="size-4" />
                  Akhiri Rapat
                </Button>
              </div>
            </div>
          )}

          {/* Undangan Rapat Participants Card */}
          <div className="bg-white border border-outline-variant/60 rounded-[24px] p-6 flex flex-col gap-4">
            <h3 className="font-mono text-sm font-bold tracking-wider uppercase text-on-surface-variant border-b border-outline-variant/20 pb-3">
              Undangan Rapat ({meeting.invitees.length})
            </h3>
            {meeting.invitees.length === 0 ? (
              <p className="text-xs font-mono text-on-surface-variant text-center py-4">
                Belum ada undangan peserta.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {meeting.invitees.map((inv) => {
                  const initials = inv.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);
                  const avatarColors = [
                    "bg-block-lime",
                    "bg-block-lilac",
                    "bg-block-mint",
                    "bg-block-coral",
                    "bg-block-pink",
                  ];
                  const colorIdx = inv.name.charCodeAt(0) % avatarColors.length;
                  const avatarBg = avatarColors[colorIdx];

                  return (
                    <div key={inv.id} className="flex flex-col gap-2.5 p-3 bg-surface rounded-xl border border-outline-variant/30">
                      <div className="flex items-center gap-3">
                        <div className={cn("size-8 rounded-full flex items-center justify-center text-xs font-bold text-primary shrink-0", avatarBg)}>
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-on-surface truncate leading-tight">{inv.name}</p>
                          <p className="text-[10px] text-on-surface-variant font-mono truncate mt-0.5">{inv.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-outline-variant/20 pt-2 mt-0.5">
                        <Badge
                          variant="outline"
                          className={cn("flex items-center gap-1 text-[9px] font-mono px-2 py-0.5", rsvpColors[inv.rsvpStatus] ?? "")}
                        >
                          {rsvpIcons[inv.rsvpStatus]}
                          {inv.rsvpStatus === "accepted" ? "Hadir" : inv.rsvpStatus === "declined" ? "Tidak Hadir" : "Pending"}
                        </Badge>

                        {/* RSVP Action Buttons */}
                        {!meeting.endedAt && (
                          <div className="flex items-center gap-1.5">
                            {inv.rsvpStatus !== "accepted" && (
                              <button
                                onClick={() => handleRsvp(inv.id, "accepted")}
                                className="p-1 rounded-full bg-white hover:bg-accent-green/20 border border-outline-variant hover:border-accent-green/50 text-accent-green transition-all cursor-pointer flex items-center justify-center"
                                title="Konfirmasi hadir"
                              >
                                <Check className="size-3.5" />
                              </button>
                            )}
                            {inv.rsvpStatus !== "declined" && (
                              <button
                                onClick={() => handleRsvp(inv.id, "declined")}
                                className="p-1 rounded-full bg-white hover:bg-error-container border border-outline-variant hover:border-error/50 text-error transition-all cursor-pointer flex items-center justify-center"
                                title="Konfirmasi tidak hadir"
                              >
                                <X className="size-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Notes Modal */}
      <Modal open={showNotesModal} onClose={() => setShowNotesModal(false)} title="Notula Rapat">
        {notesState?.error && <p className="text-red-500 caption mb-4">{notesState.error}</p>}
        <form action={notesAction} className="flex flex-col gap-4">
          <input type="hidden" name="meetingId" value={meeting.id} />
          <input type="hidden" name="decisionPoints" id="decisionPoints" value={JSON.stringify(meeting.notes?.decisionPoints ?? [])} />
          <input type="hidden" name="actionItems" id="actionItems" value={JSON.stringify(meeting.notes?.actionItems ?? [])} />

          <div>
            <label className="caption block mb-1 text-on-surface-variant">Notulensi</label>
            <textarea
              name="content"
              defaultValue={meeting.notes?.content ?? ""}
              className="flex min-h-[180px] w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface placeholder:text-on-surface-variant focus:border-accent-magenta focus:outline-none resize-y"
              placeholder="Tulis jalannya rapat di sini..."
              required
            />
          </div>

          <div>
            <label className="caption block mb-1 text-on-surface-variant">
              Action Items (pisahkan dengan baris baru)
            </label>
            <textarea
              id="actionItemsTextarea"
              defaultValue={(meeting.notes?.actionItems ?? []).join("\n")}
              onChange={(e) => {
                const items = e.target.value.split("\n").filter(Boolean);
                (document.getElementById("actionItems") as HTMLInputElement).value = JSON.stringify(items);
              }}
              className="flex min-h-[80px] w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface placeholder:text-on-surface-variant focus:border-accent-magenta focus:outline-none resize-y"
              placeholder={`Contoh:\nBuat draft proposal sponsorship\nKirim undangan ke sponsor`}
            />
          </div>

          <div>
            <label className="caption block mb-1 text-on-surface-variant">
              Poin Keputusan (pisahkan dengan baris baru)
            </label>
            <textarea
              id="decisionPointsTextarea"
              defaultValue={(meeting.notes?.decisionPoints ?? []).join("\n")}
              onChange={(e) => {
                const items = e.target.value.split("\n").filter(Boolean);
                (document.getElementById("decisionPoints") as HTMLInputElement).value = JSON.stringify(items);
              }}
              className="flex min-h-[80px] w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface placeholder:text-on-surface-variant focus:border-accent-magenta focus:outline-none resize-y"
              placeholder={`Contoh:\nTanggal rapat berikutnya: 20 Juli\nSponsorship disetujui`}
            />
          </div>

          <div className="flex gap-2 justify-end mt-2">
            <Button type="button" variant="ghost" onClick={() => setShowNotesModal(false)} className="cursor-pointer">
              Batal
            </Button>
            <Button type="submit" disabled={notesPending} className="cursor-pointer">
              {notesPending ? "Menyimpan..." : "Simpan Notula"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
