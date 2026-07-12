"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/authorize";
import { sendBroadcastEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

export async function sendBroadcastEmailAction(prevState: unknown, formData: FormData) {
  // 1. Authenticate that the user has level 100 (PIC / Penanggung Jawab)
  const auth = await requireRole(100);
  if (!auth.authorized) {
    return { error: auth.error };
  }

  // 2. Extract and validate fields
  const subject = formData.get("subject") as string;
  const boxTitle = formData.get("boxTitle") as string;
  const body = formData.get("body") as string;

  if (!subject || !subject.trim()) {
    return { error: "Subjek email harus diisi" };
  }
  if (!body || !body.trim()) {
    return { error: "Isi pesan email harus diisi" };
  }

  try {
    const admin = createAdminClient();

    // 3. Fetch all active committee assignments for the current year
    const { data: assignments, error: assError } = await admin
      .from("committee_assignments")
      .select("user_id")
      .eq("committee_year_id", YEAR_ID)
      .eq("is_active", true);

    if (assError) {
      return { error: `Gagal memuat panitia: ${assError.message}` };
    }
    if (!assignments || assignments.length === 0) {
      return { error: "Tidak ada panitia aktif yang ditemukan." };
    }

    // 4. Fetch profiles (full names)
    const { data: profiles, error: profError } = await admin
      .from("profiles")
      .select("id, full_name");

    if (profError) {
      return { error: `Gagal memuat profil: ${profError.message}` };
    }

    // 5. Fetch all auth users to retrieve their email addresses
    const { data: authUsersRes, error: authError } = await admin.auth.admin.listUsers({
      perPage: 1000,
    });

    if (authError) {
      return { error: `Gagal memuat email panitia: ${authError.message}` };
    }

    const authUsers = authUsersRes?.users ?? [];

    // 6. Map users to construct recipient data list
    const recipients = assignments
      .map((a) => {
        const profile = profiles?.find((p) => p.id === a.user_id);
        const authUser = authUsers.find((u) => u.id === a.user_id);
        return {
          email: authUser?.email,
          name: profile?.full_name ?? "Panitia I-FEST",
        };
      })
      .filter((r): r is { email: string; name: string } => !!r.email);

    if (recipients.length === 0) {
      return { error: "Tidak ada email panitia valid yang ditemukan." };
    }

    // 7. Send emails to all recipients concurrently
    await Promise.all(
      recipients.map((r) =>
        sendBroadcastEmail(r.email, r.name, subject, boxTitle, body)
      )
    );

    revalidatePath("/admin/broadcast");
    return { success: true, count: recipients.length };
  } catch (err: any) {
    return { error: `Terjadi kesalahan sistem: ${err.message || err}` };
  }
}
