import { createAdminClient } from "@/lib/supabase/admin";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

export interface DivisionWithMembers {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  description: string | null;
  members: number;
}

export interface RoleData {
  id: string;
  name: string;
  slug: string;
  level: number;
  is_approver: boolean;
  is_meeting_creator: boolean;
  is_report_creator: boolean;
}

export interface AssignmentData {
  id: string;
  name: string;
  nim: string;
  phone: string | null;
  avatarUrl: string | null;
  email: string;
  division: string;
  divisionSlug: string;
  role: string;
  roleSlug: string;
  can_submit_report: boolean;
  can_create_meeting: boolean;
}

export interface YearData {
  id: string;
  label: string;
  is_active: boolean;
  started_at: string;
  ended_at: string | null;
  divisions: number;
  members: number;
}

export async function getDivisionsWithMembers(): Promise<DivisionWithMembers[]> {
  const supabase = createAdminClient();

  const { data: divisions } = await supabase
    .from("divisions")
    .select("id, name, slug, sort_order, description")
    .eq("committee_year_id", YEAR_ID)
    .order("sort_order");

  if (!divisions) return [];

  const divisionsWithCounts = await Promise.all(
    divisions.map(async (div) => {
      const { count } = await supabase
        .from("committee_assignments")
        .select("*", { count: "exact", head: true })
        .eq("committee_year_id", YEAR_ID)
        .eq("division_id", div.id)
        .eq("is_active", true);

      return { ...div, members: count ?? 0 };
    }),
  );

  return divisionsWithCounts;
}

export async function getRoles(): Promise<RoleData[]> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("roles")
    .select("id, name, slug, level, is_approver, is_meeting_creator, is_report_creator")
    .eq("committee_year_id", YEAR_ID)
    .order("level", { ascending: false });

  return data ?? [];
}

export async function getAssignments(): Promise<AssignmentData[]> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("committee_assignments")
    .select(`
      id,
      can_submit_report,
      can_create_meeting,
      user:profiles(full_name, nim, phone, avatar_url),
      division:divisions!committee_assignments_division_id_fkey(name, slug),
      role:roles(name, slug)
    `)
    .eq("committee_year_id", YEAR_ID)
    .eq("is_active", true);

  if (!data) return [];

  return data.map((a: any) => ({
    id: a.id,
    name: a.user?.full_name ?? "",
    nim: a.user?.nim ?? "",
    phone: a.user?.phone ?? null,
    avatarUrl: a.user?.avatar_url ?? null,
    email: "",
    division: a.division?.name ?? "",
    divisionSlug: a.division?.slug ?? "",
    role: a.role?.name ?? "",
    roleSlug: a.role?.slug ?? "",
    can_submit_report: a.can_submit_report ?? false,
    can_create_meeting: a.can_create_meeting ?? false,
  }));
}

export async function getYears(): Promise<YearData[]> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("committee_years")
    .select("id, label, is_active, started_at, ended_at")
    .order("started_at", { ascending: false });

  if (!data) return [];

  const yearsWithCounts = await Promise.all(
    data.map(async (year) => {
      const [divCount, memCount] = await Promise.all([
        supabase
          .from("divisions")
          .select("*", { count: "exact", head: true })
          .eq("committee_year_id", year.id),
        supabase
          .from("committee_assignments")
          .select("*", { count: "exact", head: true })
          .eq("committee_year_id", year.id)
          .eq("is_active", true),
      ]);

      return {
        ...year,
        divisions: divCount.count ?? 0,
        members: memCount.count ?? 0,
      };
    }),
  );

  return yearsWithCounts;
}
