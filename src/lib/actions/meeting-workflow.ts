"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { notifyAllMembers } from "@/lib/internal-notifications";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

async function requireMeetingAuth(meetingId: string) {
  const auth = await createClient();
  const { data: authData } = await auth.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) return null;

  const admin = createAdminClient();
  const { data: caller } = await admin
    .from("committee_assignments")
    .select("id, role:roles(is_approver)")
    .eq("committee_year_id", YEAR_ID)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();
  if (!caller) return null;

  const callerId = (caller as any).id;
  const callerIsApprover = !!(caller as any).role?.is_approver;

  const { data: meeting } = await admin
    .from("meetings")
    .select("creator_id, scope")
    .eq("id", meetingId)
    .single();
  if (!meeting) return null;

  const m = meeting as any;
  const isCreator = m.creator_id === callerId;
  const isSekretarisAllMeeting = callerIsApprover && m.scope === "all";

  if (!isCreator && !isSekretarisAllMeeting) return null;

  return { admin, callerId, meeting };
}

export async function updateRsvp(inviteeId: string, status: string, absenceReason?: string) {
  const auth = await createClient();
  const { data: authData } = await auth.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) return { error: "Silakan login terlebih dahulu" };

  const admin = createAdminClient();
  const { data: caller } = await admin
    .from("committee_assignments")
    .select("id")
    .eq("committee_year_id", YEAR_ID)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();
  if (!caller) return { error: "Anda tidak terdaftar sebagai panitia aktif." };

  const callerId = (caller as any).id;

  // Verify the invitee belongs to the caller
  const { data: invitee } = await admin
    .from("meeting_invitees")
    .select("committee_assignment_id")
    .eq("id", inviteeId)
    .single();
  if (!invitee || (invitee as any).committee_assignment_id !== callerId) {
    return { error: "Anda hanya bisa mengubah status RSVP Anda sendiri." };
  }

  const updatePayload: Record<string, unknown> = { rsvp_status: status };
  if (status === "declined" && absenceReason) {
    updatePayload.absence_reason = absenceReason;
  } else if (status === "accepted") {
    updatePayload.absence_reason = null;
  }

  const { error } = await admin
    .from("meeting_invitees")
    .update(updatePayload)
    .eq("id", inviteeId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/meetings");
  return { success: true };
}

/**
 * Digunakan oleh penyelenggara rapat (creator / approver) untuk
 * menandai kehadiran anggota tertentu secara manual.
 */
export async function markAttendance(
  meetingId: string,
  inviteeId: string,
  status: "accepted" | "declined" | "pending",
): Promise<{ error?: string; success?: boolean }> {
  const auth = await createClient();
  const { data: authData } = await auth.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) return { error: "Silakan login terlebih dahulu" };

  const admin = createAdminClient();

  // Cek caller adalah panitia aktif
  const { data: caller } = await admin
    .from("committee_assignments")
    .select("id, role:roles(is_approver)")
    .eq("committee_year_id", YEAR_ID)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();
  if (!caller) return { error: "Anda tidak terdaftar sebagai panitia aktif." };

  const callerId = (caller as any).id;
  const callerIsApprover = !!(caller as any).role?.is_approver;

  // Cek meeting & otorisasi
  const { data: meeting } = await admin
    .from("meetings")
    .select("creator_id, scope, ended_at")
    .eq("id", meetingId)
    .single();
  if (!meeting) return { error: "Rapat tidak ditemukan." };

  const m = meeting as any;
  const isCreator = m.creator_id === callerId;
  const isSekretarisAllMeeting = callerIsApprover && m.scope === "all";

  if (!isCreator && !isSekretarisAllMeeting) {
    return { error: "Anda tidak berwenang mengelola kehadiran rapat ini." };
  }

  // Pastikan invitee memang ada di rapat ini
  const { data: invitee } = await admin
    .from("meeting_invitees")
    .select("id")
    .eq("id", inviteeId)
    .eq("meeting_id", meetingId)
    .single();
  if (!invitee) return { error: "Peserta tidak ditemukan di rapat ini." };

  const { error } = await admin
    .from("meeting_invitees")
    .update({ rsvp_status: status })
    .eq("id", inviteeId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/meetings/${meetingId}`);
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
  const auth = await requireMeetingAuth(meetingId);
  if (!auth) return { error: "Anda tidak berwenang mempublikasikan notulensi rapat ini." };
  const { admin } = auth;

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
      true, // urgent: send email
    );
  }

  revalidatePath(`/dashboard/meetings/${meetingId}`);
  return { success: true };
}

export async function endMeeting(meetingId: string) {
  const auth = await requireMeetingAuth(meetingId);
  if (!auth) return { error: "Anda tidak berwenang mengakhiri rapat ini." };
  const { admin } = auth;

  const { error } = await admin
    .from("meetings")
    .update({ ended_at: new Date().toISOString() })
    .eq("id", meetingId);

  if (error) return { error: error.message };
  revalidatePath(`/dashboard/meetings/${meetingId}`);
  return { success: true };
}
