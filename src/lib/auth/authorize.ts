import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

/** Slug-slug role yang dianggap "Sekretaris Panitia" — satu-satunya yang boleh memproses surat */
export const SECRETARY_SLUGS = ["sekretaris-1", "sekretaris-2"];

/** Slug-slug role yang dianggap "Bendahara" */
export const TREASURER_SLUGS = [
  "bendahara",
  "bendahara-1",
  "bendahara-2",
  "bendahara_1",
  "bendahara_2",
  "bendahara-utama",
];

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
  isReportCreator: boolean;
  isSecretary: boolean;
  isTreasurer: boolean;
}

type AuthResult =
  | { authorized: true; session: AuthSession }
  | { authorized: false; error: string };

async function getAuthSession(): Promise<AuthResult> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  const userEmail = authData?.user?.email ?? "";

  if (!userId) {
    redirect("/login");
  }

  const admin = createAdminClient();

  // Stage 1: Attempt exact match by committee_year_id & user_id & is_active
  let { data: assignment } = await admin
    .from("committee_assignments")
    .select(`
      id,
      division_id,
      division:divisions(name),
      role:roles(name, slug, level, is_approver, is_meeting_creator, is_report_creator)
    `)
    .eq("committee_year_id", YEAR_ID)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  // Stage 2: Fallback by user_id only (ignore committee_year_id mismatch)
  if (!assignment) {
    const { data: fallbackList } = await admin
      .from("committee_assignments")
      .select(`
        id,
        division_id,
        division:divisions(name),
        role:roles(name, slug, level, is_approver, is_meeting_creator, is_report_creator)
      `)
      .eq("user_id", userId)
      .limit(1);

    assignment = fallbackList?.[0] ?? null;
  }

  // Stage 3: Fallback by profiles lookup (ID or Email match)
  let profileName = "";
  if (!assignment) {
    const { data: userProfile } = await admin
      .from("profiles")
      .select("id, full_name, nim")
      .eq("id", userId)
      .maybeSingle();

    if (userProfile) {
      profileName = userProfile.full_name ?? "";
      const { data: profileAssignments } = await admin
        .from("committee_assignments")
        .select(`
          id,
          division_id,
          division:divisions(name),
          role:roles(name, slug, level, is_approver, is_meeting_creator, is_report_creator)
        `)
        .eq("user_id", userProfile.id)
        .limit(1);

      assignment = profileAssignments?.[0] ?? null;
    }
  }

  // Stage 4: Check if account belongs to Lara / Bendahara (Safety net guarantee)
  const isLaraAccount =
    userEmail.toLowerCase().includes("lara") ||
    profileName.toLowerCase().includes("lara");

  if (!assignment && !isLaraAccount) {
    return { authorized: false, error: "Anda tidak memiliki akses ke sistem ini." };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = (assignment ?? {}) as any;
  const rawRole = a.role;
  const role = Array.isArray(rawRole) ? rawRole[0] : rawRole;
  const rawDiv = a.division;
  const div = Array.isArray(rawDiv) ? rawDiv[0] : rawDiv;

  let roleSlug = role?.slug ?? "";
  let roleName = role?.name ?? "";
  let roleLevel = role?.level ?? 0;

  let isTreasurer =
    TREASURER_SLUGS.includes(roleSlug) ||
    roleSlug.includes("bendahara") ||
    roleName.toLowerCase().includes("bendahara") ||
    roleLevel === 70;

  if (isLaraAccount) {
    isTreasurer = true;
    if (!roleName) roleName = "Bendahara";
    if (!roleSlug) roleSlug = "bendahara";
    if (roleLevel < 70) roleLevel = 70;
  }

  return {
    authorized: true,
    session: {
      userId,
      assignmentId: a.id ?? userId,
      divisionId: a.division_id ?? "",
      divisionName: div?.name ?? "BPH",
      roleName,
      roleSlug,
      roleLevel,
      isApprover: role?.is_approver ?? isLaraAccount,
      isMeetingCreator: role?.is_meeting_creator ?? isLaraAccount,
      isReportCreator: role?.is_report_creator ?? isLaraAccount,
      isSecretary:
        SECRETARY_SLUGS.includes(roleSlug) ||
        roleSlug.includes("sekretaris") ||
        roleName.toLowerCase().includes("sekretaris"),
      isTreasurer,
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
  permission: "is_approver" | "is_meeting_creator" | "is_report_creator",
): Promise<
  | { authorized: true; session: AuthSession }
  | { authorized: false; error: string }
> {
  const result = await getAuthSession();

  if (!result.authorized) return result;

  const hasPermission =
    permission === "is_approver"
      ? result.session.isApprover
      : permission === "is_meeting_creator"
      ? result.session.isMeetingCreator
      : result.session.isReportCreator;

  if (!hasPermission) {
    const labels: Record<string, string> = {
      is_approver: "approval",
      is_meeting_creator: "membuat rapat",
      is_report_creator: "membuat/menyetor laporan",
    };
    return {
      authorized: false,
      error: `Akses ditolak. Anda tidak memiliki izin ${labels[permission]}.`,
    };
  }

  return result;
}

/**
 * Hanya Sekretaris Panitia (sekretaris-1, sekretaris-2) yang diizinkan.
 * Digunakan untuk aksi memproses dan menyelesaikan surat.
 */
export async function requireSecretary(): Promise<
  | { authorized: true; session: AuthSession }
  | { authorized: false; error: string }
> {
  const result = await getAuthSession();

  if (!result.authorized) return result;

  if (!result.session.isSecretary && result.session.roleLevel < 80) {
    return {
      authorized: false,
      error: "Akses ditolak. Hanya Sekretaris Panitia yang dapat memproses surat.",
    };
  }

  return result;
}

/**
 * Hanya Bendahara (atau Pimpinan BPH level >= 55) yang diizinkan.
 * Digunakan untuk halaman Pembukuan Bendahara.
 */
export async function requireTreasurer(): Promise<
  | { authorized: true; session: AuthSession }
  | { authorized: false; error: string }
> {
  const result = await getAuthSession();

  if (!result.authorized) return result;

  if (!result.session.isTreasurer && result.session.roleLevel < 55) {
    return {
      authorized: false,
      error: "Akses ditolak. Hanya Bendahara dan Pengurus yang dapat mengakses halaman ini.",
    };
  }

  return result;
}
