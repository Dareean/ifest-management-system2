import { notFound } from "next/navigation";
import { getLetterDetail } from "@/lib/data/letter-detail";
import { getStatusDisplay } from "@/lib/data/letters";
import { LetterDetailClient } from "./client";

export default async function LetterDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const letter = await getLetterDetail(id);

  if (!letter) notFound();

  return <LetterDetailClient letter={letter} />;
}
