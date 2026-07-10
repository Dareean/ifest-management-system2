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

  const kpiCounts = await Promise.all(
    divisions.map(async (div) => {
      const { data: divisionKpis } = await supabase
        .from("kpi_items")
        .select("id, is_milestone")
        .eq("committee_year_id", committeeYearId)
        .eq("division_id", div.id);

      return {
        divisionId: div.id,
        totalKpis: divisionKpis?.length ?? 0,
        milestones: divisionKpis?.filter((k) => k.is_milestone).length ?? 0,
      };
    }),
  );

  const kpiMap = Object.fromEntries(
    kpiCounts.map((k) => [k.divisionId, k]),
  );

  return divisions.map((div) => ({
    id: div.id,
    name: div.name,
    slug: div.slug,
    sort_order: div.sort_order,
    totalKpis: kpiMap[div.id]?.totalKpis ?? 0,
    milestones: kpiMap[div.id]?.milestones ?? 0,
  }));
}
