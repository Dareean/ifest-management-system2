import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

export interface MeetingData {
  id: string;
  title: string;
  agenda: string | null;
  meetingType: string;
  meetingLink: string | null;
  location: string | null;
  startedAt: string;
  endedAt: string | null;
  creator: string;
  inviteeCount: number;
  scope: string;
  notesStatus: "none" | "draft" | "published";
}

export const getMeetings = cache(async (): Promise<MeetingData[]> => {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("meetings")
    .select(`
      id,
      title,
      agenda,
      meeting_type,
      meeting_link,
      location,
      started_at,
      ended_at,
      created_at,
      scope,
      creator:committee_assignments!creator_id(
        user:profiles(full_name)
      )
    `)
    .eq("committee_year_id", YEAR_ID)
    .order("started_at", { ascending: false });

  if (!data) return [];

  const meetingIds = data.map((m: any) => m.id);
  let notesMap: Record<string, string | null> = {};
  if (meetingIds.length > 0) {
    const { data: notes } = await supabase
      .from("meeting_notes")
      .select("meeting_id, published_at")
      .in("meeting_id", meetingIds);
    if (notes) {
      for (const n of notes) {
        notesMap[(n as any).meeting_id] = (n as any).published_at;
      }
    }
  }

  // Batch fetch invitee counts
  let inviteeCountMap: Record<string, number> = {};
  if (meetingIds.length > 0) {
    const { data: invitees } = await supabase
      .from("meeting_invitees")
      .select("meeting_id")
      .in("meeting_id", meetingIds);
    if (invitees) {
      for (const inv of invitees) {
        const mid = (inv as any).meeting_id;
        inviteeCountMap[mid] = (inviteeCountMap[mid] ?? 0) + 1;
      }
    }
  }

  const meetingsWithCounts = data.map((m: any) => {
    const inviteeCount = inviteeCountMap[m.id] ?? 0;
    const notesPub = notesMap[m.id];
    const notesStatus: "none" | "draft" | "published" = notesPub === undefined ? "none" : notesPub ? "published" : "draft";

    return {
      id: m.id,
      title: m.title,
      agenda: m.agenda,
      meetingType: m.meeting_type,
      meetingLink: m.meeting_link,
      location: m.location,
      startedAt: m.started_at,
      endedAt: m.ended_at,
      creator: m.creator?.user?.full_name ?? "",
      inviteeCount,
      scope: m.scope ?? "individual",
      notesStatus,
    };
  });

  return meetingsWithCounts;
});
