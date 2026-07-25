import { getDivisionsWithTasks, getDivisionTaskSummaries } from "@/lib/data/tasks";
import { TasksClient } from "./client";
import { getProfile } from "@/lib/data/profile";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function TasksPage() {
  const [divisions, summaries, profile] = await Promise.all([
    getDivisionsWithTasks(),
    getDivisionTaskSummaries(),
    getProfile()
  ]);

  // Fetch all assignments for selection/assignee dropdown
  const supabase = createAdminClient();
  const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";
  const { data: assignments } = await supabase
    .from("committee_assignments")
    .select(`
      id,
      profiles (id, full_name, nim),
      divisions (id, name)
    `)
    .eq("committee_year_id", YEAR_ID)
    .eq("is_active", true);

  const parsedAssignments = (assignments ?? []).map((a: any) => ({
    id: a.id,
    profileId: a.profiles?.id,
    fullName: a.profiles?.full_name,
    nim: a.profiles?.nim,
    divisionId: a.divisions?.id,
    divisionName: a.divisions?.name,
  }));

  return (
    <TasksClient
      divisions={divisions}
      summaries={summaries}
      profile={profile}
      assignments={parsedAssignments}
    />
  );
}
