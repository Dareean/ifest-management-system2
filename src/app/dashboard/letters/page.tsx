import { Button } from "@/components/ui/button";
import { Plus, Mail } from "lucide-react";
import Link from "next/link";
import { getLetters } from "@/lib/data/letters";
import { exportLettersCSV } from "@/lib/actions/export";
import { ExportButton } from "@/components/export-button";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FilterSection } from "./filter-section";
import { LettersClient } from "./letters-client";
import { SECRETARY_SLUGS } from "@/lib/auth/authorize";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

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
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-accent-magenta font-mono text-xs font-bold tracking-widest uppercase mb-1">
            Sistem Surat
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
            Permohonan Surat
          </h1>
          <p className="mt-2 text-base text-on-surface-variant">
            {isSecretary
              ? "Kelola dan pantau seluruh permohonan surat kepanitiaan."
              : "Ajukan dan pantau status permohonan surat Anda."}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 sm:self-end">
          <ExportButton label="Export CSV" filename="surat" fetchCsv={exportLettersCSV} />
          <Link href="/dashboard/letters/new">
            <Button className="cursor-pointer">
              <Plus className="size-4" />
              Ajukan Surat
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Section — only for Sekretaris */}
      {isSecretary && <FilterSection divisions={divisions} />}

      {/* Main List */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Mail className="size-5 text-error" />
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Daftar Permohonan</h2>
          <span className="text-xs font-mono text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
            {letters.length}
          </span>
        </div>

        {letters.length === 0 ? (
          <div className="bg-white border border-outline-variant/60 rounded-2xl p-10 text-center">
            <p className="text-sm font-mono text-on-surface-variant mb-4">
              Belum ada permohonan surat.
            </p>
            <Link href="/dashboard/letters/new">
              <Button variant="outline" className="cursor-pointer">
                <Plus className="size-4" /> Ajukan Sekarang
              </Button>
            </Link>
          </div>
        ) : (
          <LettersClient initialLetters={letters} isApprover={isSecretary} />
        )}
      </div>
    </div>
  );
}

