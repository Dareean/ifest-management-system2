"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

type ActionState = { error?: string; success?: boolean; meetingId?: string } | null;

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

  // Infer meeting scope from invitees
  const { count: totalActive } = await admin
    .from("committee_assignments")
    .select("*", { count: "exact", head: true })
    .eq("committee_year_id", YEAR_ID)
    .eq("is_active", true);

  const { data: inviteeDivisions } = await admin
    .from("committee_assignments")
    .select("division_id")
    .in("id", inviteeIds);

  const divisionIds = [...new Set((inviteeDivisions ?? []).map((i: any) => i.division_id))];
  const scope =
    inviteeIds.length >= (totalActive ?? 0)
      ? "all"
      : divisionIds.length === 1
        ? "division"
        : "individual";

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
      scope,
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

  // In-app notifications
  const meetingDate = new Date(startedAt).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long",
    hour: "2-digit", minute: "2-digit",
  });

  await admin.from("notifications").insert(
    inviteeIds.map((id) => ({
      committee_assignment_id: id,
      type: "meeting",
      title: `Rapat baru: ${title}`,
      body: meetingDate,
    })),
  );

  // Send emails in parallel (fire-and-forget style)
  const { data: inviteeDetails } = await admin
    .from("committee_assignments")
    .select(`id, user_id, user:profiles(full_name)`)
    .in("id", inviteeIds);
  if (inviteeDetails?.length) {
    const { sendMeetingInvite } = await import("@/lib/email");
    await Promise.allSettled(
      (inviteeDetails as any[]).map(async (inv) => {
        try {
          const authUser = await admin.auth.admin.getUserById(inv.user_id);
          const email = authUser?.data?.user?.email;
          if (email) {
            await sendMeetingInvite(email, inv.user?.full_name ?? "", title, startedAt, meetingLink, location, agenda);
          }
        } catch {}
      }),
    );
  }

  revalidatePath("/dashboard/meetings");
  return { success: true, meetingId: meeting.id };
}
