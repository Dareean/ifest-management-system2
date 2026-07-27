import { requireRole } from "@/lib/auth/authorize";
import { WeeklyReportCreateClient } from "./client";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapDbRowToReport } from "@/lib/data/weekly-report";

interface CreatePageProps {
  searchParams: Promise<{ edit?: string }>;
}

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

export default async function WeeklyReportCreatePage({ searchParams }: CreatePageProps) {
  const authResult = await requireRole(55);
  if (!authResult.authorized) {
    return (
      <div className="p-8 text-center text-error bg-error-container/30 rounded-3xl border border-error/20">
        <p className="font-mono text-sm uppercase tracking-wider font-bold">Akses Ditolak</p>
        <p className="mt-2 text-sm text-on-surface-variant">{authResult.error || "Anda tidak memiliki akses ke halaman ini."}</p>
      </div>
    );
  }

  const { session } = authResult;
  const admin = createAdminClient();
  const params = await searchParams;

  // 1. If edit parameter is provided, load the report
  let existingReport = null;
  if (params.edit) {
    const { data: dbReport } = await admin
      .from("weekly_reports")
      .select(`
        id,
        week_label,
        achievements,
        blockers,
        next_week_targets,
        status,
        supervisor_notes,
        submitted_at,
        division:divisions(id, name, slug)
      `)
      .eq("id", params.edit)
      .maybeSingle();

    if (dbReport) {
      existingReport = mapDbRowToReport(dbReport);
      
      // Ownership check: Coordinators can only edit their own division's report
      const reportDivId = (dbReport as any).division?.id;
      if (session.roleLevel < 75 && session.divisionId !== reportDivId) {
        return (
          <div className="p-8 text-center text-error bg-error-container/30 rounded-3xl border border-error/20">
            <p className="font-mono text-sm uppercase tracking-wider font-bold">Akses Ditolak</p>
            <p className="mt-2 text-sm text-on-surface-variant">Anda tidak berwenang untuk mengubah laporan divisi lain.</p>
          </div>
        );
      }
    }
  }

  // 2. Fetch all divisions for dropdown selection if BPH (level >= 75)
  let divisionsList: { id: string; name: string }[] = [];
  if (session.roleLevel >= 75) {
    const { data: dbDivs } = await admin
      .from("divisions")
      .select("id, name")
      .eq("committee_year_id", YEAR_ID)
      .neq("slug", "bph")
      .order("sort_order");
    divisionsList = dbDivs || [];
  } else {
    divisionsList = [{ id: session.divisionId, name: session.divisionName }];
  }

  return (
    <WeeklyReportCreateClient
      session={session}
      divisions={divisionsList}
      existingReport={existingReport}
    />
  );
}
