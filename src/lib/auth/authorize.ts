import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

export interface AuthSession {
  userId: string;
  assignmentId: string;
  divisionId: string;
  divisionName: string;
  roleName: string;
  roleSlug: string;
  roleLevel: number;
  isApprover: boolean;
  isMeetingCreator: boolean;
}

type AuthResult =
  | { authorized: true; session: AuthSession }
  | { authorized: false; error: string };

async function getAuthSession(): Promise<AuthResult> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const admin = createAdminClient();

  const { data: assignment } = await admin
    .from("committee_assignments")
    .select(`
      id,
      division_id,
      division:divisions(name),
      role:roles(name, slug, level, is_approver, is_meeting_creator)
    `)
    .eq("committee_year_id", YEAR_ID)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (!assignment) {
    return { authorized: false, error: "Anda tidak memiliki akses ke sistem ini." };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = assignment as any;
  const role = a.role;

  return {
    authorized: true,
    session: {
      userId,
      assignmentId: a.id,
      divisionId: a.division_id,
      divisionName: a.division?.name ?? "",
      roleName: role?.name ?? "",
      roleSlug: role?.slug ?? "",
      roleLevel: role?.level ?? 0,
      isApprover: role?.is_approver ?? false,
      isMeetingCreator: role?.is_meeting_creator ?? false,
    },
  };
}

export async function requireRole(minLevel: number): Promise<
  | { authorized: true; session: AuthSession }
  | { authorized: false; error: string }
> {
  const result = await getAuthSession();

  if (!result.authorized) return result;

  if (result.session.roleLevel < minLevel) {
    return {
      authorized: false,
      error: `Akses ditolak. Role Anda (level ${result.session.roleLevel}) tidak mencukupi (min. level ${minLevel}).`,
    };
  }

  return result;
}

export async function requirePermission(
  permission: "is_approver" | "is_meeting_creator",
): Promise<
  | { authorized: true; session: AuthSession }
  | { authorized: false; error: string }
> {
  const result = await getAuthSession();

  if (!result.authorized) return result;

  const hasPermission =
    permission === "is_approver"
      ? result.session.isApprover
      : result.session.isMeetingCreator;

  if (!hasPermission) {
    return {
      authorized: false,
      error: `Akses ditolak. Anda tidak memiliki izin ${permission === "is_approver" ? "approval" : "membuat rapat"}.`,
    };
  }

  return result;
}
