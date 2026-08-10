import { requireTreasurer } from "@/lib/auth/authorize";
import { redirect } from "next/navigation";
import { getFinanceOverview, getBudgets, getBudgetRequests, getAllTransactions, getRabItems } from "@/lib/data/finance";
import { TreasurerBookClient } from "./client";

export default async function TreasurerBookPage() {
  const auth = await requireTreasurer();
  if (!auth.authorized) {
    console.warn("Access denied to Treasurer Book:", auth.error);
    redirect("/dashboard");
  }

  const session = auth.session;

  let overview = { total_budget: 0, total_used: 0, total_remaining: 0, pending_requests: 0 };
  let budgets: any[] = [];
  let requests: any[] = [];
  let transactions: any[] = [];
  let rabItems: any[] = [];

  try {
    const res = await Promise.all([
      getFinanceOverview().catch(() => ({ total_budget: 0, total_used: 0, total_remaining: 0, pending_requests: 0 })),
      getBudgets().catch(() => []),
      getBudgetRequests().catch(() => []),
      getAllTransactions().catch(() => []),
      getRabItems().catch(() => []),
    ]);
    overview = res[0];
    budgets = res[1];
    requests = res[2];
    transactions = res[3];
    rabItems = res[4];
  } catch (err) {
    console.error("Error loading treasurer book data:", err);
  }

  return (
    <TreasurerBookClient
      overview={overview}
      budgets={budgets}
      requests={requests}
      allTransactions={transactions}
      rabItems={rabItems}
      userAssignmentId={session?.assignmentId ?? ""}
      userDivisionId={session?.divisionId ?? ""}
    />
  );
}
