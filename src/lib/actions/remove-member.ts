"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

type RemoveState = { error?: string; success?: boolean } | null;

export async function removeMember(prevState: RemoveState, formData: FormData): Promise<RemoveState> {
  const auth = await createClient();
  const { data: authData } = await auth.auth.getUser();
  const userId = authData?.user?.id;

  if (!userId) return { error: "Unauthorized" };

  const admin = createAdminClient();

  const { data: callerAssignment } = await admin
    .from("committee_assignments")
    .select(`
      id,
      division_id,
      role:roles(name, slug, level)
    `)
    .eq("committee_year_id", YEAR_ID)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (!callerAssignment) return { error: "Anda tidak terdaftar sebagai panitia aktif." };

  const a = callerAssignment as any;
  const callerLevel = a.role?.level ?? 0;

  if (callerLevel < 55) {
    return { error: "Anda tidak memiliki izin untuk menghapus anggota." };
  }

  const targetId = formData.get("target_id") as string;
  if (!targetId) return { error: "Target tidak ditemukan." };

  // Get target's assignment details for permission check
  const { data: targetAssignment } = await admin
    .from("committee_assignments")
    .select(`
      id,
      division_id,
      role:roles(name, slug, level)
    `)
    .eq("id", targetId)
    .eq("committee_year_id", YEAR_ID)
    .maybeSingle();

  if (!targetAssignment) return { error: "Anggota tidak ditemukan." };

  const t = targetAssignment as any;
  const targetLevel = t.role?.level ?? 0;

  // BPH (≥75) can remove anyone. Coordinator/Wakord (55-74) can only remove lower-level in their division.
  if (callerLevel < 75) {
    if (t.division_id !== a.division_id) {
      return { error: "Anda hanya dapat menghapus anggota di divisi sendiri." };
    }
    if (targetLevel >= callerLevel) {
      return { error: "Anda tidak dapat menghapus anggota dengan level yang sama atau lebih tinggi." };
    }
  }

  // Don't allow self-removal
  if (targetId === a.id) {
    return { error: "Anda tidak dapat menghapus diri sendiri." };
  }

  const { error } = await admin
    .from("committee_assignments")
    .update({ is_active: false })
    .eq("id", targetId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/members");
  return { success: true };
}
