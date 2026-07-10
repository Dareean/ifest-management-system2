import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ColorBlock } from "@/components/blocks/color-block";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getMeetings } from "@/lib/data/meetings";
import { exportMeetingsCSV } from "@/lib/actions/export";
import { ExportButton } from "@/components/export-button";

export default async function MeetingsPage() {
  const meetings = await getMeetings();

  return (
    <div className="flex flex-col gap-section-gap">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow text-on-surface-variant">Meeting Planner</p>
          <h1 className="text-4xl font-semibold tracking-tight leading-none">Rapat</h1>
        </div>
        <Link href="/dashboard/meetings/new">
          <Button>
            <Plus className="size-4" />
            Buat Rapat
          </Button>
        </Link>
      </div>

      <div className="flex justify-end">
        <ExportButton label="Export CSV" filename="rapat" fetchCsv={exportMeetingsCSV} />
      </div>

      <ColorBlock color="coral">
        {meetings.length === 0 && (
          <p className="text-on-surface-variant py-md text-center">
            Belum ada rapat. Klik "Buat Rapat" untuk memulai.
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {meetings.map((mtg) => (
            <Link href={`/dashboard/meetings/${mtg.id}`} key={mtg.id}>
              <Card className="hover:border-accent-magenta/50 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between mb-xs">
                    <Badge variant={mtg.meetingType === "adhoc" ? "warning" : "info"}>
                      {mtg.meetingType === "adhoc" ? "Ad-hoc" : "Terjadwal"}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{mtg.title}</CardTitle>
                  <CardDescription>
                    {new Date(mtg.startedAt).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    {mtg.inviteeCount > 0 ? ` · ${mtg.inviteeCount} peserta` : ""}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </ColorBlock>
    </div>
  );
}
