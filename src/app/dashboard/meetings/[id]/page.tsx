import { notFound } from "next/navigation";
import { getMeetingDetail } from "@/lib/data/meeting-detail";
import { MeetingDetailClient } from "./client";

export default async function MeetingDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const meeting = await getMeetingDetail(id);
  if (!meeting) notFound();
  return <MeetingDetailClient meeting={meeting} />;
}
