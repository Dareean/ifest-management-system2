import { getFinanceOverview, getBudgets, getBudgetRequests, getAllTransactions } from "@/lib/data/finance";
import { FinanceClient } from "./client";
import { requireRole } from "@/lib/auth/authorize";

export default async function FinancePage() {
  const auth = await requireRole(0);
  const session = auth.authorized ? auth.session : null;
  const level = session?.roleLevel ?? 0;
  const isTreasurerOrBPH = level >= 90 || level === 70;

  const [overview, budgets, requests, transactions] = await Promise.all([
    getFinanceOverview(),
    getBudgets(),
    getBudgetRequests(),
    getAllTransactions(),
  ]);

  return (
    <FinanceClient
      overview={overview}
      budgets={budgets}
      requests={requests}
      allTransactions={transactions}
      userAssignmentId={session?.assignmentId ?? ""}
      userDivisionId={session?.divisionId ?? ""}
      isTreasurerOrBPH={isTreasurerOrBPH}
    />
  );
}
