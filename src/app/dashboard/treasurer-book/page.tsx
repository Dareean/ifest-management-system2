import { requireRole } from "@/lib/auth/authorize";
import { redirect } from "next/navigation";
import { getFinanceOverview, getBudgets, getBudgetRequests, getAllTransactions, getRabItems } from "@/lib/data/finance";
import { TreasurerBookClient } from "./client";

export default async function TreasurerBookPage() {
  const auth = await requireRole(70);
  if (!auth.authorized) {
    redirect("/dashboard");
  }

  const session = auth.session;

  const [overview, budgets, requests, transactions, rabItems] = await Promise.all([
    getFinanceOverview(),
    getBudgets(),
    getBudgetRequests(),
    getAllTransactions(),
    getRabItems(),
  ]);

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
