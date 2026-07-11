import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar } from "lucide-react";
import Link from "next/link";
import { getMeetings } from "@/lib/data/meetings";
import { exportMeetingsCSV } from "@/lib/actions/export";
import { ExportButton } from "@/components/export-button";

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

export default async function MeetingsPage() {
  const meetings = await getMeetings();

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

      {/* Main Container */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="size-5 text-error" />
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Jadwal Pertemuan</h2>
        </div>

        {meetings.length === 0 ? (
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
            {meetings.map((mtg) => (
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
                    <CardDescription className="text-xs font-mono">
                      {new Date(mtg.startedAt).toLocaleDateString("id-ID", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
