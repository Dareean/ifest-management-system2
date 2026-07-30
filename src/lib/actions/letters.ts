"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { notifyDivision } from "@/lib/internal-notifications";
import { formatLetterNumber } from "@/lib/utils/letter-number";

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

  // 1. Count existing letters of same type to determine sequence number
  const { count, error: countErr } = await supabase
    .from("letter_requests")
    .select("id", { count: "exact", head: true })
    .eq("committee_year_id", YEAR_ID)
    .eq("letter_type", letterType);

  if (countErr) {
    return { error: `Gagal menghitung nomor urut surat: ${countErr.message}` };
  }

  const nextSeq = (count ?? 0) + 1;

  // 2. Fetch the active year label to construct the dynamic committee code
  const { data: yearData } = await supabase
    .from("committee_years")
    .select("label")
    .eq("id", YEAR_ID)
    .maybeSingle();

  const yearLabel = yearData?.label || "I-FEST 2026";
  const createdAt = new Date().toISOString();

  // 3. Generate letter number
  const letterNumber = formatLetterNumber(nextSeq, letterType, category, yearLabel, createdAt);

  const insertPayload: any = {
    committee_year_id: YEAR_ID,
    requester_id: assignment.id,
    current_handler_id: null,
    division_id: assignment.division_id,
    letter_type: letterType,
    letter_number: letterNumber,
    subject,
    body,
    deadline_at: deadlineAt ? new Date(deadlineAt + "+08:00").toISOString() : null,
    target_institution: targetInstitution || null,
    category: category || null,
    request_options: requestOptions || null,
    priority: priority || "sedang",
    status: "requested",
  };

  let { data: newLetter, error: letterErr } = await supabase
    .from("letter_requests")
    .insert(insertPayload)
    .select("id")
    .maybeSingle();

  // Fallback if the database does not have the letter_number column yet
  if (letterErr && (letterErr.message.includes("letter_number") || letterErr.message.includes("column"))) {
    console.warn("letter_number column not found, retrying insert without it.");
    delete insertPayload.letter_number;
    const retryResult = await supabase
      .from("letter_requests")
      .insert(insertPayload)
      .select("id")
      .maybeSingle();
    newLetter = retryResult.data;
    letterErr = retryResult.error;
  }

  if (letterErr) return { error: letterErr.message };

  // Notify BPH division (sekretaris)
  const { data: bphDiv } = await supabase
    .from("divisions")
    .select("id")
    .eq("committee_year_id", YEAR_ID)
    .eq("slug", "bph")
    .maybeSingle();

  if (bphDiv) {
    await notifyDivision(bphDiv.id, "letter", `Surat baru: ${subject}`, `Jenis: ${letterType}`, true);
  }

  revalidatePath("/dashboard/letters");
  return { success: true };
}
