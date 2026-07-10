import { createAdminClient } from "@/lib/supabase/admin";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

export interface KpiWithTasks {
  id: string;
  title: string;
  target: string;
  deadline: string | null;
  isMilestone: boolean;
  divisionId: string;
  divisionName: string;
  divisionSlug: string;
  totalTasks: number;
  doneTasks: number;
  tasks: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    deadline: string | null;
    completedAt: string | null;
  }[];
}

export interface DivisionKpiSummary {
  divisionId: string;
  divisionName: string;
  divisionSlug: string;
  totalKpis: number;
  milestoneKpis: number;
  totalTasks: number;
  doneTasks: number;
}

export async function getAllKpisWithTasks(): Promise<KpiWithTasks[]> {
  const supabase = createAdminClient();

  const { data: kpis } = await supabase
    .from("kpi_items")
    .select(`
      id,
      title,
      target,
      deadline,
      is_milestone,
      division_id,
      division:divisions(name, slug)
    `)
    .eq("committee_year_id", YEAR_ID)
    .order("created_at");

  if (!kpis) return [];

  const kpisWithTasks = await Promise.all(
    kpis.map(async (kpi: any) => {
      const { data: tasks } = await supabase
        .from("tasks")
        .select("id, title, description, status, priority, deadline, completed_at")
        .eq("kpi_item_id", kpi.id)
        .order("created_at");

      return {
        id: kpi.id,
        title: kpi.title,
        target: kpi.target,
        deadline: kpi.deadline,
        isMilestone: kpi.is_milestone,
        divisionId: kpi.division_id,
        divisionName: kpi.division?.name ?? "",
        divisionSlug: kpi.division?.slug ?? "",
        totalTasks: tasks?.length ?? 0,
        doneTasks: tasks?.filter((t) => t.status === "done").length ?? 0,
        tasks: (tasks ?? []).map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          deadline: t.deadline,
          completedAt: t.completed_at,
        })),
      };
    }),
  );

  return kpisWithTasks;
}

export async function getDivisionKpiSummaries(): Promise<DivisionKpiSummary[]> {
  const supabase = createAdminClient();

  const { data: divisions } = await supabase
    .from("divisions")
    .select("id, name, slug")
    .eq("committee_year_id", YEAR_ID)
    .order("sort_order");

  if (!divisions) return [];

  const summaries = await Promise.all(
    divisions.map(async (div) => {
      const { data: kpis } = await supabase
        .from("kpi_items")
        .select("id, is_milestone")
        .eq("committee_year_id", YEAR_ID)
        .eq("division_id", div.id);

      const kpiIds = kpis?.map((k) => k.id) ?? [];

      const { data: tasks } = kpiIds.length > 0
        ? await supabase
            .from("tasks")
            .select("status")
            .in("kpi_item_id", kpiIds)
        : { data: [] };

      return {
        divisionId: div.id,
        divisionName: div.name,
        divisionSlug: div.slug,
        totalKpis: kpis?.length ?? 0,
        milestoneKpis: kpis?.filter((k) => k.is_milestone).length ?? 0,
        totalTasks: tasks?.length ?? 0,
        doneTasks: tasks?.filter((t) => t.status === "done").length ?? 0,
      };
    }),
  );

  return summaries;
}
