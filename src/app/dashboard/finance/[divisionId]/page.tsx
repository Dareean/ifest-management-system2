import { notFound, redirect } from "next/navigation";
import { getBudgetDetail } from "@/lib/data/finance";
import { DivisionDetailClient } from "./client";

export default async function DivisionDetailPage(props: { params: Promise<{ divisionId: string }> }) {
  const { divisionId } = await props.params;
  const data = await getBudgetDetail(divisionId);

  if (!data.budget) notFound();

  return <DivisionDetailClient budget={data.budget} transactions={data.transactions} />;
}
