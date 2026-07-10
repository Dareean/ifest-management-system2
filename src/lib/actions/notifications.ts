"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

export async function markNotificationRead(notificationId: string) {
  const admin = createAdminClient();
  await admin.from("notifications").update({ is_read: true }).eq("id", notificationId);
  revalidatePath("/");
}

export async function markAllNotificationsRead() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) return;

  const admin = createAdminClient();

  const { data: assignment } = await admin
    .from("committee_assignments")
    .select("id")
    .eq("committee_year_id", YEAR_ID)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (assignment) {
    await admin
      .from("notifications")
      .update({ is_read: true })
      .eq("committee_assignment_id", assignment.id)
      .eq("is_read", false);
  }

  revalidatePath("/");
}

async function sendEmailForNotification(
  assignmentId: string,
  type: string,
  title: string,
  body?: string,
) {
  try {
    const admin = createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userData }: any = await admin
      .from("committee_assignments")
      .select("user:profiles!inner(full_name), user_id")
      .eq("id", assignmentId)
      .single();

    const fullName = userData?.user?.full_name ?? "";
    const profileId = userData?.user_id;

    if (!profileId) return;

    // Get email from auth.users via admin API
    const { data: authUser } = await admin.auth.admin.getUserById(profileId);
    const email = authUser?.user?.email;

    if (!email) return;

    const { sendEmailNotification } = await import("@/lib/email");
    let html = `<p>Halo <strong>${fullName}</strong>,</p><p>${body ?? title}</p>`;
    if (type === "task") {
      html = `<p>Halo <strong>${fullName}</strong>,</p><p>Ada tugas baru untuk Anda:</p><p><strong>${title}</strong></p>${body ? `<p>${body}</p>` : ""}`;
    } else if (type === "letter") {
      html = `<p>Halo <strong>${fullName}</strong>,</p><p>Pembaruan surat:</p><p><strong>${title}</strong></p>${body ? `<p>${body}</p>` : ""}`;
    } else if (type === "meeting") {
      html = `<p>Halo <strong>${fullName}</strong>,</p><p>Undangan rapat:</p><p><strong>${title}</strong></p>${body ? `<p>${body}</p>` : ""}`;
    }

    await sendEmailNotification(email, fullName, `[${type.toUpperCase()}] ${title}`, html);
  } catch {
    // Email failure is non-critical
  }
}

export async function createNotification(
  assignmentId: string,
  type: string,
  title: string,
  body?: string,
) {
  const admin = createAdminClient();
  await admin.from("notifications").insert({
    committee_assignment_id: assignmentId,
    type,
    title,
    body: body ?? null,
  });

  // Send email (fire-and-forget)
  sendEmailForNotification(assignmentId, type, title, body);
}

export async function notifyDivision(
  divisionId: string,
  type: string,
  title: string,
  body?: string,
) {
  const admin = createAdminClient();

  const { data: members } = await admin
    .from("committee_assignments")
    .select("id")
    .eq("committee_year_id", YEAR_ID)
    .eq("division_id", divisionId)
    .eq("is_active", true);

  if (members) {
    await admin.from("notifications").insert(
      members.map((m) => ({
        committee_assignment_id: m.id,
        type,
        title,
        body: body ?? null,
      })),
    );

    // Send email to each member
    for (const m of members) {
      sendEmailForNotification(m.id, type, title, body);
    }
  }
}

export async function notifyAllMembers(
  type: string,
  title: string,
  body?: string,
) {
  const admin = createAdminClient();

  const { data: members } = await admin
    .from("committee_assignments")
    .select("id")
    .eq("committee_year_id", YEAR_ID)
    .eq("is_active", true);

  if (members) {
    await admin.from("notifications").insert(
      members.map((m) => ({
        committee_assignment_id: m.id,
        type,
        title,
        body: body ?? null,
      })),
    );

    for (const m of members) {
      sendEmailForNotification(m.id, type, title, body);
    }
  }
}
