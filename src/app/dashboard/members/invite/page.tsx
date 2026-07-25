import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { InviteForm } from "./form";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

export default async function InvitePage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;

  if (!userId) redirect("/login");

  const admin = createAdminClient();

  const { data: assignment } = await admin
    .from("committee_assignments")
    .select(`
      id,
      division:divisions!committee_assignments_division_id_fkey(name),
      role:roles(name, slug, level)
    `)
    .eq("committee_year_id", YEAR_ID)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const callerLevel = (assignment as any)?.role?.level ?? 0;

  if (!assignment || callerLevel < 55) {
    redirect("/dashboard/members");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const divisionName = (assignment as any).division?.name ?? "";

  // Fetch roles below the caller's level (for the dropdown)
  const { data: roles } = await admin
    .from("roles")
    .select("id, name, slug, level")
    .eq("committee_year_id", YEAR_ID)
    .lt("level", callerLevel)
    .order("level", { ascending: false });

  // BPH roles can assign to any division
  let divisions: { id: string; name: string; slug: string }[] | undefined;
  if (callerLevel >= 75) {
    const { data: allDivisions } = await admin
      .from("divisions")
      .select("id, name, slug")
      .eq("committee_year_id", YEAR_ID)
      .order("sort_order");
    divisions = allDivisions ?? undefined;
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto">
      <div>
        <p className="text-accent-magenta font-mono text-xs font-bold tracking-widest uppercase mb-1">
          {callerLevel >= 75 ? "BPH KEPANITIAAN" : `DIVISI ${divisionName.toUpperCase()}`}
        </p>
        <h1 className="text-3xl font-black tracking-tight text-on-surface font-sans">Undang Anggota</h1>
        <p className="mt-1 text-sm text-on-surface-variant font-medium">
          Anggota baru akan mendapatkan email sambutan yang berisi kredensial akun login.
        </p>
      </div>

      <InviteForm roles={roles ?? []} divisions={divisions} />
    </div>
  );
}
