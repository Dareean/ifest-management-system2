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
      <Suspense fallback={<LettersSkeleton />}>
        <PersonalLetters assignmentId={assignmentId} />
      </Suspense>
    </div>
  );
}

function KoordinatorView({ assignmentId, divisionId, divisionName, greeting, profile }: { assignmentId: string; divisionId: string; divisionName: string; greeting: string; profile: any }) {
  return (
    <div className="flex flex-col gap-10">
      <HeaderSection title={`DIVISI ${divisionName.toUpperCase()}`} greeting={greeting} subtitle="Pantau task dan progres divisi Anda." />
      <Suspense fallback={<StatCardsSkeleton count={3} />}>
        <PersonalStats assignmentId={assignmentId} />
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
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-5 text-error" />
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Progres Divisi</h2>
        </div>
        <Link href="/dashboard/tasks" className="text-xs font-mono text-accent-magenta hover:underline uppercase tracking-wider font-bold">
          Lihat detail Tugas →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {divisions.map((s) => {
          const progress = s.totalTasks > 0 ? Math.round((s.doneTasks / s.totalTasks) * 100) : 0;
          return (
            <Link href="/dashboard/tasks" key={s.id} className="block group">
              <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 flex flex-col justify-between h-full hover:border-accent-magenta/50 transition-all">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-sans text-lg font-bold text-on-surface group-hover:text-accent-magenta transition-colors leading-tight">{s.name}</h3>
                  </div>
                  <p className="text-xs text-on-surface-variant font-mono">{s.doneTasks}/{s.totalTasks} tasks selesai</p>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant mb-1.5">
                    <span>Progress</span>
                    <span className="font-bold text-on-surface">{progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-container overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
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
