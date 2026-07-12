import { getUserMeetings } from "@/lib/data/personal-dashboard";
import { PersonalMeetingsClient } from "./personal-meetings-client";

export async function PersonalMeetings({ assignmentId }: { assignmentId: string }) {
  const meetings = await getUserMeetings(assignmentId);
  return <PersonalMeetingsClient meetings={meetings} />;
}
