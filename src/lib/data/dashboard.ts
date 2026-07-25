import { createAdminClient } from "@/lib/supabase/admin";

export interface DashboardOverview {
  totalMembers: number;
  totalTasks: number;
  totalLetters: number;
  totalMeetings: number;
}

export interface DivisionProgress {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  totalTasks: number;
  doneTasks: number;
}

export async function getDashboardOverview(committeeYearId: string): Promise<DashboardOverview> {
  const supabase = createAdminClient();

  const [assignments, tasks, letters, meetings] = await Promise.all([
    supabase
      .from("committee_assignments")
      .select("id", { count: "exact", head: true })
      .eq("committee_year_id", committeeYearId)
      .eq("is_active", true),

    supabase
      .from("tasks")
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
    totalTasks: tasks.count ?? 0,
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

  // Batch fetch all tasks
  const divisionIds = divisions.map((d) => d.id);
  const { data: allTasks } = await supabase
    .from("tasks")
    .select("id, status, division_id")
    .eq("committee_year_id", committeeYearId)
    .in("division_id", divisionIds);

  const tasksByDivision: Record<string, any[]> = {};
  for (const task of allTasks ?? []) {
    const did = (task as any).division_id;
    if (!tasksByDivision[did]) tasksByDivision[did] = [];
    tasksByDivision[did].push(task);
  }

  return divisions.map((div) => {
    const divTasks = tasksByDivision[div.id] ?? [];
    return {
      id: div.id,
      name: div.name,
      slug: div.slug,
      sort_order: div.sort_order,
      totalTasks: divTasks.length,
      doneTasks: divTasks.filter((t: any) => t.status === "done").length,
    };
  });
}
