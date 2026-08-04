import { createAdminClient } from "@/lib/supabase/admin";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  deadline: string | null;
  completedAt: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
}

export interface DivisionWithTasks {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  supervisorId: string | null;
  supervisorName: string | null;
  tasks: Task[];
  totalTasks: number;
  doneTasks: number;
}

export interface DivisionTaskSummary {
  divisionId: string;
  divisionName: string;
  divisionSlug: string;
  supervisorName: string | null;
  totalTasks: number;
  doneTasks: number;
}

export async function getDivisionsWithTasks(): Promise<DivisionWithTasks[]> {
  const supabase = createAdminClient();

  // 1. Fetch divisions
  const { data: divisions, error: divError } = await supabase
    .from("divisions")
    .select("id, name, slug, description, sort_order")
    .eq("committee_year_id", YEAR_ID)
    .order("sort_order");

  if (divError || !divisions) {
    console.error("Error fetching divisions:", divError?.message);
    return [];
  }

  // 2. Fetch supervisors (Koordinator for each division)
  const { data: supervisors } = await supabase
    .from("committee_assignments")
    .select(`
      id,
      division_id,
      role:roles!inner(name, level),
      user:profiles(full_name)
    `)
    .eq("committee_year_id", YEAR_ID)
    .eq("is_active", true)
    .gte("role.level", 55);

  const supervisorMap: Record<string, { id: string; name: string; level: number }> = {};
  for (const s of (supervisors as any[]) ?? []) {
    const dId = s.division_id;
    const currentLevel = s.role?.level ?? 0;
    if (!supervisorMap[dId] || currentLevel > supervisorMap[dId].level) {
      supervisorMap[dId] = {
        id: s.id,
        name: s.user?.full_name ?? "",
        level: currentLevel,
      };
    }
  }

  // 3. Fetch all tasks for the active year
  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select(`
      id,
      title,
      description,
      status,
      priority,
      deadline,
      completed_at,
      division_id,
      assignee_id,
      assignee:committee_assignments(
        user:profiles(full_name)
      )
    `)
    .eq("committee_year_id", YEAR_ID)
    .order("created_at");

  if (tasksError) {
    console.error("Error fetching tasks:", tasksError.message);
  }

  const tasksByDivision: Record<string, Task[]> = {};
  for (const t of (tasks as any[]) ?? []) {
    const did = t.division_id;
    if (!tasksByDivision[did]) tasksByDivision[did] = [];

    const assigneeName = t.assignee?.user?.full_name ?? null;

    tasksByDivision[did].push({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      deadline: t.deadline,
      completedAt: t.completed_at,
      assigneeId: t.assignee_id,
      assigneeName,
    });
  }

  return divisions.map((div: any) => {
    const divTasks = tasksByDivision[div.id] ?? [];
    const supInfo = supervisorMap[div.id];

    return {
      id: div.id,
      name: div.name,
      slug: div.slug,
      description: div.description,
      supervisorId: supInfo?.id ?? null,
      supervisorName: supInfo?.name ?? null,
      tasks: divTasks,
      totalTasks: divTasks.length,
      doneTasks: divTasks.filter((t) => t.status === "done").length,
    };
  });
}

export async function getDivisionTaskSummaries(): Promise<DivisionTaskSummary[]> {
  const divisions = await getDivisionsWithTasks();
  return divisions.map((div) => ({
    divisionId: div.id,
    divisionName: div.name,
    divisionSlug: div.slug,
    supervisorName: div.supervisorName,
    totalTasks: div.totalTasks,
    doneTasks: div.doneTasks,
  }));
}
