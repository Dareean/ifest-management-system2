import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MembersClient } from "./client";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

export interface MemberRow {
  assignmentId: string;
  name: string;
  nim: string;
  phone: string | null;
  avatarUrl: string | null;
  roleName: string;
  roleSlug?: string;
  roleLevel: number;
  isApprover: boolean;
  roleIsReportCreator: boolean;
  roleIsMeetingCreator: boolean;
  canSubmitReport: boolean;
  canCreateMeeting: boolean;
  assignedAt?: string | null;
  divisionName?: string;
  stats: {
    totalTasks: number;
    doneTasks: number;
    totalMeetings: number;
    totalLetters: number;
  };
}

export interface DivisionGroup {
  divisionId: string;
  divisionName: string;
  members: MemberRow[];
}

export default async function MembersPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;

  if (!userId) redirect("/login");

  const admin = createAdminClient();

  const { data: assignment } = await admin
    .from("committee_assignments")
    .select(`
      id,
      division_id,
      division:divisions!committee_assignments_division_id_fkey(name, slug),
      role:roles(name, slug, level)
    `)
    .eq("committee_year_id", YEAR_ID)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  const a = assignment as any;
  const callerLevel = a?.role?.level ?? 0;

  if (!assignment || callerLevel < 55) {
    redirect("/dashboard");
  }

  const { data: callerProfile } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle();

  const callerNameLower = ((callerProfile as any)?.full_name ?? "").toLowerCase();
  const isAuthorityUser =
    callerNameLower.includes("gabriel") ||
    callerNameLower.includes("nakita") ||
    callerNameLower.includes("daren") ||
    callerNameLower.includes("dareean");

  const divisionId = a.division_id;
  const divisionName = a.division?.name ?? "";
  const isBPH = callerLevel >= 75;

  // Batch fetch stats for members (tasks, meetings, letters)
  const [tasksRes, meetingsRes, lettersRes] = await Promise.all([
    admin.from("tasks").select("assignee_id, status"),
    admin.from("meeting_invitees").select("committee_assignment_id"),
    admin.from("letter_requests").select("requester_id"),
  ]);

  const tasksMap: Record<string, { total: number; done: number }> = {};
  if (tasksRes.data) {
    for (const t of tasksRes.data) {
      const id = (t as any).assignee_id;
      if (!id) continue;
      if (!tasksMap[id]) tasksMap[id] = { total: 0, done: 0 };
      tasksMap[id].total += 1;
      if ((t as any).status === "done") tasksMap[id].done += 1;
    }
  }

  const meetingsMap: Record<string, number> = {};
  if (meetingsRes.data) {
    for (const m of meetingsRes.data) {
      const id = (m as any).committee_assignment_id;
      if (!id) continue;
      meetingsMap[id] = (meetingsMap[id] ?? 0) + 1;
    }
  }

  const lettersMap: Record<string, number> = {};
  if (lettersRes.data) {
    for (const l of lettersRes.data) {
      const id = (l as any).requester_id;
      if (!id) continue;
      lettersMap[id] = (lettersMap[id] ?? 0) + 1;
    }
  }

  const getStats = (id: string) => ({
    totalTasks: tasksMap[id]?.total ?? 0,
    doneTasks: tasksMap[id]?.done ?? 0,
    totalMeetings: meetingsMap[id] ?? 0,
    totalLetters: lettersMap[id] ?? 0,
  });

  if (isBPH) {
    // BPH: show all members grouped by division
    let { data: allAssignments, error: queryErr } = await admin
      .from("committee_assignments")
      .select(`
        id,
        division_id,
        can_submit_report,
        can_create_meeting,
        assigned_at,
        division:divisions!committee_assignments_division_id_fkey(name),
        role:roles(name, slug, level, is_approver, is_report_creator, is_meeting_creator),
        user:profiles(full_name, nim, phone, avatar_url)
      `)
      .eq("committee_year_id", YEAR_ID)
      .eq("is_active", true)
      .order("division_id");

    // Fallback if optional schema columns are missing in remote DB
    if (queryErr || !allAssignments) {
      const fallback = await admin
        .from("committee_assignments")
        .select(`
          id,
          division_id,
          division:divisions!committee_assignments_division_id_fkey(name),
          role:roles(name, slug, level),
          user:profiles(full_name, nim, phone, avatar_url)
        `)
        .eq("committee_year_id", YEAR_ID)
        .eq("is_active", true)
        .order("division_id");
      allAssignments = fallback.data as any;
    }

    const grouped: Record<string, DivisionGroup> = {};
    for (const m of (allAssignments as any[]) ?? []) {
      const dId = m.division_id;
      if (!grouped[dId]) {
        grouped[dId] = {
          divisionId: dId,
          divisionName: m.division?.name ?? "",
          members: [],
        };
      }
      grouped[dId].members.push({
        assignmentId: m.id,
        name: m.user?.full_name ?? "",
        nim: m.user?.nim ?? "",
        phone: m.user?.phone ?? null,
        avatarUrl: m.user?.avatar_url ?? null,
        roleName: m.role?.name ?? "",
        roleSlug: m.role?.slug ?? "",
        roleLevel: m.role?.level ?? 0,
        isApprover: !!m.role?.is_approver,
        roleIsReportCreator: !!m.role?.is_report_creator,
        roleIsMeetingCreator: !!m.role?.is_meeting_creator,
        canSubmitReport: m.can_submit_report ?? false,
        canCreateMeeting: m.can_create_meeting ?? false,
        assignedAt: m.assigned_at ?? null,
        divisionName: m.division?.name ?? "",
        stats: getStats(m.id),
      });
    }

    return (
      <MembersClient
        callerLevel={callerLevel}
        callerDivisionName={divisionName}
        canInvite
        isBPH
        isAuthorityUser={isAuthorityUser}
        allDivisions={Object.values(grouped)}
      />
    );
  }

  // Koordinator/Wakord: show own division members
  let { data: members, error: divErr } = await admin
    .from("committee_assignments")
    .select(`
      id,
      can_submit_report,
      can_create_meeting,
      assigned_at,
      role:roles(name, slug, level, is_approver, is_report_creator, is_meeting_creator),
      user:profiles(full_name, nim, phone, avatar_url)
    `)
    .eq("committee_year_id", YEAR_ID)
    .eq("division_id", divisionId)
    .eq("is_active", true)
    .order("role_id");

  if (divErr || !members) {
    const fallback = await admin
      .from("committee_assignments")
      .select(`
        id,
        role:roles(name, slug, level),
        user:profiles(full_name, nim, phone, avatar_url)
      `)
      .eq("committee_year_id", YEAR_ID)
      .eq("division_id", divisionId)
      .eq("is_active", true)
      .order("role_id");
    members = fallback.data as any;
  }

  const memberList: MemberRow[] = ((members as any[]) ?? []).map((m) => ({
    assignmentId: m.id,
    name: m.user?.full_name ?? "",
    nim: m.user?.nim ?? "",
    phone: m.user?.phone ?? null,
    avatarUrl: m.user?.avatar_url ?? null,
    roleName: m.role?.name ?? "",
    roleSlug: m.role?.slug ?? "",
    roleLevel: m.role?.level ?? 0,
    isApprover: !!m.role?.is_approver,
    roleIsReportCreator: !!m.role?.is_report_creator,
    roleIsMeetingCreator: !!m.role?.is_meeting_creator,
    canSubmitReport: m.can_submit_report ?? false,
    canCreateMeeting: m.can_create_meeting ?? false,
    assignedAt: m.assigned_at ?? null,
    stats: getStats(m.id),
  }));

  return (
    <MembersClient
      callerLevel={callerLevel}
      callerDivisionName={divisionName}
      canInvite
      isBPH={false}
      isAuthorityUser={isAuthorityUser}
      ownMembers={memberList}
    />
  );
}
