"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { createNotification, notifyDivision } from "./notifications";
import { requirePermission } from "@/lib/auth/authorize";

export async function approveLetter(id: string) {
  const auth = await requirePermission("is_approver");
  if (!auth.authorized) return { error: auth.error };

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("letter_requests")
    .update({ status: "approved" })
    .eq("id", id);

  if (error) return { error: error.message };

  const { data: letter } = await supabase
    .from("letter_requests")
    .select("subject, division_id")
    .eq("id", id)
    .single();

  if (letter) {
    await notifyDivision(
      (letter as any).division_id,
      "letter",
      `Surat disetujui: ${(letter as any).subject}`,
      "Surat telah disetujui dan siap dikirim.",
    );
  }

  await sendStatusNotification(id, "approved");
  revalidatePath(`/dashboard/letters/${id}`);
  revalidatePath("/dashboard/letters");
  return { success: true };
}

export async function sendLetterFinal(id: string) {
  const auth = await requirePermission("is_approver");
  if (!auth.authorized) return { error: auth.error };

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("letter_requests")
    .update({ status: "sent" })
    .eq("id", id);

  if (error) return { error: error.message };

  const { data: letter } = await supabase
    .from("letter_requests")
    .select("subject, division_id")
    .eq("id", id)
    .single();

  if (letter) {
    await notifyDivision(
      (letter as any).division_id,
      "letter",
      `Surat terkirim: ${(letter as any).subject}`,
      "Surat telah dikirim ke tujuan.",
    );
  }

  await sendStatusNotification(id, "sent");
  revalidatePath(`/dashboard/letters/${id}`);
  revalidatePath("/dashboard/letters");
  return { success: true };
}

export async function requestRevision(prevState: unknown, formData: FormData) {
  const auth = await requirePermission("is_approver");
  if (!auth.authorized) return { error: auth.error };

  const supabase = createAdminClient();
  const id = formData.get("id") as string;
  const note = formData.get("note") as string;

  if (!note) return { error: "Catatan revisi harus diisi" };

  const { data: letter } = await supabase
    .from("letter_requests")
    .select("revision_count, committee_year_id, subject, division_id, requester_id")
    .eq("id", id)
    .single();

  if (!letter) return { error: "Surat tidak ditemukan" };

  const { data: firstAssignment } = await supabase
    .from("committee_assignments")
    .select("id")
    .eq("committee_year_id", letter.committee_year_id)
    .limit(1)
    .single();

  if (!firstAssignment) return { error: "No committee member found" };

  const { error: revisionErr } = await supabase.from("letter_revisions").insert({
    letter_request_id: id,
    reviewer_id: firstAssignment.id,
    note,
  });

  if (revisionErr) return { error: revisionErr.message };

  const { error: updateErr } = await supabase
    .from("letter_requests")
    .update({
      status: "in_revision",
      revision_count: (letter.revision_count ?? 0) + 1,
    })
    .eq("id", id);

  if (updateErr) return { error: updateErr.message };

  // Notify requester
  if (letter.requester_id) {
    await createNotification(
      letter.requester_id,
      "letter",
      `Revisi surat: ${letter.subject}`,
      `Catatan: ${note}`,
    );
  }

  await sendStatusNotification(id, "in_revision");
  revalidatePath(`/dashboard/letters/${id}`);
  revalidatePath("/dashboard/letters");
  return { success: true };
}

async function sendStatusNotification(letterId: string, newStatus: string) {
  try {
    const supabase = createAdminClient();
    const { data: letter } = await supabase
      .from("letter_requests")
      .select("subject, requester:committee_assignments!requester_id(id, user_id, user:profiles(full_name))")
      .eq("id", letterId)
      .single();

    if (letter) {
      const { sendEmailNotification } = await import("@/lib/email");
      const requester = (letter as any).requester;
      const name = requester?.user?.full_name ?? "PIC";

      const authUser = await supabase.auth.admin.getUserById(requester?.user_id);
      const email = authUser?.data?.user?.email;

      if (email) {
        const statusLabels: Record<string, string> = {
          approved: "telah disetujui",
          in_revision: "perlu direvisi",
          sent: "telah dikirim",
        };

        await sendEmailNotification(
          email,
          name,
          `[Surat] ${letter.subject} — ${statusLabels[newStatus] ?? newStatus}`,
          `<p>Status surat <strong>${letter.subject}</strong> telah berubah menjadi <strong>${statusLabels[newStatus] ?? newStatus}</strong>.</p>
           <p>Silakan cek di dashboard I-FEST Management System untuk detail.</p>`,
        );
      }
    }
  } catch {
    // non-blocking
  }
}
