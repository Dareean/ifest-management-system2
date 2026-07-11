import { getMeetings } from "@/lib/data/meetings";
import { exportMeetingsCSV } from "@/lib/actions/export";
import { MeetingsClient } from "./meetings-client";

export default async function MeetingsPage() {
  const meetings = await getMeetings();

  return (
    <MeetingsClient
      initialMeetings={meetings}
      exportMeetingsCSV={exportMeetingsCSV}
    />
  );
}

