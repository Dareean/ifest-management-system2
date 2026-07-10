"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

type ActionState = { error?: string; success?: boolean } | null;

export async function createMeeting(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await createClient();
  const { data: authData } = await auth.auth.getUser();
  const userId = authData?.user?.id;

  if (!userId) return { error: "Unauthorized" };

  const admin = createAdminClient();

  const title = formData.get("title") as string;
  const agenda = formData.get("agenda") as string;
  const meetingType = formData.get("meetingType") as string;
  const startedAt = formData.get("startedAt") as string;
  const meetingLink = formData.get("meetingLink") as string;
  const location = formData.get("location") as string;

  const inviteeIdsRaw = formData.get("invitee_ids") as string;
  let inviteeIds: string[] = [];
  try { inviteeIds = JSON.parse(inviteeIdsRaw); } catch {}

  if (inviteeIds.length === 0) return { error: "Pilih minimal 1 peserta undangan." };

  const { data: callerAssignment } = await admin
    .from("committee_assignments")
    .select("id")
    .eq("committee_year_id", YEAR_ID)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (!callerAssignment) return { error: "Anda tidak terdaftar sebagai panitia aktif." };

  const { data: meeting, error } = await admin
    .from("meetings")
    .insert({
      committee_year_id: YEAR_ID,
      creator_id: callerAssignment.id,
      title,
      agenda: agenda || null,
      meeting_type: meetingType || "scheduled",
      meeting_link: meetingLink || null,
      location: location || null,
      started_at: startedAt,
    })
    .select("id")
    .single();

  if (error || !meeting) return { error: error?.message ?? "Gagal membuat rapat" };

  const { error: inviteeErr } = await admin.from("meeting_invitees").insert(
    inviteeIds.map((assignmentId) => ({
      meeting_id: meeting.id,
      committee_assignment_id: assignmentId,
    })),
  );

  if (inviteeErr) return { error: inviteeErr.message };

  // Targeted in-app notifications
  const meetingDate = new Date(startedAt).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long",
    hour: "2-digit", minute: "2-digit",
  });

  const { data: inviteeDetails } = await admin
    .from("committee_assignments")
    .select(`
      id,
      user_id,
      user:profiles(full_name)
    `)
    .in("id", inviteeIds);

  if (inviteeDetails) {
    await admin.from("notifications").insert(
      inviteeDetails.map((inv: any) => ({
        committee_assignment_id: inv.id,
        type: "meeting",
        title: `Rapat baru: ${title}`,
        body: meetingDate,
      })),
    );

    // Send email (fire-and-forget per invitee)
    for (const inv of inviteeDetails as any[]) {
      try {
        const authUser = await admin.auth.admin.getUserById(inv.user_id);
        const email = authUser?.data?.user?.email;
        if (email) {
          const { sendMeetingInvite } = await import("@/lib/email");
          await sendMeetingInvite(email, inv.user?.full_name ?? "", title, startedAt, meetingLink, location, agenda);
        }
      } catch {}
    }
  }

  revalidatePath("/dashboard/meetings");
  return { success: true };
}
