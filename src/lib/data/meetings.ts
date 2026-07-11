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

  const meetingsWithCounts = await Promise.all(
    data.map(async (m: any) => {
      const { count } = await supabase
        .from("meeting_invitees")
        .select("*", { count: "exact", head: true })
        .eq("meeting_id", m.id);

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
        inviteeCount: count ?? 0,
        scope: m.scope ?? "individual",
        notesStatus,
      };
    }),
  );

  return meetingsWithCounts;
}
