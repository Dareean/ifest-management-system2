"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { notifyAllMembers } from "./notifications";

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
  const supabase = createAdminClient();
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

  const { data: meeting } = await supabase
    .from("meetings")
    .select("committee_year_id, title")
    .eq("id", meetingId)
    .single();

  if (!meeting) return { error: "Meeting not found" };

  const { data: firstAssignment } = await supabase
    .from("committee_assignments")
    .select("id")
    .eq("committee_year_id", meeting.committee_year_id)
    .limit(1)
    .single();

  if (!firstAssignment) return { error: "No committee member found" };

  const { data: existing } = await supabase
    .from("meeting_notes")
    .select("id")
    .eq("meeting_id", meetingId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("meeting_notes")
      .update({
        content,
        decision_points: decisionPoints,
        action_items: actionItems,
      })
      .eq("id", existing.id);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("meeting_notes").insert({
      meeting_id: meetingId,
      writer_id: firstAssignment.id,
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
  const supabase = createAdminClient();

  const { data: meeting } = await supabase
    .from("meetings")
    .select("title")
    .eq("id", meetingId)
    .single();

  const { error } = await supabase
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
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("meetings")
    .update({ ended_at: new Date().toISOString() })
    .eq("id", meetingId);

  if (error) return { error: error.message };
  revalidatePath(`/dashboard/meetings/${meetingId}`);
  return { success: true };
}
