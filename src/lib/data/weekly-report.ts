import { createAdminClient } from "@/lib/supabase/admin";
import { WeeklyReport, DivisionName, ReportStatus } from "@/types/weekly-report";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

export const DIVISION_MAP: Record<string, DivisionName> = {
  "ekonomi-kreatif": "EKRAF",
  "konsumsi": "KONSUMSI",
  "keamanan": "KEAMANAN",
};

export const REVERSE_DIVISION_MAP: Record<DivisionName, string> = {
  "EKRAF": "ekonomi-kreatif",
  "KONSUMSI": "konsumsi",
  "KEAMANAN": "keamanan",
};

// Map database row to WeeklyReport interface
export function mapDbRowToReport(row: any): WeeklyReport {
  const dbSlug = row.division?.slug || "";
  const division = (DIVISION_MAP[dbSlug] || dbSlug.toUpperCase().replace("-", " ")) as DivisionName;
  
  return {
    id: row.id,
    division,
    divisionId: row.division?.id,
    divisionSlug: dbSlug,
    supervisorId: row.supervisor_id || undefined,
    supervisorName: row.supervisor_name || undefined,
    weekLabel: row.week_label,
    submittedAt: row.submitted_at,
    achievements: row.achievements,
    blockers: row.blockers,
    nextWeekTargets: row.next_week_targets,
    status: row.status as ReportStatus,
    supervisorNotes: row.supervisor_notes || undefined,
    attachmentUrl: row.attachment_url || undefined,
  };
}

export async function getWeeklyReportsForSupervisor(supervisorAssignmentId: string) {
  const supabase = createAdminClient();
  
  // 1. Fetch division for this supervisor assignment
  const { data: assignment } = await supabase
    .from("committee_assignments")
    .select("division_id")
    .eq("id", supervisorAssignmentId)
    .maybeSingle();

  const divisionId = assignment?.division_id;

  const { data: divisions, error: divError } = await supabase
    .from("divisions")
    .select("id, name, slug")
    .eq("committee_year_id", YEAR_ID)
    .order("sort_order");
    
  if (divError || !divisions) {
    console.error("Error fetching divisions:", divError);
    return { divisions: [], reports: [] };
  }

  const targetDivisions = divisionId ? divisions.filter((d) => d.id === divisionId) : divisions;
  const divisionIds = targetDivisions.map((d) => d.id);
  
  if (divisionIds.length === 0) {
    return { divisions: [], reports: [] };
  }
  
  // 2. Fetch reports for these divisions
  const { data: reports, error: reportsError } = await supabase
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
      attachment_url,
      division:divisions(
        id,
        name,
        slug
      )
    `)
    .in("division_id", divisionIds)
    .order("submitted_at", { ascending: false });
    
  if (reportsError) {
    console.error("Error fetching weekly reports:", reportsError);
  }
  
  return {
    divisions: targetDivisions.map((d: any) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      displayName: DIVISION_MAP[d.slug] || d.name,
      supervisorName: null
    })),
    reports: (reports || []).map(mapDbRowToReport)
  };
}

export async function getWeeklyReportsForCoordinator(divisionId: string) {
  const supabase = createAdminClient();
  
  const { data: reports, error } = await supabase
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
      attachment_url,
      division:divisions(
        id,
        name,
        slug
      )
    `)
    .eq("division_id", divisionId)
    .order("submitted_at", { ascending: false });
    
  if (error) {
    console.error("Error fetching weekly reports:", error);
  }
  
  return (reports || []).map(mapDbRowToReport);
}

export async function getWeeklyReportsForAll() {
  const supabase = createAdminClient();
  
  // Fetch all divisions except BPH
  const { data: divisions, error: divError } = await supabase
    .from("divisions")
    .select("id, name, slug")
    .eq("committee_year_id", YEAR_ID)
    .neq("slug", "bph")
    .order("sort_order");
    
  if (divError || !divisions) {
    return { divisions: [], reports: [] };
  }
  
  const { data: reports, error: reportsError } = await supabase
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
      attachment_url,
      division:divisions(
        id,
        name,
        slug
      )
    `)
    .order("submitted_at", { ascending: false });
    
  if (reportsError) {
    console.error("Error fetching weekly reports:", reportsError);
  }

  return {
    divisions: divisions.map((d: any) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      displayName: DIVISION_MAP[d.slug] || d.name,
      supervisorName: null
    })),
    reports: (reports || []).map(mapDbRowToReport)
  };
}

export async function getWeeklyReportProgressData() {
  const { divisions, reports } = await getWeeklyReportsForAll();
  const EXPECTED_WEEKS = 4;

  const divisionStats = divisions.map((div: any) => {
    const divReports = reports.filter((r) => r.divisionId === div.id || r.divisionSlug === div.slug);
    const submittedCount = divReports.length;
    const approvedCount = divReports.filter((r) => (r.status as string) === "APPROVED" || (r.status as string) === "approved").length;
    const progress = Math.min(100, Math.round((submittedCount / EXPECTED_WEEKS) * 100));

    return {
      id: div.id,
      name: div.name,
      displayName: div.displayName,
      submittedCount,
      approvedCount,
      totalExpected: EXPECTED_WEEKS,
      progress,
    };
  });

  const totalSubmitted = divisionStats.reduce((s, d) => s + d.submittedCount, 0);
  const totalExpectedAll = (divisionStats.length || 1) * EXPECTED_WEEKS;
  const overallProgress = Math.min(100, Math.round((totalSubmitted / totalExpectedAll) * 100));

  return {
    divisionStats,
    totalSubmitted,
    totalExpectedAll,
    overallProgress,
  };
}
