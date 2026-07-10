import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDashboardOverview, getDivisionsWithProgress } from "@/lib/data/dashboard";
import { getDivisionKpiSummaries } from "@/lib/data/kpi";
import { getPersonalDashboard } from "@/lib/data/personal-dashboard";
import { getProfile, type ProfileData } from "@/lib/data/profile";
import { getFinanceOverview } from "@/lib/data/finance";
import { getLetters, getStatusDisplay } from "@/lib/data/letters";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import {
  Target,
  CheckCircle,
  FileText,
  Calendar,
  Users,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

const ROLE_MAP: Record<string, { slug: string; level: number }> = {
  "PIC / Penanggung Jawab": { slug: "pic", level: 100 },
  "Ketua Panitia": { slug: "ketua-panitia", level: 90 },
  "Wakil Ketua": { slug: "wakil-ketua", level: 80 },
  "Sekretaris I": { slug: "sekretaris", level: 75 },
  "Sekretaris II": { slug: "sekretaris", level: 75 },
  "Bendahara": { slug: "bendahara", level: 70 },
  "Koordinator Divisi": { slug: "koordinator", level: 60 },
  "Wakil Koordinator": { slug: "wakil-koordinator", level: 55 },
  "PIC / Penanggung Jawab Subdivisi": { slug: "pic-sub", level: 53 },
  "Anggota": { slug: "anggota", level: 50 },
};

export default async function DashboardPage() {
  const [personal, profile] = await Promise.all([
    getPersonalDashboard(),
    getProfile(),
  ]);

  if (!personal.userId || !personal.assignment) {
    return <GlobalView />;
  }

  const roleName = personal.assignment.role;
  const roleInfo = ROLE_MAP[roleName] ?? { slug: "anggota", level: 50 };
  const level = roleInfo.level;
  const slug = roleInfo.slug;

  if (level >= 90) return <KetuaView personal={personal} profile={profile} />;
  if (level >= 80) return <WakilKetuaView personal={personal} profile={profile} />;
  if (slug === "sekretaris") return <SekretarisView personal={personal} profile={profile} />;
  if (slug === "bendahara") return <BendaharaView personal={personal} profile={profile} />;
  if (slug === "koordinator") return <KoordinatorView personal={personal} profile={profile} />;

  return <AnggotaView personal={personal} profile={profile} />;
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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6 transition-all hover:border-outline-variant">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">DIVISI AKTIF</p>
          <p className="text-4xl font-black text-on-surface my-2 leading-none">{divisions.length}</p>
          <p className="text-xs text-on-surface-variant font-mono">Divisi berjalan</p>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6 transition-all hover:border-outline-variant">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">ANGGOTA</p>
          <p className="text-4xl font-black text-on-surface my-2 leading-none">{overview.totalMembers}</p>
          <p className="text-xs text-on-surface-variant font-mono">Total panitia</p>
        </div>

        <Link href="/dashboard/kpi" className="block group">
          <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6 transition-all group-hover:border-outline-variant h-full">
            <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">TOTAL KPI</p>
            <p className="text-4xl font-black text-on-surface my-2 leading-none">{kpiCount}</p>
            <p className="text-xs text-on-surface-variant font-mono">({doneTasks}/{totalTasks} tasks selesai)</p>
          </div>
        </Link>

        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6 transition-all hover:border-outline-variant">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">TOTAL RAPAT</p>
          <p className="text-4xl font-black text-on-surface my-2 leading-none">{overview.totalMeetings}</p>
          <p className="text-xs text-on-surface-variant font-mono">Pertemuan diadakan</p>
        </div>
      </div>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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

interface ViewProps {
  personal: Awaited<ReturnType<typeof getPersonalDashboard>>;
  profile: ProfileData | null;
}

async function AnggotaView({ personal, profile }: ViewProps) {
  const totalTasks = personal.tasks.length;
  const doneTasks = personal.tasks.filter((t) => t.status === "done").length;
  const pendingRsvp = personal.meetings.filter((m) => m.rsvpStatus === "pending").length;

  return (
    <div className="flex flex-col gap-10">
      <div>
        <p className="text-accent-magenta font-mono text-xs font-bold tracking-widest uppercase mb-1">
          DASHBOARD {personal.assignment!.division.toUpperCase()}
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
          Halo, {profile?.fullName ? profile.fullName.split(" ")[0] : "Panitia"}!
        </h1>
        <p className="mt-2 text-base text-on-surface-variant">
          Pantau task dan undangan rapat Anda di sini.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">TOTAL TASK</p>
          <p className="text-4xl font-black text-on-surface my-2 leading-none">{totalTasks}</p>
          <p className="text-xs text-on-surface-variant font-mono">Tugas Anda</p>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">TASK SELESAI</p>
          <p className="text-4xl font-black text-on-surface my-2 leading-none">{doneTasks} / {totalTasks}</p>
          <p className="text-xs text-on-surface-variant font-mono">Pekerjaan rampung</p>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">RAPAT BARU</p>
          <p className="text-4xl font-black text-on-surface my-2 leading-none">{pendingRsvp}</p>
          <p className="text-xs text-on-surface-variant font-mono">Belum direspon</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                        {mtg.meetingType === "adhoc" ? "Kondisional" : "Terjadwal"}
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

async function KoordinatorView({ personal, profile }: ViewProps) {
  const totalTasks = personal.tasks.length;
  const doneTasks = personal.tasks.filter((t) => t.status === "done").length;
  const divisionId = personal.assignment!.divisionId;

  const supabase = createAdminClient();
  const { data: teamMembers } = (await supabase
    .from("committee_assignments")
    .select(`
      id,
      user:profiles(full_name, nim),
      role:roles(name, slug)
    `)
    .eq("committee_year_id", YEAR_ID)
    .eq("division_id", divisionId)
    .eq("is_active", true)) as unknown as {
      data: { id: string; user: { full_name: string; nim: string } | null; role: { name: string; slug: string } | null }[] | null;
    };

  return (
    <div className="flex flex-col gap-10">
      <div>
        <p className="text-accent-magenta font-mono text-xs font-bold tracking-widest uppercase mb-1">
          KOORDINATOR {personal.assignment!.division.toUpperCase()}
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
          Halo, {profile?.fullName ? profile.fullName.split(" ")[0] : "Koordinator"}!
        </h1>
        <p className="mt-2 text-base text-on-surface-variant">
          Kelola KPI divisi dan pantau progres anggota tim.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">KPI DIVISI</p>
          <p className="text-4xl font-black text-on-surface my-2 leading-none">{personal.kpis.length}</p>
          <p className="text-xs text-on-surface-variant font-mono">Target ditetapkan</p>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">TOTAL TASK</p>
          <p className="text-4xl font-black text-on-surface my-2 leading-none">{totalTasks}</p>
          <p className="text-xs text-on-surface-variant font-mono">Tugas divisi</p>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">TASK SELESAI</p>
          <p className="text-4xl font-black text-on-surface my-2 leading-none">{doneTasks} / {totalTasks}</p>
          <p className="text-xs text-on-surface-variant font-mono">Pekerjaan rampung</p>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">ANGGOTA TIM</p>
          <p className="text-4xl font-black text-on-surface my-2 leading-none">{teamMembers?.length ?? 0}</p>
          <p className="text-xs text-on-surface-variant font-mono">Total personil</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
              <div key={kpi.id} className="bg-white border border-outline-variant/60 rounded-2xl p-5 hover:border-primary/20 transition-all">
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
                  <h3 className="font-sans text-base font-bold text-on-surface mb-1">{kpi.title}</h3>
                  <p className="text-xs text-on-surface-variant font-sans line-clamp-2">{kpi.target}</p>
                </div>
                <div className="mt-4">
                  <div className="h-1.5 w-full rounded-full bg-surface-container overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${kpi.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Users className="size-5 text-error" />
            <h2 className="text-xl font-bold tracking-tight text-on-surface">Anggota Tim</h2>
          </div>

          <div className="flex flex-col gap-2">
            {(!teamMembers || teamMembers.length === 0) && (
              <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 text-center">
                <p className="text-sm font-mono text-on-surface-variant">Belum ada anggota.</p>
              </div>
            )}
            {teamMembers?.map((m) => (
              <div key={m.id} className="bg-white border border-outline-variant/60 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate">{m.user?.full_name}</p>
                  <p className="text-xs text-on-surface-variant font-mono mt-0.5">{m.user?.nim}</p>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                  {m.role?.name}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

async function BendaharaView({ profile }: ViewProps) {
  const finance = await getFinanceOverview();

  const supabase = createAdminClient();
  const { data: recentTx } = await supabase
    .from("budget_transactions")
    .select("id, type, amount, description, transaction_date")
    .order("transaction_date", { ascending: false })
    .limit(5);

  const { data: pendingReqs } = (await supabase
    .from("budget_requests")
    .select("id, amount, purpose, status, created_at, division:divisions(name)")
    .eq("committee_year_id", YEAR_ID)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(5)) as unknown as {
      data: { id: string; amount: number; purpose: string; status: string; created_at: string; division: { name: string } | null }[] | null;
    };

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <p className="text-accent-magenta font-mono text-xs font-bold tracking-widest uppercase mb-1">
          BENDAHARA
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
          Halo, {profile?.fullName ? profile.fullName.split(" ")[0] : "Bendahara"}!
        </h1>
        <p className="mt-2 text-base text-on-surface-variant">
          Pantau anggaran, transaksi, dan permohonan dana.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">TOTAL ANGGARAN</p>
          <p className="text-3xl font-black text-on-surface my-2 leading-none truncate">{formatRupiah(finance.total_budget)}</p>
          <p className="text-xs text-on-surface-variant font-mono">Keseluruhan dana</p>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">TERPAKAI</p>
          <p className="text-3xl font-black text-on-surface my-2 leading-none truncate">{formatRupiah(finance.total_used)}</p>
          <p className="text-xs text-on-surface-variant font-mono">Total pengeluaran</p>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">SISA</p>
          <p className="text-3xl font-black text-on-surface my-2 leading-none truncate">{formatRupiah(finance.total_remaining)}</p>
          <p className="text-xs text-on-surface-variant font-mono">Dana tersedia</p>
        </div>
        <Link href="/dashboard/finance?tab=requests" className="block group">
          <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6 transition-all group-hover:border-outline-variant h-full">
            <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">REQUESTS PENDING</p>
            <p className="text-4xl font-black text-on-surface my-2 leading-none">{finance.pending_requests}</p>
            <p className="text-xs text-on-surface-variant font-mono">Menunggu persetujuan</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="size-5 text-error" />
              <h2 className="text-xl font-bold tracking-tight text-on-surface">Transaksi Terbaru</h2>
            </div>
            <Link href="/dashboard/finance" className="text-xs font-mono text-accent-magenta hover:underline uppercase tracking-wider font-bold">
              Semua →
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            {(!recentTx || recentTx.length === 0) && (
              <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 text-center">
                <p className="text-sm font-mono text-on-surface-variant">Belum ada transaksi.</p>
              </div>
            )}
            {recentTx?.map((tx) => (
              <div key={tx.id} className="bg-white border border-outline-variant/60 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${tx.type === "income" ? "bg-accent-green/10" : "bg-error-container"}`}>
                    {tx.type === "income"
                      ? <ArrowUpRight className="size-4 text-accent-green" />
                      : <ArrowDownRight className="size-4 text-error" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-on-surface truncate">{tx.description}</p>
                    <p className="text-xs text-on-surface-variant font-mono">
                      {new Date(tx.transaction_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-bold font-mono shrink-0 ${tx.type === "income" ? "text-accent-green" : "text-error"}`}>
                  {tx.type === "income" ? "+" : "-"}{formatRupiah(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="size-5 text-error" />
              <h2 className="text-xl font-bold tracking-tight text-on-surface">Request Pending</h2>
            </div>
            <Link href="/dashboard/finance" className="text-xs font-mono text-accent-magenta hover:underline uppercase tracking-wider font-bold">
              Semua →
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            {(!pendingReqs || pendingReqs.length === 0) && (
              <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 text-center">
                <p className="text-sm font-mono text-on-surface-variant">Tidak ada request pending.</p>
              </div>
            )}
            {pendingReqs?.map((r) => (
              <div key={r.id} className="bg-white border border-outline-variant/60 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate">{r.purpose}</p>
                  <p className="text-xs text-on-surface-variant font-mono mt-0.5">{r.division?.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold font-mono text-on-surface">{formatRupiah(r.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

async function SekretarisView({ profile }: ViewProps) {
  const allLetters = await getLetters();

  const pendingLetters = allLetters.filter((l) => l.status === "requested");
  const approvedLetters = allLetters.filter((l) => l.status === "approved");
  const sentLetters = allLetters.filter((l) => l.status === "sent");

  return (
    <div className="flex flex-col gap-10">
      <div>
        <p className="text-accent-magenta font-mono text-xs font-bold tracking-widest uppercase mb-1">
          SEKRETARIS
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
          Halo, {profile?.fullName ? profile.fullName.split(" ")[0] : "Sekretaris"}!
        </h1>
        <p className="mt-2 text-base text-on-surface-variant">
          Kelola surat-menyurat dan approval dokumen.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">TOTAL SURAT</p>
          <p className="text-4xl font-black text-on-surface my-2 leading-none">{allLetters.length}</p>
          <p className="text-xs text-on-surface-variant font-mono">Semua surat</p>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">PENDING</p>
          <p className="text-4xl font-black text-on-surface my-2 leading-none">{pendingLetters.length}</p>
          <p className="text-xs text-on-surface-variant font-mono">Menunggu review</p>
        </div>
        <Link href="/dashboard/letters?status=approved" className="block group">
          <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6 transition-all group-hover:border-outline-variant h-full">
            <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">DISETUJUI</p>
            <p className="text-4xl font-black text-on-surface my-2 leading-none">{approvedLetters.length}</p>
            <p className="text-xs text-on-surface-variant font-mono">Siap dikirim</p>
          </div>
        </Link>
        <Link href="/dashboard/letters?status=sent" className="block group">
          <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6 transition-all group-hover:border-outline-variant h-full">
            <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">TERKIRIM</p>
            <p className="text-4xl font-black text-on-surface my-2 leading-none">{sentLetters.length}</p>
            <p className="text-xs text-on-surface-variant font-mono">Surat dikirim</p>
          </div>
        </Link>
      </div>

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
          {allLetters.length === 0 && (
            <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 text-center">
              <p className="text-sm font-mono text-on-surface-variant">Belum ada surat.</p>
            </div>
          )}
          {allLetters.slice(0, 10).map((letter) => {
            const status = getStatusDisplay(letter.status);
            return (
              <Link href={`/dashboard/letters/${letter.id}`} key={letter.id} className="block">
                <div className="bg-white border border-outline-variant/60 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-primary/20 transition-all">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-on-surface truncate">{letter.subject}</p>
                    <p className="text-xs text-on-surface-variant font-mono mt-0.5">
                      {letter.division} &middot; {letter.requester} &middot;{" "}
                      {new Date(letter.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric", month: "short", year: "numeric",
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
    </div>
  );
}

async function WakilKetuaView({ profile }: ViewProps) {
  const [kpiSummaries, divisions] = await Promise.all([
    getDivisionKpiSummaries(),
    getDivisionsWithProgress(YEAR_ID),
  ]);

  const totalTasks = kpiSummaries.reduce((acc, s) => acc + s.totalTasks, 0);
  const doneTasks = kpiSummaries.reduce((acc, s) => acc + s.doneTasks, 0);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <p className="text-accent-magenta font-mono text-xs font-bold tracking-widest uppercase mb-1">
          WAKIL KETUA
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
          Halo, {profile?.fullName ? profile.fullName.split(" ")[0] : "Wakil Ketua"}!
        </h1>
        <p className="mt-2 text-base text-on-surface-variant">
          Monitoring cross-division dan progres kepanitiaan.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">DIVISI AKTIF</p>
          <p className="text-4xl font-black text-on-surface my-2 leading-none">{divisions.length}</p>
          <p className="text-xs text-on-surface-variant font-mono">Divisi berjalan</p>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">TOTAL KPI</p>
          <p className="text-4xl font-black text-on-surface my-2 leading-none">{kpiSummaries.reduce((a, s) => a + s.totalKpis, 0)}</p>
          <p className="text-xs text-on-surface-variant font-mono">Semua divisi</p>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">TOTAL TASK</p>
          <p className="text-4xl font-black text-on-surface my-2 leading-none">{totalTasks}</p>
          <p className="text-xs text-on-surface-variant font-mono">Task keseluruhan</p>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">TASK SELESAI</p>
          <p className="text-4xl font-black text-on-surface my-2 leading-none">{doneTasks} / {totalTasks}</p>
          <p className="text-xs text-on-surface-variant font-mono">Progress global</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-error" />
            <h2 className="text-xl font-bold tracking-tight text-on-surface">Progres Semua Divisi</h2>
          </div>
          <Link href="/dashboard/kpi" className="text-xs font-mono text-accent-magenta hover:underline uppercase tracking-wider font-bold">
            Lihat detail KPI →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
                      <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

async function KetuaView({ personal, profile }: ViewProps) {
  const totalTasks = personal.tasks.length;
  const doneTasks = personal.tasks.filter((t) => t.status === "done").length;

  const [overview, kpiSummaries] = await Promise.all([
    getDashboardOverview(YEAR_ID),
    getDivisionKpiSummaries(),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <p className="text-accent-magenta font-mono text-xs font-bold tracking-widest uppercase mb-1">
          DASHBOARD EKSEKUTIF
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
          Halo, {profile?.fullName ? profile.fullName.split(" ")[0] : "Pimpinan"}!
        </h1>
        <p className="mt-2 text-base text-on-surface-variant">
          Overview lengkap seluruh kepanitiaan I-FEST 2026.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">ANGGOTA</p>
          <p className="text-4xl font-black text-on-surface my-2 leading-none">{overview.totalMembers}</p>
          <p className="text-xs text-on-surface-variant font-mono">Total panitia</p>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">KPI DIVISI</p>
          <p className="text-4xl font-black text-on-surface my-2 leading-none">{personal.kpis.length}</p>
          <p className="text-xs text-on-surface-variant font-mono">Target ditetapkan</p>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">TASK SELESAI</p>
          <p className="text-4xl font-black text-on-surface my-2 leading-none">{doneTasks} / {totalTasks}</p>
          <p className="text-xs text-on-surface-variant font-mono">Pekerjaan rampung</p>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6">
          <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">TOTAL RAPAT</p>
          <p className="text-4xl font-black text-on-surface my-2 leading-none">{overview.totalMeetings}</p>
          <p className="text-xs text-on-surface-variant font-mono">Pertemuan diadakan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-5 text-error" />
              <h2 className="text-xl font-bold tracking-tight text-on-surface">Progres Divisi</h2>
            </div>
            <Link href="/dashboard/kpi" className="text-xs font-mono text-accent-magenta hover:underline uppercase tracking-wider font-bold">
              Detail →
            </Link>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {kpiSummaries.map((s) => {
              const progress = s.totalTasks > 0 ? Math.round((s.doneTasks / s.totalTasks) * 100) : 0;
              return (
                <Link href="/dashboard/kpi" key={s.divisionId} className="block group">
                  <div className="bg-white border border-outline-variant/60 rounded-2xl p-5 flex flex-col justify-between h-full hover:border-accent-magenta/50 transition-all">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-sans text-base font-bold text-on-surface group-hover:text-accent-magenta transition-colors leading-tight">
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
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant mb-1">
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

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="size-5 text-error" />
                <h2 className="text-xl font-bold tracking-tight text-on-surface">Tugas</h2>
              </div>
              <Link href="/dashboard/kpi" className="text-xs font-mono text-accent-magenta hover:underline uppercase tracking-wider font-bold">
                Detail →
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              {personal.tasks.slice(0, 4).map((task) => (
                <div key={task.id} className="bg-white border border-outline-variant/60 rounded-xl p-3 flex items-center justify-between gap-3">
                  <p className={`text-xs font-bold text-on-surface truncate ${task.status === "done" ? "line-through text-on-surface-variant/70" : ""}`}>
                    {task.title}
                  </p>
                  <Badge variant={task.status === "done" ? "success" : "warning"} className="text-[8px] font-mono px-1.5 py-0 shrink-0">
                    {task.status === "done" ? "Done" : "Open"}
                  </Badge>
                </div>
              ))}
              {personal.tasks.length === 0 && (
                <p className="text-xs font-mono text-on-surface-variant text-center py-4">Belum ada task.</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="size-5 text-error" />
                <h2 className="text-xl font-bold tracking-tight text-on-surface">Rapat</h2>
              </div>
              <Link href="/dashboard/meetings" className="text-xs font-mono text-accent-magenta hover:underline uppercase tracking-wider font-bold">
                Semua →
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              {personal.meetings.slice(0, 4).map((mtg) => (
                <div key={mtg.id} className="bg-white border border-outline-variant/60 rounded-xl p-3">
                  <p className="text-xs font-bold text-on-surface truncate">{mtg.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[10px] text-on-surface-variant font-mono">
                      {new Date(mtg.startedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-[8px] font-mono px-1.5 py-0 ${
                        mtg.rsvpStatus === "accepted" ? "bg-accent-green/10 text-accent-green border-accent-green/30" :
                        mtg.rsvpStatus === "declined" ? "bg-error-container text-error border-error/30" : "bg-accent-lilac/10 text-accent-lilac border-accent-lilac/30"
                      }`}
                    >
                      {mtg.rsvpStatus === "accepted" ? "Hadir" : mtg.rsvpStatus === "declined" ? "Tidak" : "Pending"}
                    </Badge>
                  </div>
                </div>
              ))}
              {personal.meetings.length === 0 && (
                <p className="text-xs font-mono text-on-surface-variant text-center py-4">Belum ada rapat.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
