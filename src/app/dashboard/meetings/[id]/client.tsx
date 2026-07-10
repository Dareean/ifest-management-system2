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

const rsvpColors: Record<string, string> = {
  pending: "bg-gray-55 border-gray-200 text-gray-600",
  accepted: "bg-emerald-50 border-emerald-200 text-emerald-700",
  declined: "bg-red-50 border-red-200 text-red-700",
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
    <div className="max-w-4xl flex flex-col gap-10">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-surface-container transition-colors shrink-0 cursor-pointer mt-1"
        >
          <ArrowLeft className="size-5 text-on-surface" />
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface break-words leading-tight">
              {meeting.title}
            </h1>
            <Badge variant={meeting.meetingType === "adhoc" ? "warning" : "info"} className="text-xs font-mono shrink-0">
              {meeting.meetingType === "adhoc" ? "Ad-hoc" : "Terjadwal"}
            </Badge>
            {meeting.endedAt && <Badge variant="secondary" className="text-xs font-mono shrink-0">Selesai</Badge>}
          </div>
          <div className="flex items-center gap-x-6 gap-y-2 mt-2 text-on-surface-variant text-xs font-mono flex-wrap">
            <span className="flex items-center gap-1"><Clock className="size-3.5" />{formattedDate} &middot; {formattedTime}</span>
            {meeting.location && <span className="flex items-center gap-1"><MapPin className="size-3.5" />{meeting.location}</span>}
            {meeting.meetingLink && (
              <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-accent-magenta hover:underline font-bold">
                <ExternalLink className="size-3.5" />Link Meeting
              </a>
            )}
            <span className="flex items-center gap-1"><Users className="size-3.5" />Dibuat oleh: {meeting.creator}</span>
          </div>
        </div>
      </div>

      {actionMsg && (
        <div className="text-sm text-error bg-error-container rounded-lg p-4 font-mono">
          {actionMsg}
        </div>
      )}

      {/* Agenda */}
      {meeting.agenda && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold tracking-tight text-on-surface flex items-center gap-2">
            <FileText className="size-5 text-[#ba1a1a]" />
            Agenda Rapat
          </h2>
          <Card className="bg-white border border-outline-variant/60 rounded-2xl p-6">
            <p className="whitespace-pre-wrap text-on-surface font-sans leading-relaxed text-sm">{meeting.agenda}</p>
          </Card>
        </div>
      )}

      {/* Invitees */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold tracking-tight text-on-surface flex items-center gap-2">
          <Users className="size-5 text-[#ba1a1a]" />
          Undangan Rapat ({meeting.invitees.length})
        </h2>
        
        {meeting.invitees.length === 0 ? (
          <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 text-center">
            <p className="text-sm font-mono text-on-surface-variant">Belum ada undangan peserta.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {meeting.invitees.map((inv) => (
              <Card key={inv.id} className="bg-white border border-outline-variant/60 rounded-xl p-4 flex flex-col justify-between">
                <div className="min-w-0 mb-3">
                  <p className="text-sm font-bold text-on-surface truncate">{inv.name}</p>
                  <p className="text-xs text-on-surface-variant font-mono truncate mt-0.5">{inv.email}</p>
                </div>
                <div className="flex items-center justify-between border-t border-outline-variant/20 pt-3">
                  <Badge
                    variant="outline"
                    className={`flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 ${rsvpColors[inv.rsvpStatus] ?? ""}`}
                  >
                    {rsvpIcons[inv.rsvpStatus]}
                    {inv.rsvpStatus === "accepted" ? "Hadir" : inv.rsvpStatus === "declined" ? "Tidak" : "Pending"}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    {!meeting.endedAt && inv.rsvpStatus !== "accepted" && (
                      <button
                        onClick={() => handleRsvp(inv.id, "accepted")}
                        className="p-1 rounded hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all cursor-pointer"
                        title="Konfirmasi hadir"
                      >
                        <Check className="size-4 text-emerald-600" />
                      </button>
                    )}
                    {!meeting.endedAt && inv.rsvpStatus !== "declined" && (
                      <button
                        onClick={() => handleRsvp(inv.id, "declined")}
                        className="p-1 rounded hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer"
                        title="Tidak bisa hadir"
                      >
                        <X className="size-4 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Aksi Controls */}
      {!meeting.endedAt && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Aksi Moderasi</h2>
          <div className="bg-white border border-outline-variant/60 rounded-2xl p-6">
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setShowNotesModal(true)} className="cursor-pointer">
                <FileText className="size-4" />
                {meeting.notes ? "Edit Notula" : "Buat Notula"}
              </Button>
              <Button variant="outline" onClick={handleEnd} className="cursor-pointer">
                <StopCircle className="size-4" />
                Akhiri Rapat
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notula Rapat */}
      {meeting.notes && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold tracking-tight text-on-surface flex items-center gap-2">
              <FileText className="size-5 text-[#ba1a1a]" />
              Notula Rapat
            </h2>
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

          <Card className="bg-white border border-outline-variant/60 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/20 pb-4 mb-4">
              <span className="text-sm font-bold text-on-surface">Ditulis oleh: {meeting.notes.writer}</span>
              <span className="text-xs font-mono text-on-surface-variant">
                {new Date(meeting.notes.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric", month: "short", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </span>
            </div>
            
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-on-surface font-sans mb-6">
              {meeting.notes.content}
            </p>

            {meeting.notes.decisionPoints.length > 0 && (
              <div className="border-t border-outline-variant/20 pt-4 mb-6">
                <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase mb-2">Poin Keputusan</p>
                <ul className="list-disc list-inside text-sm space-y-1.5 text-on-surface pl-2">
                  {meeting.notes.decisionPoints.map((dp: string, i: number) => (
                    <li key={i}>{dp}</li>
                  ))}
                </ul>
              </div>
            )}

            {meeting.notes.actionItems.length > 0 && (
              <div className="border-t border-outline-variant/20 pt-4">
                <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase mb-2">Action Items</p>
                <ul className="list-disc list-inside text-sm space-y-1.5 text-on-surface pl-2">
                  {meeting.notes.actionItems.map((ai: string, i: number) => (
                    <li key={i}>{ai}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>
      )}

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
