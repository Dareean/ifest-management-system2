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
  // Map DB slug to DivisionName (or fallback to uppercase of slug)
  const division = (DIVISION_MAP[dbSlug] || dbSlug.toUpperCase().replace("-", " ")) as DivisionName;
  
  return {
    id: row.id,
    division,
    divisionId: row.division?.id,
    divisionSlug: dbSlug,
    supervisorId: row.division?.supervisor_id || undefined,
    supervisorName: row.division?.supervisor?.profiles?.full_name || undefined,
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
  
  // 1. Fetch divisions supervised by this user
  const { data: divisions, error: divError } = await supabase
    .from("divisions")
    .select(`
      id,
      name,
      slug,
      supervisor_id,
      supervisor:committee_assignments!divisions_supervisor_id_fkey(
        profiles(full_name)
      )
    `)
    .eq("committee_year_id", YEAR_ID)
    .eq("supervisor_id", supervisorAssignmentId);
    
  if (divError || !divisions) {
    console.error("Error fetching supervised divisions:", divError);
    return { divisions: [], reports: [] };
  }
  
  const divisionIds = divisions.map(d => d.id);
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
        slug,
        supervisor_id,
        supervisor:committee_assignments!divisions_supervisor_id_fkey(
          profiles(full_name)
        )
      )
    `)
    .in("division_id", divisionIds)
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
      supervisorName: d.supervisor?.profiles?.full_name || null
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
        slug,
        supervisor_id,
        supervisor:committee_assignments!divisions_supervisor_id_fkey(
          profiles(full_name)
        )
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
    .select(`
      id,
      name,
      slug,
      supervisor_id,
      supervisor:committee_assignments!divisions_supervisor_id_fkey(
        profiles(full_name)
      )
    `)
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
        slug,
        supervisor_id,
        supervisor:committee_assignments!divisions_supervisor_id_fkey(
          profiles(full_name)
        )
      )
    `)
    .order("submitted_at", { ascending: false });
    
  return {
    divisions: divisions.map((d: any) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      displayName: DIVISION_MAP[d.slug] || d.name,
      supervisorName: d.supervisor?.profiles?.full_name || null
    })),
    reports: (reports || []).map(mapDbRowToReport)
  };
}
