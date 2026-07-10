import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDashboardOverview, getDivisionsWithProgress } from "@/lib/data/dashboard";
import { getDivisionKpiSummaries } from "@/lib/data/kpi";
import { getPersonalDashboard } from "@/lib/data/personal-dashboard";
import { getProfile } from "@/lib/data/profile";
import { getStatusDisplay } from "@/lib/data/letters";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import {
  Target,
  CheckCircle,
  FileText,
  Calendar,
  Users,
  TrendingUp,
  Briefcase,
  ExternalLink,
} from "lucide-react";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

export default async function DashboardPage() {
  const [personal, profile] = await Promise.all([
    getPersonalDashboard(),
    getProfile(),
  ]);

  // If user is logged in and assigned, show personal dashboard
  if (personal.userId && personal.assignment) {
    return <PersonalView personal={personal} profile={profile} />;
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
    <div className="flex flex-col gap-10">
      {/* Welcome Header */}
      <div>
        <p className="text-accent-magenta font-mono text-xs font-bold tracking-widest uppercase mb-1">
          I-FEST 2026
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
          Dashboard Overview
        </h1>
        <p className="mt-2 text-base text-on-surface-variant">
          Pantau progres seluruh divisi kepanitiaan.
        </p>
      </div>

      {/* Login Prompt Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-white border border-outline-variant/60 rounded-2xl gap-4 shadow-none">
        <div className="flex-1">
          <p className="text-base font-bold text-on-surface">Login untuk melihat dashboard personal</p>
          <p className="text-on-surface-variant text-sm mt-1">
            Lihat KPI, task, surat, dan rapat yang relevan dengan divisi Anda.
          </p>
        </div>
        <Link href="/login">
          <Button variant="primary" className="cursor-pointer font-sans text-sm font-semibold shrink-0">
            Login
          </Button>
        </Link>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Divisi Aktif */}
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6 transition-all hover:border-outline-variant">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">DIVISI AKTIF</p>
          <p className="text-4xl font-black text-on-surface my-2 leading-none">{divisions.length}</p>
          <p className="text-xs text-on-surface-variant font-mono">Divisi berjalan</p>
        </div>

        {/* Card 2: Total Anggota */}
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6 transition-all hover:border-outline-variant">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">ANGGOTA</p>
          <p className="text-4xl font-black text-on-surface my-2 leading-none">{overview.totalMembers}</p>
          <p className="text-xs text-on-surface-variant font-mono">Total panitia</p>
        </div>

        {/* Card 3: Total KPI */}
        <Link href="/dashboard/kpi" className="block group">
          <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6 transition-all group-hover:border-outline-variant h-full">
            <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">TOTAL KPI</p>
            <p className="text-4xl font-black text-on-surface my-2 leading-none">{kpiCount}</p>
            <p className="text-xs text-on-surface-variant font-mono">({doneTasks}/{totalTasks} tasks selesai)</p>
          </div>
        </Link>

        {/* Card 4: Total Rapat */}
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6 transition-all hover:border-outline-variant">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">TOTAL RAPAT</p>
          <p className="text-4xl font-black text-on-surface my-2 leading-none">{overview.totalMeetings}</p>
          <p className="text-xs text-on-surface-variant font-mono">Pertemuan diadakan</p>
        </div>
      </div>

      {/* Progres Divisi Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-error" />
            <h2 className="text-xl font-bold tracking-tight text-on-surface">Progres Divisi</h2>
          </div>
          <Link href="/dashboard/kpi" className="text-xs font-mono text-accent-magenta hover:underline uppercase tracking-wider font-bold">
            Lihat detail KPI →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kpiSummaries.map((s) => {
            const progress = s.totalTasks > 0 ? Math.round((s.doneTasks / s.totalTasks) * 100) : 0;
            return (
               <Link href="/dashboard/kpi" key={s.divisionId} className="block group">
                 <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 flex flex-col justify-between h-full hover:border-accent-magenta/50 transition-all">
                   <div>
                     <div className="flex items-start justify-between gap-2 mb-2">
                       <h3 className="font-sans text-lg font-bold text-on-surface group-hover:text-accent-magenta transition-colors leading-tight">
                         {s.divisionName}
                       </h3>
                       <Badge variant="outline" className="text-[10px] font-mono whitespace-nowrap">
                         {s.milestoneKpis} milestone
                       </Badge>
                     </div>
                     <p className="text-xs text-on-surface-variant font-mono">
                       {s.totalKpis} KPI &middot; {s.doneTasks}/{s.totalTasks} tasks
                     </p>
                   </div>
                   
                   <div className="mt-4">
                     <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant mb-1.5">
                       <span>Progress</span>
                       <span className="font-bold text-on-surface">{progress}%</span>
                     </div>
                     <div className="h-2 w-full rounded-full bg-surface-container overflow-hidden">
                       <div
                         className="h-full rounded-full bg-primary transition-all duration-500"
                         style={{ width: `${progress}%` }}
                       />
                     </div>
                   </div>
                 </div>
               </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="size-5 text-error" />
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Aktivitas Terbaru</h2>
        </div>
        <div className="bg-white border border-outline-variant/60 rounded-2xl p-8 flex items-center justify-center">
          <p className="text-sm font-mono text-on-surface-variant text-center">
            Data aktivitas akan muncul setelah login.
          </p>
        </div>
      </div>
    </div>
  );
}

interface PersonalViewProps {
  personal: Awaited<ReturnType<typeof getPersonalDashboard>>;
  profile: any;
}

async function PersonalView({ personal, profile }: PersonalViewProps) {
  const totalTasks = personal.tasks.length;
  const doneTasks = personal.tasks.filter((t) => t.status === "done").length;
  const pendingRsvp = personal.meetings.filter((m) => m.rsvpStatus === "pending").length;

  return (
    <div className="flex flex-col gap-10">
      {/* Welcome Greeting Header */}
      <div>
        <p className="text-accent-magenta font-mono text-xs font-bold tracking-widest uppercase mb-1">
          DASHBOARD {personal.assignment?.division.toUpperCase()}
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
          Halo, {profile?.fullName ? profile.fullName.split(" ")[0] : "Panitia"}!
        </h1>
        <p className="mt-2 text-base text-on-surface-variant">
          Pantau KPI, kelola task, dan kelola administrasi divisi Anda di sini.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: KPI Divisi */}
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6 transition-all hover:border-outline-variant">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">KPI DIVISI</p>
          <p className="text-4xl font-black text-on-surface my-2 leading-none">{personal.kpis.length}</p>
          <p className="text-xs text-on-surface-variant font-mono">Target ditetapkan</p>
        </div>

        {/* Card 2: Total Task */}
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6 transition-all hover:border-outline-variant">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">TOTAL TASK</p>
          <p className="text-4xl font-black text-on-surface my-2 leading-none">{totalTasks}</p>
          <p className="text-xs text-on-surface-variant font-mono">Tugas Anda</p>
        </div>

        {/* Card 3: Task Selesai */}
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6 transition-all hover:border-outline-variant">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">TASK SELESAI</p>
          <p className="text-4xl font-black text-on-surface my-2 leading-none">{doneTasks} / {totalTasks}</p>
          <p className="text-xs text-on-surface-variant font-mono">Pekerjaan rampung</p>
        </div>

        {/* Card 4: Rapat Baru */}
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6 transition-all hover:border-outline-variant">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">RAPAT BARU</p>
          <p className="text-4xl font-black text-on-surface my-2 leading-none">{pendingRsvp}</p>
          <p className="text-xs text-on-surface-variant font-mono">Belum direspon</p>
        </div>
      </div>

      {/* Main Sections Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* KPI Divisi Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="size-5 text-error" />
              <h2 className="text-xl font-bold tracking-tight text-on-surface">KPI Divisi</h2>
            </div>
            <Link href="/dashboard/kpi" className="text-xs font-mono text-accent-magenta hover:underline uppercase tracking-wider font-bold">
              Detail →
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {personal.kpis.length === 0 && (
              <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 text-center">
                <p className="text-sm font-mono text-on-surface-variant">Belum ada KPI ditetapkan.</p>
              </div>
            )}
            {personal.kpis.map((kpi, idx) => (
              <div key={kpi.id} className="bg-white border border-outline-variant/60 rounded-2xl p-5 hover:border-primary/20 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-on-surface-variant uppercase">
                      KPI - {(idx + 1).toString().padStart(2, "0")}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {kpi.isMilestone && (
                        <Badge variant="warning" className="text-[10px] font-mono px-2 py-0.5">
                          Milestone
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px] font-mono px-2 py-0.5">
                        {kpi.progress}%
                      </Badge>
                    </div>
                  </div>
                  <h3 className="font-sans text-base font-bold text-on-surface mb-1">
                    {kpi.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-sans line-clamp-2">
                    {kpi.target}
                  </p>
                </div>

                <div className="mt-4">
                  <div className="h-1.5 w-full rounded-full bg-surface-container overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${kpi.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Terbaru Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="size-5 text-error" />
            <h2 className="text-xl font-bold tracking-tight text-on-surface">Tugas Terbaru</h2>
          </div>

          <div className="flex flex-col gap-3">
            {personal.tasks.length === 0 && (
              <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 text-center">
                <p className="text-sm font-mono text-on-surface-variant">Belum ada task.</p>
              </div>
            )}
            {personal.tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="bg-white border border-outline-variant/60 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className={`text-sm font-bold text-on-surface truncate ${task.status === "done" ? "line-through text-on-surface-variant/70" : ""}`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-on-surface-variant truncate mt-0.5 font-mono">
                    {task.kpi}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant={task.priority === "high" ? "danger" : task.priority === "medium" ? "warning" : "secondary"} className="text-[9px] font-mono px-2 py-0">
                    {task.priority.toUpperCase()}
                  </Badge>
                  <Badge variant={task.status === "done" ? "success" : "warning"} className="text-[9px] font-mono px-2 py-0">
                    {task.status === "done" ? "Done" : "Open"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Surat Terbaru Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="size-5 text-error" />
              <h2 className="text-xl font-bold tracking-tight text-on-surface">Surat Terbaru</h2>
            </div>
            <Link href="/dashboard/letters" className="text-xs font-mono text-accent-magenta hover:underline uppercase tracking-wider font-bold">
              Semua →
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {personal.letters.length === 0 && (
              <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 text-center">
                <p className="text-sm font-mono text-on-surface-variant">Belum ada surat diajukan.</p>
              </div>
            )}
            {personal.letters.map((letter) => {
              const status = getStatusDisplay(letter.status);
              return (
                <Link href={`/dashboard/letters/${letter.id}`} key={letter.id} className="block">
                  <div className="bg-white border border-outline-variant/60 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-primary/20 transition-all">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-on-surface truncate">
                        {letter.subject}
                      </p>
                      <p className="text-xs text-on-surface-variant font-mono mt-0.5">
                        {new Date(letter.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                    <Badge variant={status.variant} className="text-[10px] font-mono px-2 py-0.5 shrink-0">
                      {status.label}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Undangan Rapat Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="size-5 text-error" />
              <h2 className="text-xl font-bold tracking-tight text-on-surface">Undangan Rapat</h2>
            </div>
            <Link href="/dashboard/meetings" className="text-xs font-mono text-accent-magenta hover:underline uppercase tracking-wider font-bold">
              Semua →
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {personal.meetings.length === 0 && (
              <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 text-center">
                <p className="text-sm font-mono text-on-surface-variant">Belum ada undangan rapat.</p>
              </div>
            )}
            {personal.meetings.map((mtg) => (
              <Link href={`/dashboard/meetings/${mtg.id}`} key={mtg.id} className="block">
                <div className="bg-white border border-outline-variant/60 rounded-xl p-4 flex flex-col gap-2 hover:border-primary/20 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm font-bold text-on-surface line-clamp-1">
                      {mtg.title}
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant={mtg.meetingType === "adhoc" ? "warning" : "info"} className="text-[9px] font-mono px-2 py-0">
                        {mtg.meetingType === "adhoc" ? "Ad-hoc" : "Scheduled"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-mono px-2 py-0 ${
                          mtg.rsvpStatus === "accepted" ? "bg-accent-green/10 text-accent-green border-accent-green/30" :
                          mtg.rsvpStatus === "declined" ? "bg-error-container text-error border-error/30" : "bg-accent-lilac/10 text-accent-lilac border-accent-lilac/30"
                        }`}
                      >
                        {mtg.rsvpStatus === "accepted" ? "Hadir" :
                         mtg.rsvpStatus === "declined" ? "Tidak" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant font-mono">
                    {new Date(mtg.startedAt).toLocaleDateString("id-ID", {
                      weekday: "short", day: "numeric", month: "short",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
