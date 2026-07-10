import { createAdminClient } from "@/lib/supabase/admin";

export interface MeetingDetail {
  id: string;
  title: string;
  agenda: string | null;
  meetingType: string;
  meetingLink: string | null;
  location: string | null;
  startedAt: string;
  endedAt: string | null;
  createdAt: string;
  creator: string;
  invitees: {
    id: string;
    assignmentId: string;
    name: string;
    email: string;
    rsvpStatus: string;
    emailSent: boolean;
  }[];
  notes: {
    id: string;
    content: string;
    decisionPoints: any[];
    actionItems: any[];
    publishedAt: string | null;
    writer: string;
    createdAt: string;
  } | null;
}

export async function getMeetingDetail(id: string): Promise<MeetingDetail | null> {
  const supabase = createAdminClient();

  const [meetingResult, inviteesResult, notesResult] = await Promise.all([
    supabase
      .from("meetings")
      .select(`
        id, title, agenda, meeting_type, meeting_link, location,
        started_at, ended_at, created_at,
        creator:committee_assignments!creator_id(user:users(full_name, email))
      `)
      .eq("id", id)
      .single(),
    supabase
      .from("meeting_invitees")
      .select(`
        id, committee_assignment_id, rsvp_status, email_sent,
        assignment:committee_assignments(user:users(full_name, email))
      `)
      .eq("meeting_id", id),
    supabase
      .from("meeting_notes")
      .select(`
        id, content, decision_points, action_items,
        published_at, created_at,
        writer:committee_assignments(user:users(full_name))
      `)
      .eq("meeting_id", id)
      .maybeSingle(),
  ]);

  const meeting = meetingResult.data;
  if (!meeting) return null;

  const invitees = inviteesResult.data ?? [];
  const notes = notesResult.data;

  const m = meeting as any;

  return {
    id: m.id,
    title: m.title,
    agenda: m.agenda,
    meetingType: m.meeting_type,
    meetingLink: m.meeting_link,
    location: m.location,
    startedAt: m.started_at,
    endedAt: m.ended_at,
    createdAt: m.created_at,
    creator: m.creator?.user?.full_name ?? "",
    invitees: invitees.map((i: any) => ({
      id: i.id,
      assignmentId: i.committee_assignment_id,
      name: i.assignment?.user?.full_name ?? "",
      email: i.assignment?.user?.email ?? "",
      rsvpStatus: i.rsvp_status,
      emailSent: i.email_sent,
    })),
    notes: notes
      ? {
          id: (notes as any).id,
          content: (notes as any).content,
          decisionPoints: (notes as any).decision_points ?? [],
          actionItems: (notes as any).action_items ?? [],
          publishedAt: (notes as any).published_at,
          writer: (notes as any).writer?.user?.full_name ?? "",
          createdAt: (notes as any).created_at,
        }
      : null,
  };
}
