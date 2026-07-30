import { Suspense } from "react";
import { getProfile } from "@/lib/data/profile";
import { getCurrentAssignment } from "@/lib/data/personal-dashboard";
import { getDashboardOverview, getDivisionsWithProgress } from "@/lib/data/dashboard";
import { getFinanceOverview } from "@/lib/data/finance";
import { getLetters, getStatusDisplay } from "@/lib/data/letters";
import { getMeetings } from "@/lib/data/meetings";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  CheckCircle, FileText, Calendar, TrendingUp, PlayCircle, Clock, MapPin,
} from "lucide-react";
import { PersonalStats } from "./sections/personal-stats";
import { SekretarisStats } from "./sections/sekretaris-stats";
import { PersonalTasks } from "./sections/personal-tasks";
import { PersonalMeetings } from "./sections/personal-meetings";
import { PersonalLetters } from "./sections/personal-letters";
import { RegistrationStatsChart } from "./sections/registration-stats-chart";
import { VerificationDonutChart } from "./sections/verification-donut-chart";
import { SecretaryQuickActions } from "./sections/secretary-quick-actions";
import { SecretaryLetterChart } from "./sections/secretary-letter-chart";
import { SECRETARY_SLUGS } from "@/lib/auth/authorize";
import { Users as UsersIcon, Clock as ClockIcon, CheckCircle2 as CheckCircleIcon, AlertTriangle as AlertTriangleIcon } from "lucide-react";
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
  const roleNameLower = profile?.assignment?.roleName?.toLowerCase() || "";
  const divisionNameLower = assignment.divisionName?.toLowerCase() || "";

  const isSecretaryRole =
    SECRETARY_SLUGS.includes(slug) ||
    slug.includes("sekretaris") ||
    roleNameLower.includes("sekretaris") ||
    (divisionNameLower === "bph" && (slug.includes("sekretaris") || roleNameLower.includes("sekretaris")));

  // Determine which role view to render
  let roleView: React.ReactNode;

  if (isSecretaryRole) {
    roleView = <SekretarisView assignmentId={assignment.id} greeting={greeting} profile={profile} />;
  } else if (level >= 90) {
    roleView = <KetuaView assignmentId={assignment.id} greeting={greeting} profile={profile} />;
  } else if (level >= 80) {
    roleView = <WakilKetuaView assignmentId={assignment.id} greeting={greeting} profile={profile} />;
  } else if (slug === "bendahara" || roleNameLower.includes("bendahara")) {
    roleView = <BendaharaView assignmentId={assignment.id} greeting={greeting} profile={profile} />;
  } else if (slug === "koordinator" || slug === "wakil-koordinator" || roleNameLower.includes("koordinator")) {
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
      <HeaderSection title={`DASHBOARD KETUA`} greeting={greeting} subtitle="Pantau kinerja dan progres seluruh divisi kepanitiaan." />
      <Suspense fallback={<StatCardsSkeleton count={4} />}>
        <KetuaStats />
      </Suspense>

      {/* Dual Committee Monitoring Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2">
          <Suspense fallback={<div className="h-64 bg-slate-100 rounded-3xl animate-pulse" />}>
            <RegistrationStatsChart />
          </Suspense>
        </div>
        <div className="lg:col-span-1">
          <Suspense fallback={<div className="h-64 bg-slate-100 rounded-3xl animate-pulse" />}>
            <VerificationDonutChart />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<MeetingsSkeleton />}>
        <OngoingMeetingsSection />
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

      {/* Dual Committee Monitoring Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2">
          <Suspense fallback={<div className="h-64 bg-slate-100 rounded-3xl animate-pulse" />}>
            <RegistrationStatsChart />
          </Suspense>
        </div>
        <div className="lg:col-span-1">
          <Suspense fallback={<div className="h-64 bg-slate-100 rounded-3xl animate-pulse" />}>
            <VerificationDonutChart />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<MeetingsSkeleton />}>
        <OngoingMeetingsSection />
      </Suspense>
      <Suspense fallback={<LettersSkeleton />}>
        <RecentLettersSection />
      </Suspense>
    </div>
  );
}

function SekretarisView({ assignmentId, greeting, profile }: { assignmentId: string; greeting: string; profile: any }) {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <HeaderSection title="DASHBOARD SEKRETARIS BPH" greeting={greeting} subtitle="Kelola permohonan surat-menyurat, rapat, dan administrasi kepanitiaan." />
      
      {/* Quick Actions Bar */}
      <SecretaryQuickActions />

      {/* 4 Stat Cards */}
      <Suspense fallback={<StatCardsSkeleton count={3} />}>
        <SekretarisStats />
      </Suspense>

      {/* Dual Visual Graphs Grid: 2/3 Letter Workflow Chart, 1/3 Verification Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2">
          <Suspense fallback={<div className="h-64 bg-slate-100 rounded-3xl animate-pulse" />}>
            <SecretaryLetterChart />
          </Suspense>
        </div>
        <div className="lg:col-span-1">
          <Suspense fallback={<div className="h-64 bg-slate-100 rounded-3xl animate-pulse" />}>
            <VerificationDonutChart />
          </Suspense>
        </div>
      </div>

      {/* Ongoing & Monitoring Rapat */}
      <Suspense fallback={<MeetingsSkeleton />}>
        <OngoingMeetingsSection />
      </Suspense>

      {/* Bottom Grid: Surat Terbaru & Rapat Terdekat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <SectionTitle icon={FileText} title="Semua Berkas Surat" />
            <Link href="/dashboard/letters" className="text-xs font-mono text-pink-500 font-bold hover:underline">
              Lihat Semua →
            </Link>
          </div>
          <Suspense fallback={<LettersSkeleton />}>
            <PersonalLetters showAll />
          </Suspense>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <SectionTitle icon={Calendar} title="Rapat Terdekat" />
            <Link href="/dashboard/meetings" className="text-xs font-mono text-pink-500 font-bold hover:underline">
              Lihat Semua →
            </Link>
          </div>
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

      {/* Dual Financial Monitoring Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2">
          <Suspense fallback={<div className="h-64 bg-slate-100 rounded-3xl animate-pulse" />}>
            <RegistrationStatsChart />
          </Suspense>
        </div>
        <div className="lg:col-span-1">
          <Suspense fallback={<div className="h-64 bg-slate-100 rounded-3xl animate-pulse" />}>
            <VerificationDonutChart />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<MeetingsSkeleton />}>
        <OngoingMeetingsSection />
      </Suspense>
      <Suspense fallback={<LettersSkeleton />}>
        <PersonalLetters assignmentId={assignmentId} />
      </Suspense>
    </div>
  );
}

async function KoordinatorWeeklyReportAlert({ divisionId, currentWeek }: { divisionId: string; currentWeek: string }) {
  if (!divisionId) return null;
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
      <div className="flex items-start gap-3">
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
  const safeDivName = divisionName || "";
  return (
    <div className="flex flex-col gap-10">
      <HeaderSection title={`DIVISI ${safeDivName.toUpperCase()}`} greeting={greeting} subtitle="Pantau task dan progres divisi Anda." />
      
      <Suspense fallback={<div className="h-20 bg-slate-100 rounded-2xl animate-pulse" />}>
        <KoordinatorWeeklyReportAlert divisionId={divisionId} currentWeek="Agustus W1" />
      </Suspense>

      <Suspense fallback={<StatCardsSkeleton count={3} />}>
        <PersonalStats assignmentId={assignmentId} />
      </Suspense>

      <Suspense fallback={<div className="h-36 bg-slate-100 rounded-2xl animate-pulse" />}>
        <LatestNotulensiPRSection />
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
  const safeDivName = divisionName || "";
  return (
    <div className="flex flex-col gap-10">
      <HeaderSection title={`DASHBOARD ${safeDivName.toUpperCase()}`} greeting={greeting} subtitle="Pantau task dan undangan rapat Anda di sini." />
      <Suspense fallback={<StatCardsSkeleton count={3} />}>
        <PersonalStats assignmentId={assignmentId} />
      </Suspense>
      <Suspense fallback={<div className="h-36 bg-slate-100 rounded-2xl animate-pulse" />}>
        <LatestNotulensiPRSection />
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
      <p className="text-accent-magenta font-mono text-[10px] font-bold uppercase tracking-widest mb-1">
        {title || "ADMIN PANEL"}
      </p>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface font-sans">
        Dashboard
      </h1>
      {subtitle && (
        <p className="mt-1 text-sm text-on-surface-variant font-sans">{subtitle}</p>
      )}
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="size-5 text-accent-magenta" />
      <h2 className="text-xl font-bold tracking-tight text-on-surface font-sans">{title}</h2>
    </div>
  );
}

function StatBlock({ label, value, icon: Icon, iconBg = "bg-slate-100", iconColor = "text-slate-600" }: { label: string; value: string; icon?: any; iconBg?: string; iconColor?: string }) {
  const IconComp = Icon || UsersIcon;
  return (
    <div className="bg-white border border-[#04000D]/5 rounded-2xl p-5 md:p-6 flex items-center gap-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:border-[#04000D]/10 transition-all">
      <div className={`p-3.5 rounded-xl ${iconBg} ${iconColor} shrink-0`}>
        <IconComp className="size-6" />
      </div>
      <div className="flex flex-col">
        <p className="text-[9px] font-mono font-bold tracking-wider text-on-surface-variant/70 uppercase">{label}</p>
        <p className="text-2xl md:text-3xl font-extrabold text-on-surface leading-none mt-1 font-sans">{value}</p>
      </div>
    </div>
  );
}

// ── Role-specific Async Section Components ──

async function KetuaStats() {
  const overview = await getDashboardOverview(YEAR_ID);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      <StatBlock
        label="TOTAL PENGGUNA"
        value={String(overview.totalMembers || 21)}
        icon={UsersIcon}
        iconBg="bg-slate-100"
        iconColor="text-slate-600"
      />
      <StatBlock
        label="PENDING"
        value="7"
        icon={ClockIcon}
        iconBg="bg-amber-50"
        iconColor="text-amber-500"
      />
      <StatBlock
        label="TERVERIFIKASI"
        value="1"
        icon={CheckCircleIcon}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-500"
      />
      <StatBlock
        label="DITOLAK"
        value="1"
        icon={AlertTriangleIcon}
        iconBg="bg-pink-50"
        iconColor="text-pink-500"
      />
    </div>
  );
}

async function OngoingMeetingsSection() {
  const meetings = await getMeetings();
  const now = new Date();

  const ongoing = meetings.filter(
    (m) => !m.endedAt && m.startedAt && new Date(m.startedAt) <= now
  );
  const upcoming = meetings
    .filter((m) => !m.endedAt && m.startedAt && new Date(m.startedAt) > now)
    .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())
    .slice(0, 3);
  const completed = meetings
    .filter((m) => m.endedAt)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, 3);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const timeStr = date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WITA";
    const dateStrFormatted = date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    return `${dateStrFormatted}, ${timeStr}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle icon={Calendar} title="Monitoring Rapat Panitia" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom 1: Sedang Berlangsung */}
        <div className="flex flex-col gap-3.5 bg-surface-container-low/40 p-4 border border-outline-variant/30 rounded-2xl h-full">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
            <h3 className="text-xs font-mono font-bold tracking-wider text-on-surface uppercase flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Sedang Berjalan
            </h3>
            <Badge variant="success" className="text-[9px] font-mono px-1.5 py-0">{ongoing.length} Rapat</Badge>
          </div>
          
          {ongoing.length === 0 ? (
            <div className="bg-white border border-outline-variant/40 rounded-xl p-5 text-center min-h-[140px] flex items-center justify-center">
              <p className="text-xs font-mono text-on-surface-variant leading-relaxed">Tidak ada rapat yang sedang berlangsung.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {ongoing.map((m) => (
                <Link href={`/dashboard/meetings/${m.id}`} key={m.id} className="block group">
                  <div className="bg-white border border-emerald-200 hover:border-emerald-500 rounded-xl p-3.5 flex flex-col gap-2.5 hover:shadow-xs transition-all relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                    <div className="pl-1.5 min-w-0">
                      <p className="text-xs font-mono text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5 w-fit uppercase mb-1.5">
                        Live Now
                      </p>
                      <p className="text-sm font-bold text-on-surface truncate group-hover:text-accent-magenta transition-colors">
                        {m.title}
                      </p>
                      <p className="text-[11px] text-on-surface-variant font-mono mt-1 flex items-center gap-1.5">
                        <Clock className="size-3 text-emerald-600 shrink-0" />
                        <span>{formatDate(m.startedAt)}</span>
                      </p>
                      {m.location && (
                        <p className="text-[10px] text-on-surface-variant font-sans mt-0.5 truncate">
                          📍 {m.location}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Kolom 2: Rapat Terjadwal */}
        <div className="flex flex-col gap-3.5 bg-surface-container-low/40 p-4 border border-outline-variant/30 rounded-2xl h-full">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
            <h3 className="text-xs font-mono font-bold tracking-wider text-on-surface uppercase flex items-center gap-1.5">
              <Calendar className="size-3.5 text-blue-500 shrink-0" />
              Rapat Terjadwal
            </h3>
            <Badge variant="info" className="text-[9px] font-mono px-1.5 py-0">{upcoming.length} Rapat</Badge>
          </div>
          
          {upcoming.length === 0 ? (
            <div className="bg-white border border-outline-variant/40 rounded-xl p-5 text-center min-h-[140px] flex items-center justify-center">
              <p className="text-xs font-mono text-on-surface-variant leading-relaxed">Tidak ada rapat terjadwal mendatang.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {upcoming.map((m) => (
                <Link href={`/dashboard/meetings/${m.id}`} key={m.id} className="block group">
                  <div className="bg-white border border-blue-200 hover:border-blue-500 rounded-xl p-3.5 flex flex-col gap-2.5 hover:shadow-xs transition-all relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                    <div className="pl-1.5 min-w-0">
                      <p className="text-xs font-mono text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5 w-fit uppercase mb-1.5">
                        {m.meetingType === "adhoc" ? "Kondisional" : "Terjadwal"}
                      </p>
                      <p className="text-sm font-bold text-on-surface truncate group-hover:text-accent-magenta transition-colors">
                        {m.title}
                      </p>
                      <p className="text-[11px] text-on-surface-variant font-mono mt-1 flex items-center gap-1.5">
                        <Clock className="size-3 text-blue-500 shrink-0" />
                        <span>{formatDate(m.startedAt)}</span>
                      </p>
                      {m.location && (
                        <p className="text-[10px] text-on-surface-variant font-sans mt-0.5 truncate">
                          📍 {m.location}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Kolom 3: Rapat Selesai */}
        <div className="flex flex-col gap-3.5 bg-surface-container-low/40 p-4 border border-outline-variant/30 rounded-2xl h-full">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
            <h3 className="text-xs font-mono font-bold tracking-wider text-on-surface uppercase flex items-center gap-1.5">
              <CheckCircle className="size-3.5 text-slate-500 shrink-0" />
              Selesai
            </h3>
            <Badge variant="secondary" className="text-[9px] font-mono px-1.5 py-0">{completed.length} Rapat</Badge>
          </div>
          
          {completed.length === 0 ? (
            <div className="bg-white border border-outline-variant/40 rounded-xl p-5 text-center min-h-[140px] flex items-center justify-center">
              <p className="text-xs font-mono text-on-surface-variant leading-relaxed">Belum ada rapat yang selesai.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {completed.map((m) => (
                <Link href={`/dashboard/meetings/${m.id}`} key={m.id} className="block group">
                  <div className="bg-white border border-slate-200 hover:border-slate-400 rounded-xl p-3.5 flex flex-col gap-2.5 hover:shadow-xs transition-all relative overflow-hidden opacity-80 hover:opacity-100">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-400" />
                    <div className="pl-1.5 min-w-0">
                      <p className="text-[11px] text-on-surface font-bold truncate group-hover:text-accent-magenta transition-colors">
                        {m.title}
                      </p>
                      <p className="text-[10px] text-on-surface-variant font-mono mt-1 flex items-center gap-1.5">
                        <Clock className="size-3 text-slate-400 shrink-0" />
                        <span>Selesai: {formatDate(m.startedAt)}</span>
                      </p>
                      {m.notesStatus === "published" && (
                        <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-1.5 py-0 w-fit block mt-1">
                          Notulensi Ada
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
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
  if (!divisionId) return null;
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
  if (!divisionId) return null;
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

  const currentWeek = "Agustus W1";
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
              const isCurrentWeek = week === currentWeek;
              
              let colorClass = "bg-slate-200 border-slate-300 text-slate-500";
              let label = "Belum";
              let pulseClass = "";

              if (status === "APPROVED") {
                colorClass = "bg-emerald-500 border-emerald-600 text-white shadow-sm shadow-emerald-500/20";
                label = "Approved";
                if (isCurrentWeek) {
                  colorClass += " ring-4 ring-emerald-500/30";
                }
              } else if (status === "PENDING") {
                colorClass = "bg-indigo-500 border-indigo-600 text-white shadow-sm shadow-indigo-500/20";
                label = "Pending";
                if (isCurrentWeek) {
                  colorClass += " ring-4 ring-indigo-500/30";
                  pulseClass = "animate-pulse";
                }
              } else if (status === "NEED_FIX") {
                colorClass = "bg-rose-500 border-rose-600 text-white shadow-sm shadow-rose-500/20";
                label = "Revisi";
                if (isCurrentWeek) {
                  colorClass += " ring-4 ring-rose-500/30";
                  pulseClass = "animate-pulse";
                }
              } else {
                // UNSUBMITTED
                if (isCurrentWeek) {
                  colorClass = "bg-amber-500 border-amber-600 text-white shadow-sm ring-4 ring-amber-500/30";
                  pulseClass = "animate-pulse";
                  label = "Belum (Aktif)";
                }
              }

              return (
                <div key={week} className="flex flex-col items-center gap-1.5 relative z-10 flex-1">
                  <div className={`size-8 rounded-full border-2 flex items-center justify-center text-[10px] font-black font-mono transition-all duration-300 ${colorClass} ${pulseClass}`}>
                    W{idx + 1}
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-tight text-center ${isCurrentWeek ? "text-accent-magenta font-black" : "text-on-surface-variant/70"}`}>
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

