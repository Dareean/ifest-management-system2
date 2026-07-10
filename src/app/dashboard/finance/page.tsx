import { getFinanceOverview, getBudgets, getBudgetRequests } from "@/lib/data/finance";
import { FinanceClient } from "./client";

export default async function FinancePage() {
  const [overview, budgets, requests] = await Promise.all([
    getFinanceOverview(),
    getBudgets(),
    getBudgetRequests(),
  ]);

  return <FinanceClient overview={overview} budgets={budgets} requests={requests} />;
}
