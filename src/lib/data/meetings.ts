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
}

export async function getMeetings(): Promise<MeetingData[]> {
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
      creator:committee_assignments!creator_id(
        user:users(full_name)
      )
    `)
    .eq("committee_year_id", YEAR_ID)
    .order("started_at", { ascending: false });

  if (!data) return [];

  const meetingsWithCounts = await Promise.all(
    data.map(async (m: any) => {
      const { count } = await supabase
        .from("meeting_invitees")
        .select("*", { count: "exact", head: true })
        .eq("meeting_id", m.id);

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
        inviteeCount: count ?? 0,
      };
    }),
  );

  return meetingsWithCounts;
}
