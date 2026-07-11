import { notFound } from "next/navigation";
import { getMeetingDetail } from "@/lib/data/meeting-detail";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { MeetingDetailClient } from "./client";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

export default async function MeetingDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const meeting = await getMeetingDetail(id);
  if (!meeting) notFound();

  const auth = await createClient();
  const { data: authData } = await auth.auth.getUser();
  const userId = authData?.user?.id;
  let currentUserAssignmentId: string | null = null;
  let currentUserIsApprover = false;

  if (userId) {
    const admin = createAdminClient();
    const { data: assignment } = await admin
      .from("committee_assignments")
      .select("id, role:roles(is_approver)")
      .eq("committee_year_id", YEAR_ID)
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();
    if (assignment) {
      currentUserAssignmentId = (assignment as any).id;
      currentUserIsApprover = !!(assignment as any).role?.is_approver;
    }
  }

  return (
    <MeetingDetailClient
      meeting={meeting}
      currentUserAssignmentId={currentUserAssignmentId}
      currentUserIsApprover={currentUserIsApprover}
    />
  );
}
