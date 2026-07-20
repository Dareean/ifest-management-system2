import { createAdminClient } from "@/lib/supabase/admin";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

export interface BudgetWithDivision {
  id: string;
  division_id: string;
  division_name: string;
  division_slug: string;
  total_budget: number;
  used_amount: number;
  remaining: number;
  transaction_count: number;
}

export interface TransactionData {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string | null;
  transaction_date: string;
  created_by_name: string;
  created_at: string;
}

export interface BudgetRequestData {
  id: string;
  amount: number;
  purpose: string;
  status: string;
  division_name: string;
  requester_name: string;
  handler_name: string | null;
  handled_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface FinanceOverview {
  total_budget: number;
  total_used: number;
  total_remaining: number;
  pending_requests: number;
}

export async function getFinanceOverview(): Promise<FinanceOverview> {
  const supabase = createAdminClient();

  const { data: budgets } = await supabase
    .from("budgets")
    .select("total_budget, id")
    .eq("committee_year_id", YEAR_ID);

  if (!budgets || budgets.length === 0) {
    return { total_budget: 0, total_used: 0, total_remaining: 0, pending_requests: 0 };
  }

  const budgetIds = budgets.map((b) => b.id);
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.total_budget), 0);

  const { data: expenses } = await supabase
    .from("budget_transactions")
    .select("amount, type")
    .in("budget_id", budgetIds);

  const totalUsed = expenses
    ? expenses.filter((e) => e.type === "expense").reduce((s, e) => s + Number(e.amount), 0)
    : 0;

  const { count: pendingCount } = await supabase
    .from("budget_requests")
    .select("*", { count: "exact", head: true })
    .eq("committee_year_id", YEAR_ID)
    .eq("status", "pending");

  return {
    total_budget: totalBudget,
    total_used: totalUsed,
    total_remaining: totalBudget - totalUsed,
    pending_requests: pendingCount ?? 0,
  };
}

export async function getBudgets(): Promise<BudgetWithDivision[]> {
  const supabase = createAdminClient();

  const { data: divisions } = await supabase
    .from("divisions")
    .select("id, name, slug")
    .eq("committee_year_id", YEAR_ID)
    .order("sort_order");

  if (!divisions) return [];

  // Batch fetch all budgets
  const divisionIds = divisions.map((d) => d.id);
  const { data: allBudgets } = await supabase
    .from("budgets")
    .select("*")
    .eq("committee_year_id", YEAR_ID)
    .in("division_id", divisionIds);

  const budgetByDivision: Record<string, any> = {};
  const budgetIds: string[] = [];
  for (const b of allBudgets ?? []) {
    budgetByDivision[(b as any).division_id] = b;
    budgetIds.push((b as any).id);
  }

  // Batch fetch all transactions
  let transactionsByBudget: Record<string, { amount: number; type: string }[]> = {};
  if (budgetIds.length > 0) {
    const { data: allTx } = await supabase
      .from("budget_transactions")
      .select("amount, type, budget_id")
      .in("budget_id", budgetIds);
    if (allTx) {
      for (const tx of allTx) {
        const bid = (tx as any).budget_id;
        if (!transactionsByBudget[bid]) transactionsByBudget[bid] = [];
        transactionsByBudget[bid].push(tx as any);
      }
    }
  }

  const budgetsWithData = divisions.map((div) => {
    const budget = budgetByDivision[div.id];
    const totalBudget = budget ? Number(budget.total_budget) : 0;
    const transactions = transactionsByBudget[budget?.id] ?? [];
    const usedAmount = transactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + Number(t.amount), 0);

    return {
      id: budget?.id ?? "",
      division_id: div.id,
      division_name: div.name,
      division_slug: div.slug,
      total_budget: totalBudget,
      used_amount: usedAmount,
      remaining: totalBudget - usedAmount,
      transaction_count: transactions.length,
    };
  });

  return budgetsWithData;
}

export async function getBudgetDetail(divisionId: string): Promise<{
  budget: BudgetWithDivision | null;
  transactions: TransactionData[];
}> {
  const supabase = createAdminClient();

  const { data: div } = await supabase
    .from("divisions")
    .select("id, name, slug")
    .eq("id", divisionId)
    .single();

  if (!div) return { budget: null, transactions: [] };

  const { data: budget } = await supabase
    .from("budgets")
    .select("*")
    .eq("committee_year_id", YEAR_ID)
    .eq("division_id", divisionId)
    .maybeSingle();

  const totalBudget = budget ? Number(budget.total_budget) : 0;

  let transactions: any[] = [];
  if (budget) {
    const txRes = await supabase
      .from("budget_transactions")
      .select("*, created_by")
      .eq("budget_id", budget.id)
      .order("transaction_date", { ascending: false });
    transactions = txRes.data ?? [];
  }

  // Batch fetch creator names
  const creatorIds = transactions.map((tx: any) => tx.created_by).filter(Boolean);
  let creatorNames: Record<string, string> = {};
  if (creatorIds.length > 0) {
    const { data: creators } = await supabase
      .from("committee_assignments")
      .select("id, user:profiles(full_name)")
      .in("id", creatorIds);
    if (creators) {
      for (const c of creators) {
        creatorNames[(c as any).id] = (c as any).user?.full_name ?? "Unknown";
      }
    }
  }

  const txWithNames = transactions.map((tx: any) => ({
    id: tx.id,
    type: tx.type as "income" | "expense",
    amount: Number(tx.amount),
    description: tx.description,
    category: tx.category,
    transaction_date: tx.transaction_date,
    created_by_name: creatorNames[tx.created_by] ?? "Unknown",
    created_at: tx.created_at,
  }));

  const usedAmount = txWithNames
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  return {
    budget: {
      id: budget?.id ?? "",
      division_id: div.id,
      division_name: div.name,
      division_slug: div.slug,
      total_budget: totalBudget,
      used_amount: usedAmount,
      remaining: totalBudget - usedAmount,
      transaction_count: txWithNames.length,
    },
    transactions: txWithNames,
  };
}

export async function getBudgetRequests(): Promise<BudgetRequestData[]> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("budget_requests")
    .select(`
      id, amount, purpose, status, handled_at, notes, created_at,
      division:divisions(name),
      requester:committee_assignments!requester_id(user:profiles(full_name)),
      handler:committee_assignments!handler_id(user:profiles(full_name))
    `)
    .eq("committee_year_id", YEAR_ID)
    .order("created_at", { ascending: false });

  if (!data) return [];

  return data.map((r: any) => ({
    id: r.id,
    amount: Number(r.amount),
    purpose: r.purpose,
    status: r.status,
    division_name: r.division?.name ?? "",
    requester_name: r.requester?.user?.full_name ?? "",
    handler_name: r.handler?.user?.full_name ?? null,
    handled_at: r.handled_at,
    notes: r.notes,
    created_at: r.created_at,
  }));
}
