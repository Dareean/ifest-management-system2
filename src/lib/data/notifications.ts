import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  isRead: boolean;
  emailSent: boolean;
  createdAt: string;
}

export async function getUserNotifications(limit = 20): Promise<NotificationItem[]> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;

  if (!userId) return [];

  const admin = createAdminClient();

  const { data: assignment } = await admin
    .from("committee_assignments")
    .select("id")
    .eq("committee_year_id", YEAR_ID)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (!assignment) return [];

  const { data } = await admin
    .from("notifications")
    .select("id, type, title, body, is_read, email_sent, created_at")
    .eq("committee_assignment_id", assignment.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((n: any) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    isRead: n.is_read,
    emailSent: n.email_sent,
    createdAt: n.created_at,
  }));
}

export async function getUnreadCount(): Promise<number> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;

  if (!userId) return 0;

  const admin = createAdminClient();

  const { data: assignment } = await admin
    .from("committee_assignments")
    .select("id")
    .eq("committee_year_id", YEAR_ID)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (!assignment) return 0;

  const { count } = await admin
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("committee_assignment_id", assignment.id)
    .eq("is_read", false);

  return count ?? 0;
}
