"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { ColorBlock } from "@/components/blocks/color-block";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  ArrowLeft, ExternalLink, MapPin, Clock,
  Check, X, HelpCircle, Users, FileText, Send, StopCircle,
  Plus, Trash2,
} from "lucide-react";
import { updateRsvp, saveNotes, publishNotes, endMeeting } from "@/lib/actions/meeting-workflow";
import type { MeetingDetail } from "@/lib/data/meeting-detail";

const rsvpColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600",
  accepted: "bg-emerald-100 text-emerald-700",
  declined: "bg-red-100 text-red-700",
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
    <div className="max-w-4xl flex flex-col gap-section-gap">
      {/* Header */}
      <div className="flex items-center gap-md">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-surface-container transition-colors">
          <ArrowLeft className="size-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-sm flex-wrap">
            <h1 className="text-3xl font-semibold tracking-tight">{meeting.title}</h1>
            <Badge variant={meeting.meetingType === "adhoc" ? "warning" : "info"}>
              {meeting.meetingType === "adhoc" ? "Ad-hoc" : "Terjadwal"}
            </Badge>
            {meeting.endedAt && <Badge variant="secondary">Selesai</Badge>}
          </div>
          <div className="flex items-center gap-lg mt-xs text-on-surface-variant caption flex-wrap">
            <span className="flex items-center gap-1"><Clock className="size-3.5" />{formattedDate} &middot; {formattedTime}</span>
            {meeting.location && <span className="flex items-center gap-1"><MapPin className="size-3.5" />{meeting.location}</span>}
            {meeting.meetingLink && (
              <a href={meeting.meetingLink} target="_blank" className="flex items-center gap-1 text-accent-magenta hover:underline">
                <ExternalLink className="size-3.5" />Link Meeting
              </a>
            )}
            <span className="flex items-center gap-1"><Users className="size-3.5" />Dibuat oleh {meeting.creator}</span>
          </div>
        </div>
      </div>

      {actionMsg && <p className="text-red-500 caption">{actionMsg}</p>}

      {/* Agenda */}
      {meeting.agenda && (
        <ColorBlock color="coral">
          <p className="eyebrow text-on-surface-variant mb-md">Agenda</p>
          <Card>
            <div className="px-lg pb-lg pt-sm">
              <p className="whitespace-pre-wrap">{meeting.agenda}</p>
            </div>
          </Card>
        </ColorBlock>
      )}

      {/* Invitees */}
      <ColorBlock color="mint">
        <p className="eyebrow text-on-surface-variant mb-md">Undangan ({meeting.invitees.length})</p>
        <div className="flex flex-col gap-sm">
          {meeting.invitees.length === 0 && (
            <p className="text-on-surface-variant text-sm">Belum ada undangan.</p>
          )}
          {meeting.invitees.map((inv) => (
            <Card key={inv.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-medium">{inv.name}</CardTitle>
                    <CardDescription>{inv.email}</CardDescription>
                  </div>
                  <div className="flex items-center gap-sm">
                    <Badge
                      variant="outline"
                      className={`flex items-center gap-1 ${rsvpColors[inv.rsvpStatus] ?? ""}`}
                    >
                      {rsvpIcons[inv.rsvpStatus]}
                      {inv.rsvpStatus === "accepted" ? "Hadir" : inv.rsvpStatus === "declined" ? "Tidak" : "Pending"}
                    </Badge>
                    {!meeting.endedAt && inv.rsvpStatus !== "accepted" && (
                      <button
                        onClick={() => handleRsvp(inv.id, "accepted")}
                        className="p-1 rounded hover:bg-emerald-50 transition-colors"
                        title="Konfirmasi hadir"
                      >
                        <Check className="size-4 text-emerald-600" />
                      </button>
                    )}
                    {!meeting.endedAt && inv.rsvpStatus !== "declined" && (
                      <button
                        onClick={() => handleRsvp(inv.id, "declined")}
                        className="p-1 rounded hover:bg-red-50 transition-colors"
                        title="Tidak bisa hadir"
                      >
                        <X className="size-4 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </ColorBlock>

      {/* Aksi */}
      {!meeting.endedAt && (
        <ColorBlock color="lilac">
          <p className="eyebrow text-on-surface-variant mb-md">Aksi</p>
          <div className="flex flex-wrap gap-sm">
            <Button onClick={() => setShowNotesModal(true)}>
              <FileText className="size-4" />
              {meeting.notes ? "Edit Notula" : "Buat Notula"}
            </Button>
            <Button variant="outline" onClick={handleEnd}>
              <StopCircle className="size-4" />
              Akhiri Rapat
            </Button>
          </div>
        </ColorBlock>
      )}

      {/* Notula */}
      {meeting.notes && (
        <ColorBlock color="pink">
          <div className="flex items-center justify-between mb-md">
            <p className="eyebrow text-on-surface-variant">Notula Rapat</p>
            {meeting.notes.publishedAt ? (
              <Badge variant="success">Published</Badge>
            ) : (
              <div className="flex items-center gap-sm">
                <Badge variant="warning">Draft</Badge>
                <Button size="sm" variant="outline" onClick={handlePublish}>
                  <Send className="size-3.5" />
                  Publikasikan
                </Button>
              </div>
            )}
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Ditulis oleh {meeting.notes.writer}
                </CardTitle>
                <CardDescription>
                  {new Date(meeting.notes.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric", month: "short", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </CardDescription>
              </div>
            </CardHeader>
            <div className="px-lg pb-lg">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{meeting.notes.content}</p>

              {meeting.notes.decisionPoints.length > 0 && (
                <div className="mt-lg">
                  <p className="caption font-semibold text-on-surface-variant mb-xs">Poin Keputusan</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {meeting.notes.decisionPoints.map((dp: string, i: number) => (
                      <li key={i}>{dp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {meeting.notes.actionItems.length > 0 && (
                <div className="mt-lg">
                  <p className="caption font-semibold text-on-surface-variant mb-xs">Action Items</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {meeting.notes.actionItems.map((ai: string, i: number) => (
                      <li key={i}>{ai}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        </ColorBlock>
      )}

      {/* Notes Modal */}
      <Modal open={showNotesModal} onClose={() => setShowNotesModal(false)} title="Notula Rapat">
        {notesState?.error && <p className="text-red-500 caption mb-md">{notesState.error}</p>}
        <form action={notesAction} className="flex flex-col gap-md">
          <input type="hidden" name="meetingId" value={meeting.id} />
          <input type="hidden" name="decisionPoints" id="decisionPoints" />
          <input type="hidden" name="actionItems" id="actionItems" />

          <div>
            <label className="caption block mb-xs text-on-surface-variant">Notulensi</label>
            <textarea
              name="content"
              defaultValue={meeting.notes?.content ?? ""}
              className="flex min-h-[200px] w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface placeholder:text-on-surface-variant focus:border-accent-magenta focus:outline-none resize-y"
              placeholder="Tulis notulensi rapat..."
              required
            />
          </div>

          <div>
            <label className="caption block mb-xs text-on-surface-variant">
              Action Items (pisahkan dengan newline)
            </label>
            <textarea
              id="actionItemsTextarea"
              defaultValue={(meeting.notes?.actionItems ?? []).join("\n")}
              onChange={(e) => {
                const items = e.target.value.split("\n").filter(Boolean);
                (document.getElementById("actionItems") as HTMLInputElement).value = JSON.stringify(items);
              }}
              className="flex min-h-[80px] w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface placeholder:text-on-surface-variant focus:border-accent-magenta focus:outline-none resize-y"
              placeholder={`Contoh:\nBuat draft proposal sponsorship\nKirim undangan ke sponsor\nFollow-up H+3`}
            />
          </div>

          <div>
            <label className="caption block mb-xs text-on-surface-variant">
              Poin Keputusan (pisahkan dengan newline)
            </label>
            <textarea
              id="decisionPointsTextarea"
              defaultValue={(meeting.notes?.decisionPoints ?? []).join("\n")}
              onChange={(e) => {
                const items = e.target.value.split("\n").filter(Boolean);
                (document.getElementById("decisionPoints") as HTMLInputElement).value = JSON.stringify(items);
              }}
              className="flex min-h-[80px] w-full rounded-md border border-primary bg-surface-bright px-4 py-2 text-base font-sans text-on-surface placeholder:text-on-surface-variant focus:border-accent-magenta focus:outline-none resize-y"
              placeholder={`Contoh:\nBudget acara disetujui Rp 50jt\nTanggal rapat berikutnya: 20 Juli`}
            />
          </div>

          <div className="flex gap-sm justify-end">
            <Button type="button" variant="ghost" onClick={() => setShowNotesModal(false)}>Batal</Button>
            <Button type="submit" disabled={notesPending}>
              {notesPending ? "Menyimpan..." : "Simpan Notula"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
