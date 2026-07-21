import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      color: "text-primary bg-primary/10 border-primary/20",
    },
    {
      label: "ROLE & JABATAN",
      count: rolesCount.count ?? 0,
      description: "Tingkatan kewenangan",
      icon: Shield,
      href: "/admin/roles",
      color: "text-accent-magenta bg-accent-magenta/10 border-accent-magenta/20",
    },
    {
      label: "PERSONEL AKTIF",
      count: assignmentsCount.count ?? 0,
      description: "Terisi dalam panitia",
      icon: Users,
      href: "/admin/assignments",
      color: "text-block-blue bg-block-blue/10 border-block-blue/20",
    },
    {
      label: "TAHUN KEPANITIAAN",
      count: yearsCount.count ?? 0,
      description: "Histori tersimpan",
      icon: Calendar,
      href: "/admin/years",
      color: "text-on-surface-variant bg-surface-container border-outline-variant/30",
    },
  ];

  return (
    <div className="flex flex-col gap-8 mt-2">
      {/* Live Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} className="group">
              <Card className="bg-white border border-outline-variant/60 rounded-2xl p-5 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-primary/20 hover:-translate-y-0.5 flex flex-col justify-between h-full relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${stat.color}`}>
                    <Icon className="size-5" />
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-surface-container text-on-surface-variant">
                    <ArrowUpRight className="size-4" />
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">{stat.label}</p>
                  <p className="text-3xl font-black text-on-surface my-1 leading-none group-hover:text-primary transition-colors">
                    {stat.count}
                  </p>
                  <p className="text-xs text-on-surface-variant/70 font-semibold mt-1">{stat.description}</p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white border border-outline-variant/60 rounded-2xl p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-all">
          <CardHeader className="p-0 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-block-mint/20 text-on-surface border border-block-mint/30 flex items-center justify-center">
                <Cpu className="size-5" />
              </div>
              <CardTitle className="text-base font-bold text-on-surface">Dynamic Structure</CardTitle>
            </div>
            <CardDescription className="text-sm text-on-surface-variant font-sans leading-relaxed">
              Divisi dan role disimpan secara dinamis di dalam database — bukan melalui hardcode di program. Tahun depan, cukup buat tahun kepanitiaan baru dan langsung pasang personel baru.
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="bg-white border border-outline-variant/60 rounded-2xl p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-all">
          <CardHeader className="p-0 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-block-lilac/20 text-on-surface border border-block-lilac/30 flex items-center justify-center">
                <RefreshCw className="size-5" />
              </div>
              <CardTitle className="text-base font-bold text-on-surface">Reset Tahunan</CardTitle>
            </div>
            <CardDescription className="text-sm text-on-surface-variant font-sans leading-relaxed">
              Buka menu <Badge variant="outline" className="text-[10px] font-mono px-2 py-0.5 bg-surface-container text-on-surface-variant border-outline-variant/50 inline-flex items-center gap-1 font-bold">Tahun Kepanitiaan</Badge> &rarr; buat tahun baru &rarr; salin struktur data dari tahun sebelumnya secara otomatis tanpa perlu mengubah baris kode program.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
