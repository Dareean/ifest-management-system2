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

// Helper to create notifications (used by other server actions)
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
}

// Create notifications for all members of a division
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
  }
}

// Create notifications for all active committee members
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
  }
}
