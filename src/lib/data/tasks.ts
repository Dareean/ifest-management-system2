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

  // Fetch divisions with their supervisors (joining profiles via committee_assignments)
  const { data: divisions, error: divError } = await supabase
    .from("divisions")
    .select(`
      id,
      name,
      slug,
      description,
      supervisor_id,
      supervisor:committee_assignments!divisions_supervisor_id_fkey(
        profiles(full_name)
      )
    `)
    .eq("committee_year_id", YEAR_ID)
    .order("sort_order");

  if (divError || !divisions) {
    console.error("Error fetching divisions:", divError?.message);
    return [];
  }

  // Fetch all tasks for the active year
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
        profiles(full_name)
      )
    `)
    .eq("committee_year_id", YEAR_ID)
    .order("created_at");

  if (tasksError) {
    console.error("Error fetching tasks:", tasksError.message);
  }

  const tasksByDivision: Record<string, Task[]> = {};
  for (const t of tasks ?? []) {
    const did = t.division_id;
    if (!tasksByDivision[did]) tasksByDivision[did] = [];
    
    // Extract assignee name
    const assigneeName = (t.assignee as any)?.profiles?.full_name ?? null;
    
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
    // Extract supervisor name
    const supervisorName = div.supervisor?.profiles?.full_name ?? null;

    return {
      id: div.id,
      name: div.name,
      slug: div.slug,
      description: div.description,
      supervisorId: div.supervisor_id,
      supervisorName,
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
