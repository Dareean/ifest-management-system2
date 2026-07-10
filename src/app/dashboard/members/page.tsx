import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserPlus } from "lucide-react";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;

  if (!userId) redirect("/login");

  const admin = createAdminClient();

  const { data: assignment } = await admin
    .from("committee_assignments")
    .select(`
      id,
      division_id,
      division:divisions(name, slug),
      role:roles(name, slug, level)
    `)
    .eq("committee_year_id", YEAR_ID)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const callerLevel = (assignment as any)?.role?.level ?? 0;

  if (!assignment || callerLevel < 55) {
    redirect("/dashboard");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const divisionId = (assignment as any).division_id;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const divisionName = (assignment as any).division?.name ?? "";

  const { data: members } = await admin
    .from("committee_assignments")
    .select(`
      id,
      user:profiles(full_name, nim),
      role:roles(name, slug, level)
    `)
    .eq("committee_year_id", YEAR_ID)
    .eq("division_id", divisionId)
    .eq("is_active", true)
    .order("role_id");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const memberList = (members ?? []) as any[];

  const canInvite = callerLevel >= 55;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-accent-magenta font-mono text-xs font-bold tracking-widest uppercase mb-1">
            DIVISI {divisionName.toUpperCase()}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Anggota</h1>
          <p className="mt-1 text-base text-on-surface-variant">
            {memberList.length} orang terdaftar
          </p>
        </div>
        {canInvite && (
          <Link href="/dashboard/members/invite">
            <Button variant="primary" className="cursor-pointer font-sans text-sm font-semibold gap-2">
              <UserPlus className="size-4" />
              Undang Anggota
            </Button>
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {memberList.length === 0 && (
          <div className="bg-white border border-outline-variant/60 rounded-2xl p-8 text-center">
            <Users className="size-8 text-on-surface-variant/40 mx-auto mb-3" />
            <p className="text-sm font-mono text-on-surface-variant">Belum ada anggota di divisi ini.</p>
          </div>
        )}
        {memberList.map((m) => (
          <div key={m.id} className="bg-white border border-outline-variant/60 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-10 rounded-full bg-block-lilac/30 flex items-center justify-center font-bold text-primary shrink-0 text-sm">
                {m.user?.full_name?.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-on-surface truncate">{m.user?.full_name}</p>
                <p className="text-xs text-on-surface-variant font-mono mt-0.5">{m.user?.nim}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono shrink-0">
              {m.role?.name}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
