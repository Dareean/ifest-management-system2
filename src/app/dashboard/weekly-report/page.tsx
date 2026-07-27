import { requireRole } from "@/lib/auth/authorize";
import { 
  getWeeklyReportsForSupervisor, 
  getWeeklyReportsForCoordinator,
  getWeeklyReportsForAll 
} from "@/lib/data/weekly-report";
import { WeeklyReportDashboardClient } from "./client";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function WeeklyReportPage() {
  // Lower minimum role level to 10 to allow all members to see the reports
  const authResult = await requireRole(10);
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

  // 1. Check if user is a supervisor of any division
  const { data: supervisedDivs } = await admin
    .from("divisions")
    .select("id")
    .eq("supervisor_id", session.assignmentId);

  const isSupervisor = (supervisedDivs && supervisedDivs.length > 0) || session.roleLevel >= 75;

  // 2. Fetch all reports for the analytics dashboard and supervisor mapping
  const allData = await getWeeklyReportsForAll();
  const divisions = allData.divisions;
  const reports = allData.reports;
  
  const userDivision = { id: session.divisionId, name: session.divisionName };

  return (
    <WeeklyReportDashboardClient
      session={session}
      isSupervisor={isSupervisor}
      isBph={session.roleLevel >= 75}
      divisions={divisions}
      initialReports={reports}
      userDivision={userDivision}
    />
  );
}

