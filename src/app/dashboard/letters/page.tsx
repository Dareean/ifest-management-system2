import { Button } from "@/components/ui/button";
import { Plus, Mail } from "lucide-react";
import Link from "next/link";
import { getLetters } from "@/lib/data/letters";
import { exportLettersCSV } from "@/lib/actions/export";
import { ExportButton } from "@/components/export-button";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LettersClient } from "./letters-client";
import { SECRETARY_SLUGS } from "@/lib/auth/authorize";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

// Trigger Turbopack rebuild
export default async function LettersPage(props: {
  searchParams?: Promise<{ priority?: string; division?: string }>;
}) {
  const sp = await props.searchParams;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) redirect("/login");

  const admin = createAdminClient();

  const { data: assignment } = await admin
    .from("committee_assignments")
    .select("id, role:roles(is_approver, level, slug)")
    .eq("committee_year_id", YEAR_ID)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  const roleSlug = (assignment as any)?.role?.slug ?? "";
  const isSecretary = SECRETARY_SLUGS.includes(roleSlug);
  const assignmentId = (assignment as any)?.id;

  const rawLetters = await getLetters(isSecretary ? undefined : assignmentId);

  // Apply filters (only for Sekretaris — status handled by client tabs)
  let letters = rawLetters;
  if (isSecretary && sp) {
    if (sp.priority) {
      letters = letters.filter((l) => l.priority === sp.priority);
    }
    if (sp.division) {
      letters = letters.filter((l) => l.divisionSlug === sp.division);
    }
  }

  // Fetch divisions list for filter (Sekretaris only)
  let divisions: { id: string; name: string; slug: string }[] = [];
  if (isSecretary) {
    const { data } = await admin
      .from("divisions")
      .select("id, name, slug")
      .order("name");
    divisions = data || [];
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-pink-500 font-mono text-[11px] font-extrabold tracking-widest uppercase mb-1">
            SISTEM SURAT
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 font-sans">
            Permohonan Surat
          </h1>
          <p className="mt-1 text-sm text-slate-400 font-sans">
            {isSecretary
              ? "Kelola dan pantau seluruh permohonan surat kepanitiaan."
              : "Ajukan dan pantau status permohonan surat Anda."}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 sm:self-end">
          <ExportButton label="Export CSV" filename="surat" fetchCsv={exportLettersCSV} />
          <Link href="/dashboard/letters/new">
            <Button size="sm" className="h-9 font-mono font-bold text-xs uppercase cursor-pointer bg-slate-900 text-white hover:bg-black rounded-2xl gap-1.5 px-4 shadow-xs">
              <Plus className="size-4" />
              Ajukan Surat
            </Button>
          </Link>
        </div>
      </div>

      {/* Main List & Client Section */}
      <div className="flex flex-col gap-4">
        <LettersClient initialLetters={letters} isApprover={isSecretary} divisions={divisions} />
      </div>
    </div>
  );
}

