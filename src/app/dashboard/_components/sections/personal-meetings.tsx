import { getUserMeetings } from "@/lib/data/personal-dashboard";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import Link from "next/link";

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
              <p className="text-sm font-bold text-on-surface line-clamp-1">{mtg.title}</p>
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
            <p className="text-xs font-mono text-on-surface-variant">
              {new Date(mtg.startedAt).toLocaleDateString("id-ID", {
                day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
