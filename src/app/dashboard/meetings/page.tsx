import { getMeetings } from "@/lib/data/meetings";
import { exportMeetingsCSV } from "@/lib/actions/export";
import { requireRole } from "@/lib/auth/authorize";
import { MeetingsClient } from "./meetings-client";

export default async function MeetingsPage() {
  const auth = await requireRole(10);
  const session = auth.authorized ? auth.session : null;

  const isMeetingCreator = session?.isMeetingCreator ?? false;
  const isBph = (session?.roleLevel ?? 0) >= 75;
  const assignmentId = session?.assignmentId;

  const meetings = await getMeetings(assignmentId, isMeetingCreator, isBph);

  return (
    <MeetingsClient
      initialMeetings={meetings}
      exportMeetingsCSV={exportMeetingsCSV}
      canCreateMeeting={isMeetingCreator}
    />
  );
}

