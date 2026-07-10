"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { notifyAllMembers } from "./notifications";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

type ActionState = { error?: string; success?: boolean } | null;

export async function createLetter(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = createAdminClient();

  const letterType = formData.get("letterType") as string;
  const subject = formData.get("subject") as string;
  const body = formData.get("body") as string;

  const { data: firstAssignment, error: assignErr } = await supabase
    .from("committee_assignments")
    .select("id, division_id")
    .eq("committee_year_id", YEAR_ID)
    .limit(1)
    .single();

  if (assignErr || !firstAssignment) {
    return { error: "No committee member found. Please assign personel first." };
  }

  const { data: newLetter } = await supabase
    .from("letter_requests")
    .insert({
      committee_year_id: YEAR_ID,
      requester_id: firstAssignment.id,
      division_id: firstAssignment.division_id,
      letter_type: letterType,
      subject,
      body,
      status: "requested",
    })
    .select("id")
    .single();

  if (newLetter) {
    await notifyAllMembers("letter", `Surat baru: ${subject}`, `Jenis: ${letterType}`);
  }

  // Send email notification
  try {
    const { sendEmailNotification } = await import("@/lib/email");
    await sendEmailNotification(
      "admin@hmtiuntad.ac.id",
      "Admin I-FEST",
      `[Surat Baru] ${subject}`,
      `<p>Permohonan surat baru telah diajukan:</p>
       <p><strong>Jenis:</strong> ${letterType}<br>
       <strong>Perihal:</strong> ${subject}</p>`,
    );
  } catch {}

  revalidatePath("/dashboard/letters");
  return { success: true };
}
