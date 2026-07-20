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

  // Batch fetch all tasks
  const kpiIds = kpis.map((k: any) => k.id);
  let tasksByKpiId: Record<string, any[]> = {};
  if (kpiIds.length > 0) {
    const { data: allTasks } = await supabase
      .from("tasks")
      .select("id, title, description, status, priority, deadline, completed_at, kpi_item_id")
      .in("kpi_item_id", kpiIds)
      .order("created_at");
    if (allTasks) {
      for (const task of allTasks) {
        const kid = (task as any).kpi_item_id;
        if (!tasksByKpiId[kid]) tasksByKpiId[kid] = [];
        tasksByKpiId[kid].push(task);
      }
    }
  }

  const kpisWithTasks = kpis.map((kpi: any) => {
    const tasks = tasksByKpiId[kpi.id] ?? [];
    return {
      id: kpi.id,
      title: kpi.title,
      target: kpi.target,
      deadline: kpi.deadline,
      isMilestone: kpi.is_milestone,
      divisionId: kpi.division_id,
      divisionName: kpi.division?.name ?? "",
      divisionSlug: kpi.division?.slug ?? "",
      totalTasks: tasks.length,
      doneTasks: tasks.filter((t: any) => t.status === "done").length,
      tasks: tasks.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        deadline: t.deadline,
        completedAt: t.completed_at,
      })),
    };
  });

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

  // Batch fetch all KPIs
  const { data: allKpis } = await supabase
    .from("kpi_items")
    .select("id, is_milestone, division_id")
    .eq("committee_year_id", YEAR_ID);

  const kpisByDivision: Record<string, any[]> = {};
  for (const kpi of allKpis ?? []) {
    const did = (kpi as any).division_id;
    if (!kpisByDivision[did]) kpisByDivision[did] = [];
    kpisByDivision[did].push(kpi);
  }

  // Batch fetch all tasks
  let tasksByDivision: Record<string, any[]> = {};
  const allKpiIds = allKpis?.map((k: any) => k.id) ?? [];
  if (allKpiIds.length > 0) {
    const { data: allTasks } = await supabase
      .from("tasks")
      .select("status, kpi_item_id")
      .in("kpi_item_id", allKpiIds);
    if (allTasks) {
      const kpiToDivision: Record<string, string> = {};
      for (const kpi of allKpis ?? []) {
        kpiToDivision[(kpi as any).id] = (kpi as any).division_id;
      }
      for (const task of allTasks) {
        const did = kpiToDivision[(task as any).kpi_item_id];
        if (did) {
          if (!tasksByDivision[did]) tasksByDivision[did] = [];
          tasksByDivision[did].push(task);
        }
      }
    }
  }

  const summaries = divisions.map((div) => {
    const kpis = kpisByDivision[div.id] ?? [];
    const tasks = tasksByDivision[div.id] ?? [];
    return {
      divisionId: div.id,
      divisionName: div.name,
      divisionSlug: div.slug,
      totalKpis: kpis.length,
      milestoneKpis: kpis.filter((k: any) => k.is_milestone).length,
      totalTasks: tasks.length,
      doneTasks: tasks.filter((t: any) => t.status === "done").length,
    };
  });

  return summaries;
}
