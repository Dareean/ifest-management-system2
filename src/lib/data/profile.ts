import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

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
    roleName: string;
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

  // Fallback RLS: kalau service-role key tidak tersedia, pakai user-scoped
  // client. Kebijakan RLS mengizinkan 'authenticated' membaca tabel ini,
  // jadi profil & assignment tetap terbaca tanpa service-role key.
  let admin: SupabaseClient;
  try {
    admin = createAdminClient();
  } catch {
    console.warn(
      "[profile] Service-role key tidak tersedia, fallback ke user-scoped client (RLS).",
    );
    admin = supabase as unknown as SupabaseClient;
  }

  const { data: profileRows } = await admin
    .from("profiles")
    .select("full_name, nim, phone, avatar_url, created_at")
    .eq("id", userId)
    .limit(1);
  const profile = profileRows?.[0] ?? null;

  const { data: assignmentRows } = await admin
    .from("committee_assignments")
    .select(`
      id, is_active, assigned_at,
      division:divisions!committee_assignments_division_id_fkey(name),
      role:roles(name, level)
    `)
    .eq("committee_year_id", YEAR_ID)
    .eq("user_id", userId)
    .eq("is_active", true)
    .limit(1);
  const assignment = assignmentRows?.[0] ?? null;

  // Stats
  let totalLetters = 0;
  let totalMeetings = 0;
  let totalTasks = 0;
  let doneTasks = 0;

  interface ProfileRow {
    full_name?: string | null;
    nim?: string | null;
    phone?: string | null;
    avatar_url?: string | null;
    created_at?: string | null;
  }
  interface AssignmentJoin {
    id: string;
    is_active: boolean;
    assigned_at: string;
    division?: { name?: string } | { name?: string }[] | null;
    role?: { name?: string; level?: number } | { name?: string; level?: number }[] | null;
  }
  const p = profile as unknown as ProfileRow | null;
  const a = assignment as unknown as AssignmentJoin | null;
  const divName = Array.isArray(a?.division) ? a.division[0]?.name : a?.division?.name;
  const roleName = Array.isArray(a?.role) ? a.role[0]?.name : a?.role?.name;
  const roleLevel = Array.isArray(a?.role) ? a.role[0]?.level : a?.role?.level;

  if (a?.id) {
    const [letterRes, meetingRes] = await Promise.all([
      admin
        .from("letter_requests")
        .select("*", { count: "exact", head: true })
        .eq("requester_id", a.id),
      admin
        .from("meeting_invitees")
        .select("*", { count: "exact", head: true })
        .eq("committee_assignment_id", a.id),
    ]);

    totalLetters = letterRes.count ?? 0;
    totalMeetings = meetingRes.count ?? 0;

    const { data: tasks } = await admin
      .from("tasks")
      .select("status")
      .eq("assignee_id", a.id);
    totalTasks = tasks?.length ?? 0;
    doneTasks = tasks?.filter((t) => t.status === "done").length ?? 0;
  }

  return {
    userId,
    email,
    fullName: p?.full_name ?? "",
    nim: p?.nim ?? "",
    phone: p?.phone ?? null,
    avatarUrl: p?.avatar_url ?? null,
    createdAt: p?.created_at ?? null,
    assignment: a
      ? {
          division: divName ?? "",
          role: roleName ?? "",
          roleName: roleName ?? "",
          level: roleLevel ?? 0,
          isActive: a.is_active,
          assignedAt: a.assigned_at,
        }
      : null,
    stats: { totalLetters, totalMeetings, totalTasks, doneTasks },
  };
});
