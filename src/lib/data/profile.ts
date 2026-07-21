import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

export interface ProfileData {
  userId: string | null;
  email: string | null;
  fullName: string;
  nim: string;
  phone: string | null;
  avatarUrl: string | null;
  createdAt: string | null;
  assignment: {
    division: string;
    role: string;
    level: number;
    isActive: boolean;
    assignedAt: string;
  } | null;
  stats: {
    totalLetters: number;
    totalMeetings: number;
    totalTasks: number;
    doneTasks: number;
  };
}

export const getProfile = cache(async (): Promise<ProfileData | null> => {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  const email = authData?.user?.email ?? null;

  if (!userId) return null;

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, nim, phone, avatar_url, created_at")
    .eq("id", userId)
    .maybeSingle();

  const { data: assignment } = await admin
    .from("committee_assignments")
    .select(`
      is_active, assigned_at,
      division:divisions(name),
      role:roles(name, level)
    `)
    .eq("committee_year_id", YEAR_ID)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  // Stats
  let totalLetters = 0;
  let totalMeetings = 0;
  let totalTasks = 0;
  let doneTasks = 0;

  if (assignment) {
    const a = assignment as any;
    const assignmentId = (assignment as any).id;

    const [letterRes, meetingRes, taskRes] = await Promise.all([
      admin
        .from("letter_requests")
        .select("*", { count: "exact", head: true })
        .eq("requester_id", assignmentId),
      admin
        .from("meeting_invitees")
        .select("*", { count: "exact", head: true })
        .eq("committee_assignment_id", assignmentId),
      admin
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("assignee_id", assignmentId),
    ]);

    totalLetters = letterRes.count ?? 0;
    totalMeetings = meetingRes.count ?? 0;

    const { data: tasks } = await admin
      .from("tasks")
      .select("status")
      .eq("assignee_id", assignmentId);
    totalTasks = tasks?.length ?? 0;
    doneTasks = tasks?.filter((t) => t.status === "done").length ?? 0;
  }

  return {
    userId,
    email,
    fullName: (profile as any)?.full_name ?? "",
    nim: (profile as any)?.nim ?? "",
    phone: (profile as any)?.phone ?? null,
    avatarUrl: (profile as any)?.avatar_url ?? null,
    createdAt: (profile as any)?.created_at ?? null,
    assignment: assignment
      ? {
          division: (assignment as any).division?.name ?? "",
          role: (assignment as any).role?.name ?? "",
          level: (assignment as any).role?.level ?? 0,
          isActive: (assignment as any).is_active,
          assignedAt: (assignment as any).assigned_at,
        }
      : null,
    stats: { totalLetters, totalMeetings, totalTasks, doneTasks },
  };
});
