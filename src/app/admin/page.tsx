import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Building2, Shield, Users, Calendar, ArrowUpRight, Cpu, RefreshCw } from "lucide-react";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

export default async function AdminOverviewPage() {
  const supabase = createAdminClient();

  // Fetch live statistics
  const [divisionsCount, rolesCount, assignmentsCount, yearsCount] = await Promise.all([
    supabase
      .from("divisions")
      .select("id", { count: "exact", head: true })
      .eq("committee_year_id", YEAR_ID),
    supabase
      .from("roles")
      .select("id", { count: "exact", head: true })
      .eq("committee_year_id", YEAR_ID),
    supabase
      .from("committee_assignments")
      .select("id", { count: "exact", head: true })
      .eq("committee_year_id", YEAR_ID)
      .eq("is_active", true),
    supabase
      .from("committee_years")
      .select("id", { count: "exact", head: true }),
  ]);

  const stats = [
    {
      label: "TOTAL DIVISI",
      count: divisionsCount.count ?? 0,
      description: "Terdaftar tahun ini",
      icon: Building2,
      href: "/admin/divisions",
    },
    {
      label: "ROLE & JABATAN",
      count: rolesCount.count ?? 0,
      description: "Tingkatan kewenangan",
      icon: Shield,
      href: "/admin/roles",
    },
    {
      label: "PERSONEL AKTIF",
      count: assignmentsCount.count ?? 0,
      description: "Terisi dalam panitia",
      icon: Users,
      href: "/admin/assignments",
    },
    {
      label: "TAHUN KEPANITIAAN",
      count: yearsCount.count ?? 0,
      description: "Histori tersimpan",
      icon: Calendar,
      href: "/admin/years",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Live Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} className="group">
              <div className="bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-5 transition-all duration-200 hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] hover:border-[#04000D]/15 hover:-translate-y-0.5 flex flex-col justify-between h-full relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-[#04000D] text-[#DCEEB1] flex items-center justify-center shrink-0 group-hover:bg-accent-magenta group-hover:text-white transition-colors duration-200">
                    <Icon className="size-5" />
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-[#FDF8FA] text-on-surface-variant">
                    <ArrowUpRight className="size-4 text-accent-magenta" />
                  </div>
                </div>

                <div className="mt-4">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/60">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-extrabold text-on-surface my-1 leading-none group-hover:text-accent-magenta transition-colors">
                    {stat.count}
                  </p>
                  <p className="text-xs text-on-surface-variant/70 font-normal mt-1">{stat.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-6 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#DCEEB1]/40 text-[#1D1B1D] border border-[#DCEEB1]/60 flex items-center justify-center shrink-0">
              <Cpu className="size-5 text-emerald-800" />
            </div>
            <h3 className="text-base font-bold text-on-surface">Dynamic Structure</h3>
          </div>
          <p className="text-xs text-on-surface-variant/80 leading-relaxed font-normal">
            Divisi dan role disimpan secara dinamis di dalam database — bukan melalui hardcode di program. Tahun depan, cukup buat tahun kepanitiaan baru dan langsung pasang personel baru.
          </p>
        </div>

        <div className="bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-6 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FF3D8B]/10 text-accent-magenta border border-[#FF3D8B]/20 flex items-center justify-center shrink-0">
              <RefreshCw className="size-5" />
            </div>
            <h3 className="text-base font-bold text-on-surface">Reset Tahunan</h3>
          </div>
          <p className="text-xs text-on-surface-variant/80 leading-relaxed font-normal">
            Buka menu <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#FDF8FA] text-on-surface border border-[#04000D]/10 rounded-md">Tahun Kepanitiaan</span> &rarr; buat tahun baru &rarr; salin struktur data dari tahun sebelumnya secara otomatis tanpa perlu mengubah baris kode program.
          </p>
        </div>
      </div>
    </div>
  );
}
