import { getUserMeetings } from "@/lib/data/personal-dashboard";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import Link from "next/link";

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

export async function PersonalMeetings({ assignmentId }: { assignmentId: string }) {
  const meetings = await getUserMeetings(assignmentId);

  return (
    <div className="flex flex-col gap-3">
      {meetings.length === 0 && (
        <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 text-center">
          <p className="text-sm font-mono text-on-surface-variant">Belum ada undangan rapat.</p>
        </div>
      )}
      {meetings.map((mtg) => (
        <Link href={`/dashboard/meetings/${mtg.id}`} key={mtg.id} className="block">
          <div className="bg-white border border-outline-variant/60 rounded-xl p-4 flex flex-col gap-2 hover:border-primary/20 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <p className="text-sm font-bold text-on-surface truncate">{mtg.title}</p>
                {mtg.scope === "all" && (
                  <span className="text-[9px] font-mono bg-accent-green/10 text-accent-green border border-accent-green/30 rounded px-1.5 py-0.5 shrink-0">
                    Semua
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge variant={mtg.meetingType === "adhoc" ? "warning" : "info"} className="text-[9px] font-mono px-2 py-0">
                  {mtg.meetingType === "adhoc" ? "Kondisional" : "Terjadwal"}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-[9px] font-mono px-2 py-0 ${
                    mtg.rsvpStatus === "accepted" ? "bg-accent-green/10 text-accent-green border-accent-green/30" :
                    mtg.rsvpStatus === "declined" ? "bg-error-container text-error border-error/30" : "bg-accent-lilac/10 text-accent-lilac border-accent-lilac/30"
                  }`}
                >
                  {mtg.rsvpStatus === "accepted" ? "Hadir" : mtg.rsvpStatus === "declined" ? "Tidak" : "Pending"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono text-on-surface-variant">
                {new Date(mtg.startedAt).toLocaleDateString("id-ID", {
                  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </p>
              <div className="flex items-center gap-1">
                <FileText className="size-3 text-on-surface-variant" />
                {getNotesBadge(mtg)}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
