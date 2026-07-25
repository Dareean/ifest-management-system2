import { createAdminClient } from "@/lib/supabase/admin";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

export interface MemberOption {
  assignmentId: string;
  name: string;
  divisionId: string;
  divisionName: string;
  roleName: string;
  roleLevel: number;
}

export interface DivisionGroup {
  divisionId: string;
  divisionName: string;
  members: MemberOption[];
}

export async function getAllMembers(): Promise<DivisionGroup[]> {
  const supabase = createAdminClient();

  const { data: assignments } = await supabase
    .from("committee_assignments")
    .select(`
      id,
      division_id,
      division:divisions!committee_assignments_division_id_fkey(name),
      role:roles(name, level),
      user:profiles(full_name)
    `)
    .eq("committee_year_id", YEAR_ID)
    .eq("is_active", true);

  if (!assignments) return [];

  const grouped: Record<string, DivisionGroup> = {};

  for (const a of assignments as any[]) {
    const divId = a.division_id;
    if (!grouped[divId]) {
      grouped[divId] = {
        divisionId: divId,
        divisionName: a.division?.name ?? "",
        members: [],
      };
    }
    grouped[divId].members.push({
      assignmentId: a.id,
      name: a.user?.full_name ?? "",
      divisionId: divId,
      divisionName: a.division?.name ?? "",
      roleName: a.role?.name ?? "",
      roleLevel: a.role?.level ?? 0,
    });
  }

  return Object.values(grouped);
}

export async function getDivisionMembers(divisionId: string): Promise<MemberOption[]> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("committee_assignments")
    .select(`
      id,
      division_id,
      division:divisions!committee_assignments_division_id_fkey(name),
      role:roles(name, level),
      user:profiles(full_name)
    `)
    .eq("committee_year_id", YEAR_ID)
    .eq("division_id", divisionId)
    .eq("is_active", true);

  if (!data) return [];

  return data.map((a: any) => ({
    assignmentId: a.id,
    name: a.user?.full_name ?? "",
    divisionId: a.division_id,
    divisionName: a.division?.name ?? "",
    roleName: a.role?.name ?? "",
    roleLevel: a.role?.level ?? 0,
  }));
}

export async function getBPHMembers(): Promise<MemberOption[]> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("committee_assignments")
    .select(`
      id,
      division_id,
      division:divisions!committee_assignments_division_id_fkey(name),
      role:roles(name, level),
      user:profiles(full_name)
    `)
    .eq("committee_year_id", YEAR_ID)
    .eq("is_active", true)
    .gte("role.level", 75);

  if (!data) return [];

  return data.map((a: any) => ({
    assignmentId: a.id,
    name: a.user?.full_name ?? "",
    divisionId: a.division_id,
    divisionName: a.division?.name ?? "",
    roleName: a.role?.name ?? "",
    roleLevel: a.role?.level ?? 0,
  }));
}
