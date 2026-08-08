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
  roleLevel: number;
  roleIsReportCreator: boolean;
  roleIsMeetingCreator: boolean;
  canSubmitReport: boolean;
  canCreateMeeting: boolean;
  divisionName?: string;
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

  const divisionId = a.division_id;
  const divisionName = a.division?.name ?? "";
  const isBPH = callerLevel >= 75;

  if (isBPH) {
    // BPH: show all members grouped by division
    let { data: allAssignments, error: queryErr } = await admin
      .from("committee_assignments")
      .select(`
        id,
        division_id,
        can_submit_report,
        can_create_meeting,
        division:divisions!committee_assignments_division_id_fkey(name),
        role:roles(name, slug, level, is_report_creator, is_meeting_creator),
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
        roleLevel: m.role?.level ?? 0,
        roleIsReportCreator: m.role?.is_report_creator ?? ((m.role?.level ?? 0) >= 55),
        roleIsMeetingCreator: m.role?.is_meeting_creator ?? ((m.role?.level ?? 0) >= 75 || m.role?.slug === "koordinator"),
        canSubmitReport: m.can_submit_report ?? false,
        canCreateMeeting: m.can_create_meeting ?? false,
        divisionName: m.division?.name ?? "",
      });
    }

    return (
      <MembersClient
        callerLevel={callerLevel}
        callerDivisionName={divisionName}
        canInvite
        isBPH
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
      role:roles(name, slug, level, is_report_creator, is_meeting_creator),
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
    roleLevel: m.role?.level ?? 0,
    roleIsReportCreator: m.role?.is_report_creator ?? ((m.role?.level ?? 0) >= 55),
    roleIsMeetingCreator: m.role?.is_meeting_creator ?? ((m.role?.level ?? 0) >= 75 || m.role?.slug === "koordinator"),
    canSubmitReport: m.can_submit_report ?? false,
    canCreateMeeting: m.can_create_meeting ?? false,
  }));

  return (
    <MembersClient
      callerLevel={callerLevel}
      callerDivisionName={divisionName}
      canInvite
      isBPH={false}
      ownMembers={memberList}
    />
  );
}
