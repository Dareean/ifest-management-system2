"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { createNotification, notifyDivision } from "@/lib/internal-notifications";
import { requirePermission, requireRole, requireSecretary } from "@/lib/auth/authorize";

export async function startProcessingLetter(id: string) {
  const auth = await requireSecretary();
  if (!auth.authorized) return { error: auth.error };

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("letter_requests")
    .update({ status: "processing" })
    .eq("id", id);

  if (error) return { error: error.message };

  const { data: letter } = await supabase
    .from("letter_requests")
    .select("subject, division_id, requester_id")
    .eq("id", id)
    .single();

  if (letter) {
    await notifyDivision(
      (letter as any).division_id,
      "letter",
      `Surat diproses: ${(letter as any).subject}`,
      "Surat Anda sedang dalam proses pengerjaan oleh sekretaris.",
    );
    if ((letter as any).requester_id) {
      await createNotification(
        (letter as any).requester_id,
        "letter",
        `Surat diproses: ${(letter as any).subject}`,
        "Surat Anda sedang dalam proses pengerjaan oleh sekretaris.",
      );
    }
  }

  await sendStatusNotification(id, "processing");
  revalidatePath(`/dashboard/letters/${id}`);
  revalidatePath("/dashboard/letters");
  return { success: true };
}

export async function completeLetter(id: string, finalDocumentUrl: string) {
  const auth = await requireSecretary();
  if (!auth.authorized) return { error: auth.error };

  if (!finalDocumentUrl) return { error: "Link Google Drive dokumen final harus diisi." };

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("letter_requests")
    .update({ 
      status: "sent",
      final_document_url: finalDocumentUrl
    })
    .eq("id", id);

  if (error) return { error: error.message };

  const { data: letter } = await supabase
    .from("letter_requests")
    .select("subject, division_id, requester_id")
    .eq("id", id)
    .single();

  if (letter) {
    await notifyDivision(
      (letter as any).division_id,
      "letter",
      `Surat selesai: ${(letter as any).subject}`,
      "Surat telah selesai dibuat. Silakan akses link Google Drive di detail pengajuan.",
    );
    if ((letter as any).requester_id) {
      await createNotification(
        (letter as any).requester_id,
        "letter",
        `Surat selesai: ${(letter as any).subject}`,
        "Surat Anda telah selesai. Silakan akses link Google Drive di detail pengajuan.",
      );
    }
  }

  await sendStatusNotification(id, "sent");
  revalidatePath(`/dashboard/letters/${id}`);
  revalidatePath("/dashboard/letters");
  return { success: true };
}

export async function requestRevision(prevState: unknown, formData: FormData) {
  const auth = await requireRole(0);
  if (!auth.authorized) return { error: auth.error };
  const assignmentId = auth.session.assignmentId;

  const id = formData.get("id") as string;
  const note = formData.get("note") as string;

  if (!note) return { error: "Catatan revisi harus diisi" };

  const supabase = createAdminClient();

  const { data: letter } = await supabase
    .from("letter_requests")
    .select("revision_count, committee_year_id, subject, division_id, requester_id")
    .eq("id", id)
    .single();

  if (!letter) return { error: "Surat tidak ditemukan" };

  // Verify that the user is the requester of this letter
  if (letter.requester_id !== assignmentId) {
    return { error: "Akses ditolak. Hanya pengaju asli surat yang dapat meminta revisi." };
  }

  // Insert revision note with requester's assignment ID as author (reviewer_id)
  const { error: revisionErr } = await supabase.from("letter_revisions").insert({
    letter_request_id: id,
    reviewer_id: assignmentId,
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

  // Notify the BPH / Sekretaris panitia about the revision request
  const { data: bphDivision } = await supabase
    .from("divisions")
    .select("id")
    .eq("slug", "bph")
    .maybeSingle();

  if (bphDivision) {
    await notifyDivision(
      bphDivision.id,
      "letter",
      `Permohonan revisi surat: ${letter.subject}`,
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
          processing: "sedang diproses",
          in_revision: "perlu direvisi",
          sent: "telah selesai (Selesai)",
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


