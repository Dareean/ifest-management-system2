import { ColorBlock } from "@/components/blocks/color-block";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDashboardOverview, getDivisionsWithProgress } from "@/lib/data/dashboard";
import { getDivisionKpiSummaries } from "@/lib/data/kpi";
import { getPersonalDashboard } from "@/lib/data/personal-dashboard";
import { getStatusDisplay } from "@/lib/data/letters";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

export default async function DashboardPage() {
  const personal = await getPersonalDashboard();

  // If user is logged in, show personal dashboard
  if (personal.userId && personal.assignment) {
    return <PersonalView personal={personal} />;
  }

  // Otherwise show global overview with login prompt
  return <GlobalView />;
}

async function GlobalView() {
  const [overview, divisions, kpiSummaries] = await Promise.all([
    getDashboardOverview(YEAR_ID),
    getDivisionsWithProgress(YEAR_ID),
    getDivisionKpiSummaries(),
  ]);

  const supabase = createAdminClient();
  const { count: kpiCount } = await supabase
    .from("kpi_items")
    .select("*", { count: "exact", head: true })
    .eq("committee_year_id", YEAR_ID);

  const totalTasks = kpiSummaries.reduce((acc, s) => acc + s.totalTasks, 0);
  const doneTasks = kpiSummaries.reduce((acc, s) => acc + s.doneTasks, 0);

  return (
    <div className="flex flex-col gap-section-gap">
      <div>
        <p className="eyebrow text-on-surface-variant">I-FEST 2026</p>
        <h1 className="text-5xl font-semibold tracking-tight leading-none">Dashboard</h1>
        <p className="mt-sm text-lg text-on-surface-variant">
          Pantau progres seluruh divisi kepanitiaan.
        </p>
      </div>

      {/* Login prompt */}
      <ColorBlock color="lilac">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-medium">Login untuk melihat dashboard personal</p>
            <p className="text-on-surface-variant text-sm">Lihat KPI, task, surat, dan rapat yang relevan dengan divisi Anda.</p>
          </div>
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </ColorBlock>

      <ColorBlock color="lilac">
        <p className="eyebrow text-on-surface-variant mb-md">Ringkasan</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-semibold">{divisions.length}</CardTitle>
              <CardDescription>Divisi Aktif</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-semibold">{overview.totalMembers}</CardTitle>
              <CardDescription>Total Anggota</CardDescription>
            </CardHeader>
          </Card>
          <Link href="/dashboard/kpi">
            <Card className="hover:border-accent-magenta/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-3xl font-semibold">{kpiCount}</CardTitle>
                <CardDescription>Total KPI ({doneTasks}/{totalTasks} tasks)</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-semibold">{overview.totalMeetings}</CardTitle>
              <CardDescription>Total Rapat</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </ColorBlock>

      <ColorBlock color="mint">
        <div className="flex items-center justify-between mb-md">
          <p className="eyebrow text-on-surface-variant">Progres Divisi</p>
          <Link href="/dashboard/kpi" className="caption text-accent-magenta hover:underline">
            Lihat detail KPI →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {kpiSummaries.map((s) => {
            const progress = s.totalTasks > 0 ? Math.round((s.doneTasks / s.totalTasks) * 100) : 0;
            return (
              <Link href="/dashboard/kpi" key={s.divisionId}>
                <Card className="hover:border-accent-magenta/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{s.divisionName}</CardTitle>
                      <Badge variant="outline">{s.milestoneKpis} milestone</Badge>
                    </div>
                    <CardDescription>
                      {s.totalKpis} KPI &middot; {s.doneTasks}/{s.totalTasks} tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-2 w-full rounded-full bg-surface-container">
                      <div
                        className="h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </ColorBlock>

      <ColorBlock color="coral">
        <p className="eyebrow text-on-surface-variant mb-md">Aktivitas Terbaru</p>
        <Card>
          <p className="text-on-surface-variant py-md text-center">
            Data aktivitas akan muncul setelah login.
          </p>
        </Card>
      </ColorBlock>
    </div>
  );
}

async function PersonalView({ personal }: { personal: Awaited<ReturnType<typeof getPersonalDashboard>> }) {
  const totalTasks = personal.tasks.length;
  const doneTasks = personal.tasks.filter((t) => t.status === "done").length;
  const pendingRsvp = personal.meetings.filter((m) => m.rsvpStatus === "pending").length;

  return (
    <div className="flex flex-col gap-section-gap">
      <div>
        <p className="eyebrow text-on-surface-variant">I-FEST 2026</p>
        <h1 className="text-5xl font-semibold tracking-tight leading-none">
          Dashboard {personal.assignment?.division ?? "Personal"}
        </h1>
        <p className="mt-sm text-lg text-on-surface-variant">
          {personal.assignment?.role} &middot; {personal.assignment?.division}
        </p>
      </div>

      {/* Personal stats */}
      <ColorBlock color="lilac">
        <p className="eyebrow text-on-surface-variant mb-md">Ringkasan Personal</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-semibold">{personal.kpis.length}</CardTitle>
              <CardDescription>KPI Divisi</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-semibold">{totalTasks}</CardTitle>
              <CardDescription>Total Task</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-semibold">{doneTasks}/{totalTasks}</CardTitle>
              <CardDescription>Task Selesai</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-semibold">{pendingRsvp}</CardTitle>
              <CardDescription>Undangan Rapat Baru</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </ColorBlock>

      {/* KPI Progress */}
      <ColorBlock color="mint">
        <div className="flex items-center justify-between mb-md">
          <p className="eyebrow text-on-surface-variant">KPI Divisi {personal.assignment?.division}</p>
          <Link href="/dashboard/kpi" className="caption text-accent-magenta hover:underline">
            Detail →
          </Link>
        </div>
        <div className="flex flex-col gap-md">
          {personal.kpis.map((kpi) => (
            <Card key={kpi.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-sm">
                    <CardTitle className="text-base">{kpi.title}</CardTitle>
                    {kpi.isMilestone && <Badge variant="warning">Milestone</Badge>}
                  </div>
                  <Badge variant="outline">{kpi.progress}%</Badge>
                </div>
                <CardDescription className="mt-xs">
                  {kpi.target.length > 120 ? kpi.target.slice(0, 120) + "..." : kpi.target}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-2 w-full rounded-full bg-surface-container">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${kpi.progress}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ColorBlock>

      {/* Recent Tasks */}
      <ColorBlock color="coral">
        <p className="eyebrow text-on-surface-variant mb-md">Task Terbaru ({totalTasks})</p>
        {personal.tasks.length === 0 && (
          <p className="text-on-surface-variant text-sm">Belum ada task.</p>
        )}
        <div className="flex flex-col gap-sm">
          {personal.tasks.slice(0, 5).map((task) => (
            <Card key={task.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className={`text-sm ${task.status === "done" ? "line-through text-on-surface-variant" : ""}`}>
                      {task.title}
                    </CardTitle>
                    <CardDescription>{task.kpi}</CardDescription>
                  </div>
                  <Badge variant={task.status === "done" ? "success" : "warning"}>
                    {task.status === "done" ? "Selesai" : "Open"}
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </ColorBlock>

      {/* Recent Letters */}
      <ColorBlock color="pink">
        <div className="flex items-center justify-between mb-md">
          <p className="eyebrow text-on-surface-variant">Surat Terbaru</p>
          <Link href="/dashboard/letters" className="caption text-accent-magenta hover:underline">
            Semua →
          </Link>
        </div>
        {personal.letters.length === 0 && (
          <p className="text-on-surface-variant text-sm">Belum ada surat.</p>
        )}
        <div className="flex flex-col gap-sm">
          {personal.letters.map((letter) => {
            const status = getStatusDisplay(letter.status);
            return (
              <Link href={`/dashboard/letters/${letter.id}`} key={letter.id}>
                <Card className="hover:border-accent-magenta/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{letter.subject}</CardTitle>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <CardDescription>
                      {new Date(letter.createdAt).toLocaleDateString("id-ID")}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </ColorBlock>

      {/* Upcoming Meetings */}
      <ColorBlock color="lilac">
        <div className="flex items-center justify-between mb-md">
          <p className="eyebrow text-on-surface-variant">Undangan Rapat</p>
          <Link href="/dashboard/meetings" className="caption text-accent-magenta hover:underline">
            Semua →
          </Link>
        </div>
        {personal.meetings.length === 0 && (
          <p className="text-on-surface-variant text-sm">Belum ada undangan.</p>
        )}
        <div className="flex flex-col gap-sm">
          {personal.meetings.map((mtg) => (
            <Link href={`/dashboard/meetings/${mtg.id}`} key={mtg.id}>
              <Card className="hover:border-accent-magenta/50 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{mtg.title}</CardTitle>
                    <div className="flex items-center gap-xs">
                      <Badge variant={mtg.meetingType === "adhoc" ? "warning" : "info"}>
                        {mtg.meetingType === "adhoc" ? "Ad-hoc" : "Terjadwal"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`${
                          mtg.rsvpStatus === "accepted" ? "bg-emerald-50 text-emerald-700" :
                          mtg.rsvpStatus === "declined" ? "bg-red-50 text-red-700" : ""
                        }`}
                      >
                        {mtg.rsvpStatus === "accepted" ? "Hadir" :
                         mtg.rsvpStatus === "declined" ? "Tidak" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {new Date(mtg.startedAt).toLocaleDateString("id-ID", {
                      weekday: "short", day: "numeric", month: "short",
                      hour: "2-digit", minute: "2-digit",
                    })}
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
