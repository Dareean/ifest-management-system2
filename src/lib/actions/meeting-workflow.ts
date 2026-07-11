"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { notifyAllMembers } from "./notifications";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

export async function updateRsvp(inviteeId: string, status: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("meeting_invitees")
    .update({ rsvp_status: status })
    .eq("id", inviteeId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/meetings");
  return { success: true };
}

export async function saveNotes(prevState: unknown, formData: FormData) {
  const auth = await createClient();
  const { data: authData } = await auth.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) return { error: "Unauthorized" };

  const admin = createAdminClient();

  const { data: callerAssignment } = await admin
    .from("committee_assignments")
    .select("id, role:roles(is_approver)")
    .eq("committee_year_id", YEAR_ID)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();
  if (!callerAssignment) return { error: "Anda tidak terdaftar sebagai panitia aktif." };

  const callerId = (callerAssignment as any).id;
  const callerIsApprover = !!(callerAssignment as any).role?.is_approver;

  const meetingId = formData.get("meetingId") as string;
  const content = formData.get("content") as string;
  const decisionPointsRaw = formData.get("decisionPoints") as string;
  const actionItemsRaw = formData.get("actionItems") as string;

  let decisionPoints: string[] = [];
  let actionItems: string[] = [];

  try {
    decisionPoints = decisionPointsRaw ? JSON.parse(decisionPointsRaw) : [];
  } catch {}
  try {
    actionItems = actionItemsRaw ? JSON.parse(actionItemsRaw) : [];
  } catch {}

  const { data: meeting } = await admin
    .from("meetings")
    .select("creator_id, scope")
    .eq("id", meetingId)
    .single();

  if (!meeting) return { error: "Meeting not found" };

  const m = meeting as any;
  const isCreator = m.creator_id === callerId;
  const isSekretarisAllMeeting = callerIsApprover && m.scope === "all";

  if (!isCreator && !isSekretarisAllMeeting) {
    return { error: "Anda tidak berwenang menulis notulensi rapat ini." };
  }

  const { data: existing } = await admin
    .from("meeting_notes")
    .select("id")
    .eq("meeting_id", meetingId)
    .maybeSingle();

  if (existing) {
    const { error } = await admin
      .from("meeting_notes")
      .update({
        content,
        decision_points: decisionPoints,
        action_items: actionItems,
      })
      .eq("id", existing.id);

    if (error) return { error: error.message };
  } else {
    const { error } = await admin.from("meeting_notes").insert({
      meeting_id: meetingId,
      writer_id: callerId,
      content,
      decision_points: decisionPoints,
      action_items: actionItems,
    });

    if (error) return { error: error.message };
  }

  revalidatePath(`/dashboard/meetings/${meetingId}`);
  return { success: true };
}

export async function publishNotes(meetingId: string) {
  const admin = createAdminClient();

  const { data: meeting } = await admin
    .from("meetings")
    .select("title")
    .eq("id", meetingId)
    .single();

  const { error } = await admin
    .from("meeting_notes")
    .update({ published_at: new Date().toISOString() })
    .eq("meeting_id", meetingId);

  if (error) return { error: error.message };

  if (meeting) {
    await notifyAllMembers(
      "meeting",
      `Notula rapat diterbitkan: ${(meeting as any).title}`,
      "Notula rapat sudah bisa diakses oleh semua anggota.",
    );
  }

  revalidatePath(`/dashboard/meetings/${meetingId}`);
  return { success: true };
}

export async function endMeeting(meetingId: string) {
  const admin = createAdminClient();

  const { error } = await admin
    .from("meetings")
    .update({ ended_at: new Date().toISOString() })
    .eq("id", meetingId);

  if (error) return { error: error.message };
  revalidatePath(`/dashboard/meetings/${meetingId}`);
  return { success: true };
}
