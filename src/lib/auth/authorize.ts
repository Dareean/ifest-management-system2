import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";

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

/** Kolom yang dibutuhkan dari committee_assignments (dengan join divisi & role). */
const ASSIGNMENT_SELECT = `
  id,
  division_id,
  division:divisions(name),
  role:roles(name, slug, level, is_approver, is_meeting_creator, is_report_creator)
`;

/**
 * Ambil assignment user dengan filter tertentu.
 * Mengembalikan baris pertama atau null — TIDAK melempar error saat kosong.
 * `.limit(1)` dipakai (bukan .maybeSingle()) supaya tidak error ketika
 * database kebetulan punya baris ganda untuk user yang sama.
 */
async function queryFirst(
  client: SupabaseClient,
  userId: string,
  filters: { yearOnly?: boolean } = {},
): Promise<{ row: Record<string, unknown> | null; error: string | null }> {
  let query = client
    .from("committee_assignments")
    .select(ASSIGNMENT_SELECT)
    .eq("user_id", userId);

  if (filters.yearOnly) {
    query = query.eq("committee_year_id", YEAR_ID).eq("is_active", true);
  }

  const { data, error } = await (query as {
    limit: (n: number) => PromiseLike<{
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any[] | null;
      error: { message: string } | null;
    }>;
  }).limit(1);

  if (error) return { row: null, error: error.message };
  return { row: (data?.[0] as Record<string, unknown>) ?? null, error: null };
}

async function getAuthSession(): Promise<AuthResult> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  const userEmail = authData?.user?.email ?? "";

  if (!userId) {
    redirect("/login");
  }

  // ── Pilih client untuk membaca data panitia ──
  // Prioritas 1: service-role client (melewati RLS) jika key tersedia.
  // Prioritas 2 (fallback penting): user-scoped client biasa. Kebijakan
  // RLS database mengizinkan user 'authenticated' membaca tabel panitia,
  // jadi query ini VALID tanpa service-role key.
  //
  // BUG LAMA: kalau SUPABASE_SERVICE_ROLE_KEY tidak terpasang di suatu
  // environment, admin client diam-diam memakai anon key -> RLS memblokir
  // -> semua halaman menolak akses WALAU user sudah login dengan benar.
  let db: SupabaseClient = supabase;
  if (hasServiceRoleKey()) {
    try {
      db = createAdminClient();
    } catch {
      console.warn(
        "[auth] Service-role client gagal dibuat, fallback ke user-scoped client (RLS).",
      );
      db = supabase;
    }
  }

  // Stage 1: exact match by committee_year_id & user_id & is_active
  let assignment: Record<string, unknown> | null = null;
  const stage1 = await queryFirst(db, userId, { yearOnly: true });
  if (stage1.error) console.warn("[auth] Stage 1:", stage1.error);
  assignment = stage1.row;

  // Stage 2: fallback by user_id only (abaikan committee_year mismatch)
  if (!assignment) {
    const stage2 = await queryFirst(db, userId);
    if (stage2.error) console.warn("[auth] Stage 2:", stage2.error);
    assignment = stage2.row;
  }

  // Stage 3: fallback via profiles lookup (pastikan user ada di profiles)
  let profileName = "";
  if (!assignment) {
    try {
      const { data: userProfile } = await db
        .from("profiles")
        .select("id, full_name, nim")
        .eq("id", userId)
        .limit(1);

      if (userProfile && userProfile.length > 0) {
        profileName =
          (userProfile[0] as { full_name?: string }).full_name ?? "";
        const retry = await queryFirst(db, userId);
        assignment = retry.row;
      }
    } catch (e) {
      console.warn("[auth] Stage 3 gagal:", e);
    }
  }

  // Stage 4: safety net akun Bendahara (Lara)
  const isLaraAccount =
    userEmail.toLowerCase().includes("lara") ||
    profileName.toLowerCase().includes("lara");

  if (!assignment && !isLaraAccount) {
    return {
      authorized: false,
      error:
        "Anda tidak memiliki akses ke sistem ini. Pastikan akun Anda sudah didaftarkan sebagai panitia oleh PIC.",
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = (assignment ?? {}) as any;
  const rawRole = a.role;
  const role = Array.isArray(rawRole) ? rawRole[0] : rawRole;
  const rawDiv = a.division;
  const div = Array.isArray(rawDiv) ? rawDiv[0] : rawDiv;

  let roleSlug: string = role?.slug ?? "";
  let roleName: string = role?.name ?? "";
  let roleLevel: number = role?.level ?? 0;

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
      error:
        "Akses ditolak. Hanya Bendahara dan Pengurus yang dapat mengakses halaman ini.",
    };
  }

  return result;
}
