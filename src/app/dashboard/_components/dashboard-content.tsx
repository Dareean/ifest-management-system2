import { Suspense } from "react";
import { getProfile } from "@/lib/data/profile";
import { getCurrentAssignment } from "@/lib/data/personal-dashboard";
import { getDashboardOverview, getDivisionsWithProgress } from "@/lib/data/dashboard";
import { getFinanceOverview } from "@/lib/data/finance";
import { getLetters, getStatusDisplay } from "@/lib/data/letters";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  CheckCircle, FileText, Calendar, TrendingUp,
} from "lucide-react";
import { PersonalStats } from "./sections/personal-stats";
import { SekretarisStats } from "./sections/sekretaris-stats";
import { PersonalTasks } from "./sections/personal-tasks";
import { PersonalMeetings } from "./sections/personal-meetings";
import { PersonalLetters } from "./sections/personal-letters";
import { StatCardsSkeleton } from "./skeletons/stat-cards-skeleton";
import { TasksSkeleton } from "./skeletons/tasks-skeleton";
import { MeetingsSkeleton } from "./skeletons/meetings-skeleton";
import { LettersSkeleton } from "./skeletons/letters-skeleton";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";



// ── Global View (unauthenticated) ──

export async function GlobalView() {
  const [overview, divisions] = await Promise.all([
    getDashboardOverview(YEAR_ID),
    getDivisionsWithProgress(YEAR_ID),
  ]);

  const totalTasks = overview.totalTasks;
  const doneTasks = divisions.reduce((acc, d) => acc + d.doneTasks, 0);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <p className="text-accent-magenta font-mono text-xs font-bold tracking-widest uppercase mb-1">I-FEST 2026</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">Dashboard Overview</h1>
        <p className="mt-2 text-base text-on-surface-variant">Pantau progres seluruh divisi kepanitiaan.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-white border border-outline-variant/60 rounded-2xl gap-4">
        <div className="flex-1">
          <p className="text-base font-bold text-on-surface">Login untuk melihat dashboard personal</p>
          <p className="text-on-surface-variant text-sm mt-1">Lihat task, surat, dan rapat yang relevan dengan divisi Anda.</p>
        </div>
        <Link href="/login">
          <Button variant="primary" className="cursor-pointer font-sans text-sm font-semibold shrink-0">Login</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatBlock label="DIVISI AKTIF" value={String(divisions.length)} sub="Divisi berjalan" />
        <StatBlock label="ANGGOTA" value={String(overview.totalMembers)} sub="Total panitia" />
        <Link href="/dashboard/tasks" className="block group">
          <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6 transition-all group-hover:border-outline-variant h-full">
            <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">TOTAL TASKS</p>
            <p className="text-4xl font-black text-on-surface my-2 leading-none">{totalTasks}</p>
            <p className="text-xs text-on-surface-variant font-mono">({doneTasks} selesai)</p>
          </div>
        </Link>
        <StatBlock label="TOTAL RAPAT" value={String(overview.totalMeetings)} sub="Pertemuan diadakan" />
      </div>

      <DivisiProgressSection divisions={divisions} />
    </div>
  );
}

// ── Main Dashboard Content ──

export async function DashboardContent({ userId }: { userId: string }) {
  const assignment = await getCurrentAssignment(userId);
  const profile = await getProfile();

  if (!assignment) return <GlobalView />;

  const level = assignment.roleLevel;
  const slug = assignment.roleSlug;
  const greeting = profile?.fullName?.split(" ")[0] ?? "Panitia";

  // Determine which role view to render
  let roleView: React.ReactNode;

  if (level >= 90) {
    roleView = <KetuaView assignmentId={assignment.id} greeting={greeting} profile={profile} />;
  } else if (level >= 80) {
    roleView = <WakilKetuaView assignmentId={assignment.id} greeting={greeting} profile={profile} />;
  } else if (slug === "sekretaris") {
    roleView = <SekretarisView assignmentId={assignment.id} greeting={greeting} profile={profile} />;
  } else if (slug === "bendahara") {
    roleView = <BendaharaView assignmentId={assignment.id} greeting={greeting} profile={profile} />;
  } else if (slug === "koordinator" || slug === "wakil-koordinator") {
    roleView = <KoordinatorView assignmentId={assignment.id} divisionId={assignment.divisionId} divisionName={assignment.divisionName} greeting={greeting} profile={profile} />;
  } else {
    roleView = <AnggotaView assignmentId={assignment.id} divisionName={assignment.divisionName} greeting={greeting} profile={profile} />;
  }

  return roleView;
}

// ── Role View Components ──

function KetuaView({ assignmentId, greeting, profile }: { assignmentId: string; greeting: string; profile: any }) {
  return (
    <div className="flex flex-col gap-10">
      <HeaderSection title={`DASHBOARD KETUA`} greeting={greeting} subtitle="Pantau kinerja seluruh divisi." />
      <Suspense fallback={<StatCardsSkeleton count={4} />}>
        <KetuaStats />
      </Suspense>
      <Suspense fallback={<LettersSkeleton />}>
        <RecentLettersSection />
      </Suspense>
    </div>
  );
}

function WakilKetuaView({ assignmentId, greeting, profile }: { assignmentId: string; greeting: string; profile: any }) {
  return (
    <div className="flex flex-col gap-10">
      <HeaderSection title={`DASHBOARD WAKIL KETUA`} greeting={greeting} subtitle="Pantau kinerja seluruh divisi." />
      <Suspense fallback={<StatCardsSkeleton count={4} />}>
        <KetuaStats />
      </Suspense>
      <Suspense fallback={<LettersSkeleton />}>
        <RecentLettersSection />
      </Suspense>
    </div>
  );
}

function SekretarisView({ assignmentId, greeting, profile }: { assignmentId: string; greeting: string; profile: any }) {
  return (
    <div className="flex flex-col gap-10">
      <HeaderSection title="DASHBOARD SEKRETARIS" greeting={greeting} subtitle="Kelola surat-menyurat dan administrasi kepanitiaan." />
      <Suspense fallback={<StatCardsSkeleton count={3} />}>
        <SekretarisStats />
      </Suspense>
      <Suspense fallback={<div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />}>
        <WeeklyReportProgressSection />
      </Suspense>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <SectionTitle icon={FileText} title="Semua Surat" />
            <Link href="/dashboard/letters" className="text-xs font-mono text-accent-magenta hover:underline">
              Lihat Semua
            </Link>
          </div>
          <Suspense fallback={<LettersSkeleton />}>
            <PersonalLetters showAll />
          </Suspense>
        </div>
        <div>
          <SectionTitle icon={Calendar} title="Rapat Terdekat" />
          <Suspense fallback={<MeetingsSkeleton />}>
            <PersonalMeetings assignmentId={assignmentId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// Stats wrapper for Sekretaris/Bendahara and standard views
function BendaharaView({ assignmentId, greeting, profile }: { assignmentId: string; greeting: string; profile: any }) {
  return (
    <div className="flex flex-col gap-10">
      <HeaderSection title="DASHBOARD BENDAHARA" greeting={greeting} subtitle="Pantau keuangan kepanitiaan." />
      <Suspense fallback={<StatCardsSkeleton count={3} />}>
        <BendaharaStats />
      </Suspense>
      <Suspense fallback={<div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />}>
        <WeeklyReportProgressSection />
      </Suspense>
      <Suspense fallback={<LettersSkeleton />}>
        <PersonalLetters assignmentId={assignmentId} />
      </Suspense>
    </div>
  );
}

async function KoordinatorWeeklyReportAlert({ divisionId, currentWeek }: { divisionId: string; currentWeek: string }) {
  const supabase = createAdminClient();
  
  const { data: report } = await supabase
    .from("weekly_reports")
    .select("status, id")
    .eq("division_id", divisionId)
    .eq("week_label", currentWeek)
    .maybeSingle();

  if (report?.status === "APPROVED") {
    return null;
  }

  const alertConfig = {
    bg: "bg-amber-50 border-amber-200 text-amber-900",
    iconColor: "text-amber-600",
    title: `Laporan Mingguan Belum Disetor (${currentWeek})`,
    desc: "Divisi Anda belum mengumpulkan laporan progres untuk minggu ini. Harap segera susun dan setor ke Pengawas.",
    btnText: "Setor Laporan Sekarang",
    btnHref: "/dashboard/weekly-report/create"
  };

  if (report?.status === "NEED_FIX") {
    alertConfig.bg = "bg-rose-50 border-rose-250 text-rose-900";
    alertConfig.iconColor = "text-rose-600";
    alertConfig.title = "Laporan Mingguan Butuh Revisi";
    alertConfig.desc = "Laporan Anda telah ditinjau dan ditandai butuh perbaikan oleh Pengawas. Silakan periksa catatan revisi dan perbarui laporan Anda.";
    alertConfig.btnText = "Revisi Laporan";
    alertConfig.btnHref = `/dashboard/weekly-report/create?edit=${report.id}`;
  } else if (report?.status === "PENDING") {
    alertConfig.bg = "bg-indigo-50 border-indigo-250 text-indigo-900";
    alertConfig.iconColor = "text-indigo-600";
    alertConfig.title = "Laporan Sedang Ditinjau";
    alertConfig.desc = "Laporan mingguan Anda telah disetor dan saat ini sedang menunggu persetujuan dari Pengawas.";
    alertConfig.btnText = "Lihat Detail";
    alertConfig.btnHref = "/dashboard/weekly-report";
  }

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border rounded-2xl gap-4 ${alertConfig.bg}`}>
      <div className="flex gap-3">
        <div className={`p-2 bg-white rounded-xl shadow-sm shrink-0 ${alertConfig.iconColor}`}>
          <FileText className="size-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold tracking-tight">{alertConfig.title}</h3>
          <p className="text-xs opacity-90 mt-1 leading-relaxed max-w-xl">{alertConfig.desc}</p>
        </div>
      </div>
      <Link href={alertConfig.btnHref} className="shrink-0 w-full sm:w-auto">
        <button className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-200 font-bold text-xs rounded-full transition-colors shadow-sm cursor-pointer">
          {alertConfig.btnText}
        </button>
      </Link>
    </div>
  );
}

async function KoordinatorView({ assignmentId, divisionId, divisionName, greeting, profile }: { assignmentId: string; divisionId: string; divisionName: string; greeting: string; profile: any }) {
  return (
    <div className="flex flex-col gap-10">
      <HeaderSection title={`DIVISI ${divisionName.toUpperCase()}`} greeting={greeting} subtitle="Pantau task dan progres divisi Anda." />
      
      <Suspense fallback={<div className="h-20 bg-slate-100 rounded-2xl animate-pulse" />}>
        <KoordinatorWeeklyReportAlert divisionId={divisionId} currentWeek="Agustus W1" />
      </Suspense>

      <Suspense fallback={<StatCardsSkeleton count={3} />}>
        <PersonalStats assignmentId={assignmentId} />
      </Suspense>

      <Suspense fallback={<div className="h-48 bg-slate-100 rounded-[32px] animate-pulse" />}>
        <KoordinatorPerformanceSection divisionId={divisionId} />
      </Suspense>

      <Suspense fallback={<TasksSkeleton />}>
        <KoordinatorTasks divisionId={divisionId} />
      </Suspense>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <SectionTitle icon={Calendar} title="Undangan Rapat" />
          <Suspense fallback={<MeetingsSkeleton />}>
            <PersonalMeetings assignmentId={assignmentId} />
          </Suspense>
        </div>
        <div>
          <SectionTitle icon={FileText} title="Surat Divisi" />
          <Suspense fallback={<LettersSkeleton />}>
            <PersonalLetters assignmentId={assignmentId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function AnggotaView({ assignmentId, divisionName, greeting, profile }: { assignmentId: string; divisionName: string; greeting: string; profile: any }) {
  return (
    <div className="flex flex-col gap-10">
      <HeaderSection title={`DASHBOARD ${divisionName.toUpperCase()}`} greeting={greeting} subtitle="Pantau task dan undangan rapat Anda di sini." />
      <Suspense fallback={<StatCardsSkeleton count={3} />}>
        <PersonalStats assignmentId={assignmentId} />
      </Suspense>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <SectionTitle icon={CheckCircle} title="Tugas Terbaru" />
          <Suspense fallback={<TasksSkeleton />}>
            <PersonalTasks assignmentId={assignmentId} />
          </Suspense>
        </div>
        <div>
          <SectionTitle icon={Calendar} title="Undangan Rapat" />
          <Suspense fallback={<MeetingsSkeleton />}>
            <PersonalMeetings assignmentId={assignmentId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// ── Shared Sub-components ──

function HeaderSection({ title, greeting, subtitle }: { title: string; greeting: string; subtitle: string }) {
  return (
    <div>
      <p className="text-accent-magenta font-mono text-xs font-bold tracking-widest uppercase mb-1">{title}</p>
      <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">Halo, {greeting}!</h1>
      <p className="mt-2 text-base text-on-surface-variant">{subtitle}</p>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="size-5 text-error" />
      <h2 className="text-xl font-bold tracking-tight text-on-surface">{title}</h2>
    </div>
  );
}

function StatBlock({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6 transition-all hover:border-outline-variant">
      <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">{label}</p>
      <p className="text-4xl font-black text-on-surface my-2 leading-none">{value}</p>
      <p className="text-xs text-on-surface-variant font-mono">{sub}</p>
    </div>
  );
}

function DivisiProgressSection({ divisions }: { divisions: any[] }) {
  // Sort divisions by progress percentage descending, then by total tasks descending
  const sortedDivisions = [...divisions].sort((a, b) => {
    const progressA = a.totalTasks > 0 ? a.doneTasks / a.totalTasks : 0;
    const progressB = b.totalTasks > 0 ? b.doneTasks / b.totalTasks : 0;
    if (progressB !== progressA) {
      return progressB - progressA;
    }
    return b.totalTasks - a.totalTasks;
  });

  // Calculate overall stats
  const totalTasks = divisions.reduce((acc, d) => acc + d.totalTasks, 0);
  const doneTasks = divisions.reduce((acc, d) => acc + d.doneTasks, 0);
  const openTasks = totalTasks - doneTasks;
  const overallProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // SVG donut math
  const r = 70;
  const circumference = 2 * Math.PI * r; // ~439.82
  const strokeDashoffset = circumference - (overallProgress / 100) * circumference;

  return (
    <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-accent-magenta" />
            <h2 className="text-xl font-bold tracking-tight text-on-surface">Monitoring Progres</h2>
          </div>
          <p className="text-xs text-on-surface-variant mt-1 font-sans">
            Visualisasi status penyelesaian tugas dan perbandingan progres divisi panitia I-FEST 2026.
          </p>
        </div>
        <Link href="/dashboard/tasks" className="text-xs font-mono text-accent-magenta hover:underline uppercase tracking-wider font-bold shrink-0">
          Lihat detail Tugas →
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        {/* Left Side: Donut Chart (Overall Progress) */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col items-center justify-center p-6 bg-surface-container-low/30 rounded-2xl border border-outline-variant/30">
          <h3 className="text-sm font-bold text-on-surface mb-6 uppercase tracking-wider font-mono text-center">Akumulasi Tugas</h3>
          
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 200 200" className="transform -rotate-90">
              <defs>
                <linearGradient id="donutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-primary, #000000)" />
                  <stop offset="100%" stopColor="var(--color-accent-magenta, #FF3D8B)" />
                </linearGradient>
              </defs>
              {/* Background Circle */}
              <circle
                cx="100"
                cy="100"
                r={r}
                fill="transparent"
                stroke="var(--color-surface-container, #f3f4f6)"
                strokeWidth="14"
              />
              {/* Progress Circle */}
              <circle
                cx="100"
                cy="100"
                r={r}
                fill="transparent"
                stroke="url(#donutGradient)"
                strokeWidth="14"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            
            {/* Center Labels */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-on-surface tracking-tight">{overallProgress}%</span>
              <span className="text-[10px] font-mono font-bold text-on-surface-variant/80 uppercase tracking-widest mt-0.5">Selesai</span>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 w-full space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-accent-magenta" />
                <span className="text-on-surface-variant">Selesai</span>
              </div>
              <span className="font-bold text-on-surface">{doneTasks} tasks</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-surface-container" />
                <span className="text-on-surface-variant">Belum Selesai</span>
              </div>
              <span className="font-bold text-on-surface">{openTasks} tasks</span>
            </div>
            <div className="border-t border-outline-variant/30 pt-2.5 flex items-center justify-between text-xs font-mono">
              <span className="text-on-surface-variant font-bold">Total Tugas</span>
              <span className="font-bold text-on-surface">{totalTasks} tasks</span>
            </div>
          </div>
        </div>

        {/* Right Side: Vertical Bar Chart (Division Progress) */}
        <div className="flex-1 flex flex-col justify-between p-6 bg-surface-container-low/30 rounded-2xl border border-outline-variant/30 min-h-[340px]">
          <h3 className="text-sm font-bold text-on-surface mb-6 uppercase tracking-wider font-mono px-1">Progres Per Divisi</h3>
          
          <div className="flex items-end h-64 w-full">
            {/* Y-Axis Labels */}
            <div className="w-8 h-48 flex flex-col justify-between text-[9px] font-mono text-on-surface-variant/50 text-right pr-2 select-none pb-8">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>

            {/* Bars Area */}
            <div className="flex-1 h-56 flex items-end justify-around relative px-1">
              {/* Horizontal grid lines */}
              <div className="absolute inset-x-0 top-0 bottom-8 pointer-events-none flex flex-col justify-between">
                <div className="w-full border-b border-dashed border-outline-variant/10" />
                <div className="w-full border-b border-dashed border-outline-variant/10" />
                <div className="w-full border-b border-dashed border-outline-variant/10" />
                <div className="w-full border-b border-dashed border-outline-variant/10" />
                <div className="w-full border-b border-dashed border-outline-variant/10" />
              </div>

              {sortedDivisions.map((s) => {
                const progress = s.totalTasks > 0 ? Math.round((s.doneTasks / s.totalTasks) * 100) : 0;
                const nameParts = s.name.split(" ");
                return (
                  <Link href="/dashboard/tasks" key={s.id} className="h-full flex flex-col justify-end items-center group relative z-10 flex-1 px-0.5 sm:px-1 max-w-[64px]">
                    {/* Tooltip / Value on top */}
                    <span className="text-[9px] font-mono font-bold text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity mb-1 absolute -top-4 bg-surface-container border border-outline-variant/30 px-1 rounded shadow-xs pointer-events-none whitespace-nowrap z-20">
                      {s.doneTasks}/{s.totalTasks} tasks
                    </span>

                    {/* Bar Visual */}
                    <div className="w-3.5 sm:w-6 md:w-8 h-32 bg-surface-container/50 rounded-t-md overflow-hidden flex items-end border border-outline-variant/5 group-hover:border-accent-magenta/30 transition-colors shadow-inner">
                      <div 
                        className="w-full rounded-t-sm bg-gradient-to-t from-primary to-accent-magenta transition-all duration-1000 ease-out origin-bottom" 
                        style={{ height: `${progress}%` }}
                      />
                    </div>

                    {/* Percentage */}
                    <span className="font-mono text-[9px] md:text-xs font-extrabold text-on-surface mt-1.5 leading-none">
                      {progress}%
                    </span>

                    {/* Label split by words */}
                    <div className="text-[8px] md:text-[10px] font-bold text-on-surface-variant mt-2 text-center h-8 flex flex-col justify-start leading-tight select-none">
                      {nameParts.map((part, idx) => (
                        <span key={idx} className="block truncate max-w-[36px] sm:max-w-[50px] md:max-w-none group-hover:text-accent-magenta transition-colors">
                          {part}
                        </span>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Role-specific Async Section Components ──

async function KetuaStats() {
  const [overview, divisions] = await Promise.all([
    getDashboardOverview(YEAR_ID),
    getDivisionsWithProgress(YEAR_ID),
  ]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatBlock label="DIVISI AKTIF" value={String(divisions.length)} sub="Divisi berjalan" />
        <StatBlock label="ANGGOTA" value={String(overview.totalMembers)} sub="Total panitia" />
        <StatBlock label="TOTAL TASKS" value={String(overview.totalTasks)} sub="Tugas dikelola" />
        <StatBlock label="TOTAL RAPAT" value={String(overview.totalMeetings)} sub="Pertemuan diadakan" />
      </div>
      <DivisiProgressSection divisions={divisions} />
      <WeeklyReportProgressSection />
    </>
  );
}

async function RecentLettersSection() {
  const letters = await getLetters();

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle icon={FileText} title="Aktivitas Surat Terbaru" />
      {letters.length === 0 ? (
        <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 text-center">
          <p className="text-sm font-mono text-on-surface-variant">Belum ada permohonan surat.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {letters.slice(0, 5).map((l) => {
            const status = getStatusDisplay(l.status);
            return (
              <Link href={`/dashboard/letters/${l.id}`} key={l.id} className="block group">
                <div className="bg-white border border-outline-variant/60 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-accent-magenta/50 transition-all">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-on-surface truncate group-hover:text-accent-magenta transition-colors">{l.subject}</p>
                    <p className="text-xs text-on-surface-variant font-mono mt-0.5">{l.division} &middot; {l.requester}</p>
                  </div>
                  <Badge variant={status.variant} className="text-[10px] font-mono px-2 py-0.5 shrink-0">{status.label}</Badge>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

async function BendaharaStats() {
  const finance = await getFinanceOverview();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6">
        <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">TOTAL ANGGARAN</p>
        <p className="text-4xl font-black text-on-surface my-2 leading-none">
          Rp {finance.total_budget ? (finance.total_budget / 1_000_000).toFixed(1) : 0}jt
        </p>
        <p className="text-xs text-on-surface-variant font-mono">Keseluruhan dana</p>
      </div>
      <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6">
        <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">TERPAKAI</p>
        <p className="text-4xl font-black text-on-surface my-2 leading-none">
          Rp {finance.total_used ? (finance.total_used / 1_000_000).toFixed(1) : 0}jt
        </p>
        <p className="text-xs text-on-surface-variant font-mono">Dana terpakai</p>
      </div>
      <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6">
        <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">SISA</p>
        <p className="text-4xl font-black text-on-surface my-2 leading-none">
          Rp {finance.total_remaining ? (finance.total_remaining / 1_000_000).toFixed(1) : 0}jt
        </p>
        <p className="text-xs text-on-surface-variant font-mono">Sisa anggaran</p>
      </div>
    </div>
  );
}

async function KoordinatorTasks({ divisionId }: { divisionId: string }) {
  const supabase = createAdminClient();
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, status, priority, deadline")
    .eq("committee_year_id", YEAR_ID)
    .eq("division_id", divisionId)
    .order("created_at");

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle icon={CheckCircle} title="Tugas Divisi" />
      <div className="flex flex-col gap-3">
        {(tasks ?? []).length === 0 && (
          <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 text-center">
            <p className="text-sm font-mono text-on-surface-variant">Belum ada task di divisi ini.</p>
          </div>
        )}
        {(tasks ?? []).slice(0, 5).map((task: any) => (
          <div key={task.id} className="bg-white border border-outline-variant/60 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className={`text-sm font-bold text-on-surface truncate ${task.status === "done" ? "line-through text-on-surface-variant/70" : ""}`}>{task.title}</p>
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
  );
}

async function WeeklyReportProgressSection() {
  const supabase = createAdminClient();
  const currentWeek = "Agustus W1";

  // Fetch divisions (excluding BPH)
  const { data: divisions } = await supabase
    .from("divisions")
    .select("id, name, slug")
    .eq("committee_year_id", YEAR_ID)
    .neq("slug", "bph")
    .order("sort_order");

  // Fetch reports for current week
  const { data: reports } = await supabase
    .from("weekly_reports")
    .select("status, division_id")
    .eq("committee_year_id", YEAR_ID)
    .eq("week_label", currentWeek);

  if (!divisions) return null;

  const totalDivs = divisions.length;
  const reportsList = reports || [];

  const approvedCount = reportsList.filter(r => r.status === "APPROVED").length;
  const pendingCount = reportsList.filter(r => r.status === "PENDING").length;
  const needFixCount = reportsList.filter(r => r.status === "NEED_FIX").length;
  const unsubmittedCount = Math.max(0, totalDivs - reportsList.length);
  const submittedCount = reportsList.length;

  const submissionRate = totalDivs > 0 ? Math.round((submittedCount / totalDivs) * 100) : 0;

  // Donut math
  const r = 70;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference - (submissionRate / 100) * circumference;

  const DIVISION_MAP_INTERNAL: Record<string, string> = {
    "acara": "ACARA",
    "logistik": "LOGISTIK",
    "lapangan": "LAPANGAN",
    "ekonomi-kreatif": "EKRAF",
    "konsumsi": "KONSUMSI",
    "keamanan": "KEAMANAN",
    "humas": "HUMAS",
    "sponsorship": "SPONSORSHIP",
    "kreativitas": "KREATIVITAS"
  };

  // Division list with status mapping
  const divisionsStatus = divisions.map(div => {
    const report = reportsList.find(r => r.division_id === div.id);
    const status = report ? report.status : "UNSUBMITTED";
    return {
      id: div.id,
      name: DIVISION_MAP_INTERNAL[div.slug] || div.name.toUpperCase(),
      slug: div.slug,
      status
    };
  });

  return (
    <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-accent-magenta" />
            <h2 className="text-xl font-bold tracking-tight text-on-surface">Monitoring Laporan Mingguan</h2>
          </div>
          <p className="text-xs text-on-surface-variant mt-1 font-sans">
            Status penyetoran dan peninjauan laporan mingguan seluruh divisi untuk minggu aktif: <span className="font-bold text-primary">{currentWeek}</span>.
          </p>
        </div>
        <Link href="/dashboard/weekly-report" className="text-xs font-mono text-accent-magenta hover:underline uppercase tracking-wider font-bold shrink-0">
          Tinjau Detail Laporan →
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        {/* Left Side: Donut Chart (Submission Rate) */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col items-center justify-center p-6 bg-surface-container-low/30 rounded-2xl border border-outline-variant/30">
          <h3 className="text-sm font-bold text-on-surface mb-6 uppercase tracking-wider font-mono text-center">Akumulasi Setoran</h3>
          
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 200 200" className="transform -rotate-90">
              <defs>
                <linearGradient id="reportGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>
              {/* Background Circle */}
              <circle
                cx="100"
                cy="100"
                r={r}
                fill="transparent"
                stroke="var(--color-surface-container, #f3f4f6)"
                strokeWidth="14"
              />
              {/* Progress Circle */}
              <circle
                cx="100"
                cy="100"
                r={r}
                fill="transparent"
                stroke="url(#reportGradient)"
                strokeWidth="14"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            
            {/* Center Labels */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-on-surface tracking-tight">{submissionRate}%</span>
              <span className="text-[10px] font-mono font-bold text-on-surface-variant/80 uppercase tracking-widest mt-0.5">Disetor</span>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 w-full space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-on-surface-variant">Disetujui</span>
              </div>
              <span className="font-bold text-on-surface">{approvedCount} Divisi</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-on-surface-variant">Menunggu Review</span>
              </div>
              <span className="font-bold text-on-surface">{pendingCount} Divisi</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-on-surface-variant">Butuh Revisi</span>
              </div>
              <span className="font-bold text-on-surface">{needFixCount} Divisi</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-300" />
                <span className="text-on-surface-variant">Belum Disetor</span>
              </div>
              <span className="font-bold text-on-surface">{unsubmittedCount} Divisi</span>
            </div>
          </div>
        </div>

        {/* Right Side: Grid Status Per Divisi */}
        <div className="flex-1 p-6 bg-surface-container-low/30 rounded-2xl border border-outline-variant/30 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-on-surface mb-6 uppercase tracking-wider font-mono px-1">Kepatuhan Laporan</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {divisionsStatus.map(div => {
              let badgeBg = "bg-slate-50 border-slate-200 text-slate-500";
              let statusLabel = "Belum Disetor";

              if (div.status === "APPROVED") {
                badgeBg = "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold";
                statusLabel = "Disetujui";
              } else if (div.status === "PENDING") {
                badgeBg = "bg-amber-50 border-amber-200 text-amber-700 font-bold";
                statusLabel = "Menunggu";
              } else if (div.status === "NEED_FIX") {
                badgeBg = "bg-rose-50 border-rose-200 text-rose-700 font-bold";
                statusLabel = "Revisi";
              }

              return (
                <div key={div.id} className="p-3 bg-white border border-outline-variant/40 rounded-xl flex items-center justify-between gap-2 shadow-sm hover:border-accent-magenta/35 transition-all">
                  <span className="text-xs font-bold text-on-surface truncate">{div.name}</span>
                  <span className={`text-[9px] font-mono px-2 py-0.5 border rounded-full uppercase shrink-0 ${badgeBg}`}>
                    {statusLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

async function KoordinatorPerformanceSection({ divisionId }: { divisionId: string }) {
  const supabase = createAdminClient();

  // 1. Fetch tasks for progress
  const { data: tasks } = await supabase
    .from("tasks")
    .select("status")
    .eq("committee_year_id", YEAR_ID)
    .eq("division_id", divisionId);

  const totalTasks = tasks?.length || 0;
  const doneTasks = tasks?.filter(t => t.status === "done").length || 0;
  const openTasks = totalTasks - doneTasks;
  const taskProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Donut math
  const r = 45;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference - (taskProgress / 100) * circumference;

  // 2. Fetch weekly reports history for active month (e.g. Agustus)
  const targetWeeks = ["Agustus W1", "Agustus W2", "Agustus W3", "Agustus W4"];
  const { data: reports } = await supabase
    .from("weekly_reports")
    .select("status, week_label")
    .eq("committee_year_id", YEAR_ID)
    .eq("division_id", divisionId)
    .in("week_label", targetWeeks);

  const reportsMap = Object.fromEntries(
    (reports || []).map(r => [r.week_label, r.status])
  );

  return (
    <div className="bg-white border border-outline-variant/60 rounded-[32px] p-6 shadow-sm">
      <div className="border-b border-outline-variant/30 pb-4 mb-6">
        <h3 className="text-base font-bold text-on-surface tracking-tight">Kinerja & Progres Divisi</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">Ringkasan visual penyelesaian tugas dan konsistensi laporan mingguan divisi Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left: Task Progress Donut */}
        <div className="flex items-center gap-6 p-4 bg-surface-container-low/30 rounded-2xl border border-outline-variant/20">
          <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
            <svg width="100%" height="100%" viewBox="0 0 120 120" className="transform -rotate-90">
              <defs>
                <linearGradient id="taskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
              <circle
                cx="60"
                cy="60"
                r={r}
                fill="transparent"
                stroke="var(--color-surface-container, #f3f4f6)"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r={r}
                fill="transparent"
                stroke="url(#taskGrad)"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-black text-on-surface leading-none">{taskProgress}%</span>
              <span className="text-[8px] font-mono font-bold text-on-surface-variant uppercase tracking-wider mt-0.5">Selesai</span>
            </div>
          </div>

          <div className="flex-1 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span className="text-on-surface-variant">Selesai</span>
              </div>
              <span className="font-bold text-on-surface">{doneTasks}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-blue-500" />
                <span className="text-on-surface-variant">Open</span>
              </div>
              <span className="font-bold text-on-surface">{openTasks}</span>
            </div>
            <div className="border-t border-outline-variant/30 pt-1.5 flex justify-between items-center font-bold">
              <span>Total Tugas</span>
              <span>{totalTasks}</span>
            </div>
          </div>
        </div>

        {/* Right: Weekly Report Submission Timeline */}
        <div className="flex flex-col justify-between p-4 bg-surface-container-low/30 rounded-2xl border border-outline-variant/20 h-full min-h-[120px]">
          <span className="text-xs font-bold font-mono text-on-surface-variant uppercase tracking-wider mb-3 block">
            Riwayat Setoran (Agustus)
          </span>

          <div className="flex items-center justify-between gap-2 relative">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />

            {targetWeeks.map((week, idx) => {
              const status = reportsMap[week] || "UNSUBMITTED";
              let colorClass = "bg-slate-200 border-slate-300 text-slate-500";
              let label = "Belum";

              if (status === "APPROVED") {
                colorClass = "bg-emerald-500 border-emerald-600 text-white shadow-sm shadow-emerald-500/20";
                label = "Approved";
              } else if (status === "PENDING") {
                colorClass = "bg-amber-400 border-amber-500 text-white shadow-sm shadow-amber-500/20";
                label = "Pending";
              } else if (status === "NEED_FIX") {
                colorClass = "bg-rose-500 border-rose-600 text-white shadow-sm shadow-rose-500/20";
                label = "Revisi";
              }

              return (
                <div key={week} className="flex flex-col items-center gap-1.5 relative z-10 flex-1">
                  <div className={`size-8 rounded-full border-2 flex items-center justify-center text-[10px] font-black font-mono transition-all duration-300 ${colorClass}`}>
                    W{idx + 1}
                  </div>
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-tight">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

