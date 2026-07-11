"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { notifyDivision } from "./notifications";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

type ActionState = { error?: string; success?: boolean } | null;

export async function createLetter(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = createAdminClient();
  const authSupabase = await createClient();
  const { data: authData } = await authSupabase.auth.getUser();
  const userId = authData?.user?.id;

  if (!userId) return { error: "Silakan login terlebih dahulu" };

  const letterType = formData.get("letterType") as string;
  const subject = formData.get("subject") as string;
  const body = formData.get("body") as string;
  const deadlineAt = formData.get("deadlineAt") as string;
  const targetInstitution = formData.get("targetInstitution") as string;
  const category = formData.get("category") as string;
  const requestOptions = formData.get("requestOptions") as string;
  const priority = formData.get("priority") as string;

  if (!letterType || !subject || !body) {
    return { error: "Nama surat, jenis surat, dan maksud surat harus diisi" };
  }

  const { data: assignment } = await supabase
    .from("committee_assignments")
    .select("id, division_id")
    .eq("committee_year_id", YEAR_ID)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (!assignment) {
    return { error: "Anda belum terdaftar sebagai anggota kepanitiaan aktif" };
  }

  const { data: newLetter, error: letterErr } = await supabase
    .from("letter_requests")
    .insert({
      committee_year_id: YEAR_ID,
      requester_id: assignment.id,
      current_handler_id: null,
      division_id: assignment.division_id,
      letter_type: letterType,
      subject,
      body,
      deadline_at: deadlineAt || null,
      target_institution: targetInstitution || null,
      category: category || null,
      request_options: requestOptions || null,
      priority: priority || "sedang",
      status: "requested",
    })
    .select("id")
    .single();

  if (letterErr) return { error: letterErr.message };

  // Notify BPH division (sekretaris)
  const { data: bphDiv } = await supabase
    .from("divisions")
    .select("id")
    .eq("committee_year_id", YEAR_ID)
    .eq("slug", "bph")
    .maybeSingle();

  if (bphDiv) {
    await notifyDivision(bphDiv.id, "letter", `Surat baru: ${subject}`, `Jenis: ${letterType}`);
  }

  revalidatePath("/dashboard/letters");
  return { success: true };
}
