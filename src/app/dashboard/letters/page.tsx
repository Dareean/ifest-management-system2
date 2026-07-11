import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Mail, Clock, Building2 } from "lucide-react";
import Link from "next/link";
import { getLetters, getStatusDisplay, getPriorityDisplay } from "@/lib/data/letters";
import { exportLettersCSV } from "@/lib/actions/export";
import { ExportButton } from "@/components/export-button";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FilterSection } from "./filter-section";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

const priorityColor: Record<string, string> = {
  tinggi: "text-error border-error/30 bg-error/5",
  sedang: "text-accent-lilac border-accent-lilac/30 bg-accent-lilac/5",
  rendah: "text-on-surface-variant border-outline-variant/60 bg-surface-container-low",
};

export default async function LettersPage(props: {
  searchParams?: Promise<{ priority?: string; status?: string }>;
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

  const isApprover = !!(assignment as any)?.role?.is_approver;
  const assignmentId = (assignment as any)?.id;

  const rawLetters = await getLetters(isApprover ? undefined : assignmentId);

  // Apply filters (only for approvers)
  let letters = rawLetters;
  if (isApprover && sp) {
    if (sp.priority) {
      letters = letters.filter((l) => l.priority === sp.priority);
    }
    if (sp.status) {
      letters = letters.filter((l) => l.status === sp.status);
    }
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
            {isApprover
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

      {/* Filter Section — only for Sekretaris/approver */}
      {isApprover && <FilterSection />}

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
              Belum ada permohonan surat. Klik "Ajukan Surat" untuk memulai.
            </p>
            <Link href="/dashboard/letters/new">
              <Button variant="outline" className="cursor-pointer">
                <Plus className="size-4" /> Ajukan Sekarang
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {letters.map((letter) => {
              const status = getStatusDisplay(letter.status);
              const prio = getPriorityDisplay(letter.priority);
              return (
                <Link href={`/dashboard/letters/${letter.id}`} key={letter.id} className="block group">
                  <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-accent-magenta/50 transition-all">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-sans text-lg font-bold text-on-surface group-hover:text-accent-magenta transition-colors leading-tight">
                          {letter.subject}
                        </h3>
                        <Badge variant={prio.variant} className="text-[10px] font-mono px-2 py-0.5">
                          {prio.label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-on-surface-variant font-mono mt-1.5">
                        <span>{letter.letterType.toUpperCase()}</span>
                        {letter.category && <span>&middot; {letter.category}</span>}
                        {isApprover && (
                          <>
                            <span>&middot; {letter.division}</span>
                            <span>&middot; {letter.requester}</span>
                          </>
                        )}
                        {letter.deadlineAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {new Date(letter.deadlineAt).toLocaleDateString("id-ID", {
                              day: "numeric", month: "short"
                            })}
                          </span>
                        )}
                        {letter.targetInstitution && (
                          <span className="flex items-center gap-1">
                            <Building2 className="size-3" />
                            {letter.targetInstitution}
                          </span>
                        )}
                        <span>
                          {new Date(letter.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </span>
                      </div>
                    </div>
                    <Badge variant={status.variant} className="text-xs font-mono px-3 py-1 self-start sm:self-center shrink-0">
                      {status.label}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
