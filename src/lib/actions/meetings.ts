"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { notifyAllMembers } from "./notifications";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

type ActionState = { error?: string; success?: boolean } | null;

export async function createMeeting(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = createAdminClient();

  const title = formData.get("title") as string;
  const agenda = formData.get("agenda") as string;
  const meetingType = formData.get("meetingType") as string;
  const startedAt = formData.get("startedAt") as string;
  const meetingLink = formData.get("meetingLink") as string;
  const location = formData.get("location") as string;

  const { data: firstAssignment } = await supabase
    .from("committee_assignments")
    .select("id")
    .eq("committee_year_id", YEAR_ID)
    .limit(1)
    .single();

  if (!firstAssignment) {
    return { error: "No committee member found." };
  }

  const { data: meeting, error } = await supabase
    .from("meetings")
    .insert({
      committee_year_id: YEAR_ID,
      creator_id: firstAssignment.id,
      title,
      agenda: agenda || null,
      meeting_type: meetingType || "scheduled",
      meeting_link: meetingLink || null,
      location: location || null,
      started_at: startedAt,
    })
    .select("id")
    .single();

  if (error || !meeting) return { error: error?.message ?? "Failed to create meeting" };

  // Notify all members
  const meetingDate = new Date(startedAt).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long",
    hour: "2-digit", minute: "2-digit",
  });
  await notifyAllMembers("meeting", `Rapat baru: ${title}`, meetingDate);

  // Send email invitations
  try {
    const { sendMeetingInvite } = await import("@/lib/email");
    const { data: members } = await supabase
      .from("committee_assignments")
      .select("user:users(email, full_name)")
      .eq("committee_year_id", YEAR_ID)
      .eq("is_active", true);

    if (members) {
      const inviteData = members.map((m: any) => ({
        email: m.user?.email,
        name: m.user?.full_name,
      })).filter((m) => m.email);

      await Promise.allSettled(
        inviteData.map((m) =>
          sendMeetingInvite(m.email!, m.name!, title, startedAt, meetingLink, location, agenda),
        ),
      );
    }
  } catch {}

  revalidatePath("/dashboard/meetings");
  return { success: true };
}
