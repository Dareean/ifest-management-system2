import { createAdminClient } from "@/lib/supabase/admin";

export interface DashboardOverview {
  totalMembers: number;
  totalKpis: number;
  totalLetters: number;
  totalMeetings: number;
}

export interface DivisionProgress {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  totalKpis: number;
  milestones: number;
}

export async function getDashboardOverview(committeeYearId: string): Promise<DashboardOverview> {
  const supabase = createAdminClient();

  const [assignments, kpis, letters, meetings] = await Promise.all([
    supabase
      .from("committee_assignments")
      .select("id", { count: "exact", head: true })
      .eq("committee_year_id", committeeYearId)
      .eq("is_active", true),

    supabase
      .from("kpi_items")
      .select("id", { count: "exact", head: true })
      .eq("committee_year_id", committeeYearId),

    supabase
      .from("letter_requests")
      .select("id", { count: "exact", head: true })
      .eq("committee_year_id", committeeYearId),

    supabase
      .from("meetings")
      .select("id", { count: "exact", head: true })
      .eq("committee_year_id", committeeYearId),
  ]);

  return {
    totalMembers: assignments.count ?? 0,
    totalKpis: kpis.count ?? 0,
    totalLetters: letters.count ?? 0,
    totalMeetings: meetings.count ?? 0,
  };
}

export async function getDivisionsWithProgress(committeeYearId: string): Promise<DivisionProgress[]> {
  const supabase = createAdminClient();

  const { data: divisions } = await supabase
    .from("divisions")
    .select("id, name, slug, sort_order")
    .eq("committee_year_id", committeeYearId)
    .order("sort_order");

  if (!divisions) return [];

  // Batch fetch all KPIs
  const divisionIds = divisions.map((d) => d.id);
  const { data: allDivisionKpis } = await supabase
    .from("kpi_items")
    .select("id, is_milestone, division_id")
    .eq("committee_year_id", committeeYearId)
    .in("division_id", divisionIds);

  const kpiByDivision: Record<string, any[]> = {};
  for (const kpi of allDivisionKpis ?? []) {
    const did = (kpi as any).division_id;
    if (!kpiByDivision[did]) kpiByDivision[did] = [];
    kpiByDivision[did].push(kpi);
  }

  return divisions.map((div) => ({
    id: div.id,
    name: div.name,
    slug: div.slug,
    sort_order: div.sort_order,
    totalKpis: kpiByDivision[div.id]?.length ?? 0,
    milestones: kpiByDivision[div.id]?.filter((k: any) => k.is_milestone).length ?? 0,
  }));
}
