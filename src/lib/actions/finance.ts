"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

type ActionState = { error?: string; success?: boolean } | null;

async function getCurrentAssignment() {
  const authSupabase = await createClient();
  const { data: authData } = await authSupabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) return null;

  const supabase = createAdminClient();
  const { data: assignment } = await supabase
    .from("committee_assignments")
    .select("id, division_id")
    .eq("committee_year_id", YEAR_ID)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  return assignment;
}

// ============================================================
// Budget Management
// ============================================================

export async function setBudget(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const assignment = await getCurrentAssignment();
  if (!assignment) return { error: "Silakan login terlebih dahulu" };

  const supabase = createAdminClient();
  const divisionId = formData.get("division_id") as string;
  const amount = parseFloat(formData.get("amount") as string);

  if (!divisionId || isNaN(amount) || amount < 0) {
    return { error: "Data tidak valid" };
  }

  const { error } = await supabase.from("budgets").upsert({
    committee_year_id: YEAR_ID,
    division_id: divisionId,
    total_budget: amount,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/finance");
  return { success: true };
}

// ============================================================
// Transactions
// ============================================================

export async function addTransaction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = createAdminClient();
  const assignment = await getCurrentAssignment();
  if (!assignment) return { error: "Silakan login terlebih dahulu" };

  const budgetId = formData.get("budget_id") as string;
  const type = formData.get("type") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;

  if (!budgetId || !type || isNaN(amount) || amount <= 0 || !description) {
    return { error: "Semua field harus diisi" };
  }
  if (type !== "income" && type !== "expense") {
    return { error: "Tipe tidak valid" };
  }

  const { error } = await supabase.from("budget_transactions").insert({
    budget_id: budgetId,
    type,
    amount,
    description,
    category: category || null,
    created_by: assignment.id,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/finance");
  return { success: true };
}

export async function deleteTransaction(id: string) {
  const assignment = await getCurrentAssignment();
  if (!assignment) return { error: "Silakan login terlebih dahulu" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("budget_transactions").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/finance");
  return { success: true };
}

// ============================================================
// Budget Requests (pengajuan dana)
// ============================================================

export async function createBudgetRequest(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = createAdminClient();
  const assignment = await getCurrentAssignment();
  if (!assignment) return { error: "Silakan login terlebih dahulu" };

  const divisionId = formData.get("division_id") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const purpose = formData.get("purpose") as string;

  if (!divisionId || isNaN(amount) || amount <= 0 || !purpose) {
    return { error: "Data tidak valid" };
  }

  const { error } = await supabase.from("budget_requests").insert({
    committee_year_id: YEAR_ID,
    requester_id: assignment.id,
    division_id: divisionId,
    amount,
    purpose,
    status: "pending",
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/finance");
  return { success: true };
}

export async function handleBudgetRequest(
  requestId: string,
  status: "approved" | "rejected",
  notes?: string,
) {
  const supabase = createAdminClient();
  const assignment = await getCurrentAssignment();
  if (!assignment) return { error: "Silakan login terlebih dahulu" };

  const { error } = await supabase
    .from("budget_requests")
    .update({
      status,
      handler_id: assignment.id,
      handled_at: new Date().toISOString(),
      notes: notes || null,
    })
    .eq("id", requestId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/finance");
  return { success: true };
}

// ============================================================
// Export
// ============================================================

export async function exportFinanceCSV() {
  const supabase = createAdminClient();
  const { data: budgets } = await supabase
    .from("budgets")
    .select("*, division:divisions(name)")
    .eq("committee_year_id", YEAR_ID);

  if (!budgets) return "";

  const rows = [["Divisi", "Total Anggaran", "Terdpakai", "Sisa"]];
  for (const b of budgets) {
    const { data: tx } = await supabase
      .from("budget_transactions")
      .select("amount, type")
      .eq("budget_id", b.id);
    const used = tx?.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0) ?? 0;
    rows.push([
      (b as any).division?.name ?? "",
      String(Number(b.total_budget)),
      String(used),
      String(Number(b.total_budget) - used),
    ]);
  }

  return rows.map((r) => r.join(",")).join("\n");
}
