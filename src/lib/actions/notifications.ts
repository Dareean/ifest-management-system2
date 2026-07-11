"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

async function requireActiveMember() {
  const auth = await createClient();
  const { data: authData } = await auth.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) return null;

  const admin = createAdminClient();
  const { data: assignment } = await admin
    .from("committee_assignments")
    .select("id")
    .eq("committee_year_id", YEAR_ID)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (!assignment) return null;
  return assignment as any;
}

export async function markNotificationRead(notificationId: string) {
  const member = await requireActiveMember();
  if (!member) return;

  const admin = createAdminClient();
  await admin
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("committee_assignment_id", member.id);
  revalidatePath("/");
}

export async function markAllNotificationsRead() {
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
