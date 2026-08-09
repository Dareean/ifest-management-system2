"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createNotification, notifyDivision } from "@/lib/internal-notifications";

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

  let budgetId = formData.get("budget_id") as string;
  const divisionId = formData.get("division_id") as string;
  const type = (formData.get("type") as string) || "expense";
  const amount = parseFloat(formData.get("amount") as string);
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const receiptNumber = formData.get("receipt_number") as string;
  const transactionDate = formData.get("transaction_date") as string;
  const attachmentUrl = formData.get("attachment_url") as string;

  if (!budgetId && divisionId) {
    const { data: existingBudget } = await supabase
      .from("budgets")
      .select("id")
      .eq("committee_year_id", YEAR_ID)
      .eq("division_id", divisionId)
      .maybeSingle();

    if (existingBudget) {
      budgetId = existingBudget.id;
    } else {
      const { data: newBudget, error: bErr } = await supabase
        .from("budgets")
        .insert({
          committee_year_id: YEAR_ID,
          division_id: divisionId,
          total_budget: 0,
        })
        .select("id")
        .single();

      if (bErr || !newBudget) return { error: "Gagal membuat anggaran divisi" };
      budgetId = newBudget.id;
    }
  }

  if (!budgetId || !type || isNaN(amount) || amount <= 0 || !description) {
    return { error: "Mohon isi semua data transaksi dan nominal dengan benar" };
  }
  if (type !== "income" && type !== "expense") {
    return { error: "Tipe transaksi tidak valid" };
  }

  const { error } = await supabase.from("budget_transactions").insert({
    budget_id: budgetId,
    type,
    amount,
    description,
    category: category || null,
    receipt_number: receiptNumber || null,
    attachment_url: attachmentUrl || null,
    transaction_date: transactionDate ? new Date(transactionDate + "+08:00").toISOString() : undefined,
    created_by: assignment.id,
  });

  if (error) return { error: error.message };

  // Notify Bendahara of new financial report/receipt submission
  const { data: bendaharaAssignments } = await supabase
    .from("committee_assignments")
    .select("id, role:roles!inner(level)")
    .eq("committee_year_id", YEAR_ID)
    .eq("is_active", true)
    .gte("role.level", 70);

  if (Array.isArray(bendaharaAssignments)) {
    for (const m of bendaharaAssignments) {
      if (m.id !== assignment.id) {
        await createNotification(
          m.id,
          "system",
          `Laporan Keuangan Disetor: Rp${amount.toLocaleString("id-ID")}`,
          `Keterangan: ${description} (Nomor Nota: ${receiptNumber || "-"})`,
          true,
        );
      }
    }
  }

  revalidatePath("/dashboard/finance");
  revalidatePath("/dashboard/finance/report");

  // Optional background Apps Script Sync
  const webhookUrl = process.env.APPSCRIPT_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const { data: budgetData } = await supabase
        .from("budgets")
        .select("division:divisions(name)")
        .eq("id", budgetId)
        .single();
      const divName = (budgetData as any)?.division?.name || "Divisi Panitia";
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sync_transaction",
          data: {
            id: Date.now().toString(),
            transaction_date: transactionDate || new Date().toISOString().slice(0, 10),
            division_name: divName,
            type,
            category,
            description,
            amount,
            receipt_number: receiptNumber,
            attachment_url: attachmentUrl,
          },
        }),
      });
    } catch (err) {
      console.error("Apps Script Webhook sync error:", err);
    }
  }

  return { success: true };
}

export async function updateTransaction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = createAdminClient();
  const assignment = await getCurrentAssignment();
  if (!assignment) return { error: "Silakan login terlebih dahulu" };

  const id = formData.get("id") as string;
  const type = (formData.get("type") as string) || "expense";
  const amount = parseFloat(formData.get("amount") as string);
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const receiptNumber = formData.get("receipt_number") as string;
  const transactionDate = formData.get("transaction_date") as string;
  const attachmentUrl = formData.get("attachment_url") as string;

  if (!id || !type || isNaN(amount) || amount <= 0 || !description) {
    return { error: "Mohon isi semua data transaksi dan nominal dengan benar" };
  }

  const { error } = await supabase
    .from("budget_transactions")
    .update({
      type,
      amount,
      description,
      category: category || null,
      receipt_number: receiptNumber || null,
      attachment_url: attachmentUrl || null,
      transaction_date: transactionDate ? new Date(transactionDate + "+08:00").toISOString() : undefined,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/finance");
  revalidatePath("/dashboard/finance/report");

  const webhookUrl = process.env.APPSCRIPT_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sync_transaction",
          data: {
            id,
            transaction_date: transactionDate || new Date().toISOString().slice(0, 10),
            type,
            category,
            description,
            amount,
            receipt_number: receiptNumber,
            attachment_url: attachmentUrl,
          },
        }),
      });
    } catch (err) {
      console.error("Apps Script Webhook sync error:", err);
    }
  }

  return { success: true };
}

export async function deleteTransaction(id: string) {
  const assignment = await getCurrentAssignment();
  if (!assignment) return { error: "Silakan login terlebih dahulu" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("budget_transactions").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/finance");
  revalidatePath("/dashboard/finance/report");

  const webhookUrl = process.env.APPSCRIPT_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_transaction", transaction_id: id }),
      });
    } catch (err) {
      console.error("Apps Script Webhook delete sync error:", err);
    }
  }

  return { success: true };
}

export async function syncAllToAppsScript(customWebhookUrl?: string) {
  const webhookUrl = customWebhookUrl || process.env.APPSCRIPT_WEBHOOK_URL;
  if (!webhookUrl) return { error: "URL Webhook Apps Script belum diatur" };

  const supabase = createAdminClient();
  const { data: budgets } = await supabase
    .from("budgets")
    .select("*, division:divisions(name)")
    .eq("committee_year_id", YEAR_ID);

  if (!budgets) return { error: "Tidak ada data anggaran" };

  const transactionsList: any[] = [];
  const budgetsList: any[] = [];

  for (const b of budgets) {
    const { data: tx } = await supabase
      .from("budget_transactions")
      .select("*")
      .eq("budget_id", b.id)
      .order("transaction_date", { ascending: false });

    const used = (tx ?? []).filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

    budgetsList.push({
      division_name: (b as any).division?.name ?? "Divisi",
      total_budget: Number(b.total_budget),
      used_amount: used,
      remaining: Number(b.total_budget) - used,
    });

    for (const t of tx ?? []) {
      transactionsList.push({
        id: t.id,
        transaction_date: new Date((t as any).transaction_date).toLocaleDateString("id-ID"),
        division_name: (b as any).division?.name ?? "Divisi",
        type: t.type,
        category: t.category ?? "-",
        description: t.description,
        amount: Number(t.amount),
        receipt_number: t.receipt_number ?? "-",
        attachment_url: t.attachment_url ?? "-",
      });
    }
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "bulk_sync",
        data: {
          budgets: budgetsList,
          transactions: transactionsList,
        },
      }),
    });
    const json = (await res.json()) as any;
    return { success: true, message: json?.message || "Berhasil sinkronisasi ke Google Sheets!" };
  } catch (err: any) {
    return { error: `Gagal sinkronkan ke Google Sheets: ${err.message}` };
  }
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

  // Notify bendahara (level 70) about new request
  const { data: bendaharaAssignments } = await supabase
    .from("committee_assignments")
    .select("id")
    .eq("committee_year_id", YEAR_ID)
    .eq("is_active", true);

  if (Array.isArray(bendaharaAssignments)) {
    const { data: bendaharaRoles } = await supabase
      .from("roles")
      .select("id")
      .eq("committee_year_id", YEAR_ID)
      .eq("level", 70);

    const bendaharaRoleIds = new Set((bendaharaRoles ?? []).map((r) => r.id));
    const bendaharaMembers = (bendaharaAssignments ?? []).filter((a) => bendaharaRoleIds.has((a as any).role_id));

    for (const m of bendaharaMembers) {
      await createNotification(
        m.id,
        "system",
        `Pengajuan dana baru: Rp${amount.toLocaleString("id-ID")}`,
        `Tujuan: ${purpose}`,
        true,
      );
    }
  }

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

  // Notify the requester
  const { data: request } = await supabase
    .from("budget_requests")
    .select("requester_id, amount, division_id")
    .eq("id", requestId)
    .single();

  if (request) {
    const r = request as any;
    const statusLabel = status === "approved" ? "disetujui" : "ditolak";
    await createNotification(
      r.requester_id,
      "system",
      `Pengajuan dana ${statusLabel}: Rp${Number(r.amount).toLocaleString("id-ID")}`,
      notes ? `Catatan: ${notes}` : undefined,
      true,
    );
    if (status === "approved") {
      await notifyDivision(
        r.division_id,
        "system",
        `Pengajuan dana disetujui: Rp${Number(r.amount).toLocaleString("id-ID")}`,
        undefined,
        false,
      );
    }
  }

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

export async function exportFinanceCSVDetail() {
  const supabase = createAdminClient();
  const { data: budgets } = await supabase
    .from("budgets")
    .select("*, division:divisions(name)")
    .eq("committee_year_id", YEAR_ID);

  if (!budgets) return "";

  const rows = [["Tanggal", "Divisi", "Tipe", "Kategori", "Deskripsi", "Jumlah", "Nomor Bukti"]];
  for (const b of budgets) {
    const { data: tx } = await supabase
      .from("budget_transactions")
      .select("transaction_date, type, category, description, amount, receipt_number")
      .eq("budget_id", b.id)
      .order("transaction_date", { ascending: false });

    for (const t of tx ?? []) {
      rows.push([
        new Date((t as any).transaction_date).toLocaleDateString("id-ID"),
        (b as any).division?.name ?? "",
        (t as any).type === "income" ? "Pemasukan" : "Pengeluaran",
        (t as any).category ?? "-",
        (t as any).description,
        String(Number((t as any).amount)),
        (t as any).receipt_number ?? "-",
      ]);
    }
  }

  return rows.map((r) => r.join(",")).join("\n");
}

// ============================================================
// RAB (Rencana Anggaran Biaya) Management
// ============================================================

export async function addRabItem(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = createAdminClient();
  const assignment = await getCurrentAssignment();
  if (!assignment) return { error: "Silakan login terlebih dahulu" };

  const divisionId = formData.get("division_id") as string;
  const itemName = formData.get("item_name") as string;
  const quantity = parseFloat(formData.get("quantity") as string) || 1;
  const unit = (formData.get("unit") as string) || "unit";
  const unitPrice = parseFloat(formData.get("unit_price") as string) || 0;
  const category = formData.get("category") as string;
  const notes = formData.get("notes") as string;
  const status = (formData.get("status") as string) || "draft";

  if (!divisionId || !itemName || unitPrice < 0) {
    return { error: "Mohon isi nama item dan harga satuan RAB dengan benar" };
  }

  const totalEstimated = quantity * unitPrice;

  const { error } = await supabase.from("rab_items").insert({
    committee_year_id: YEAR_ID,
    division_id: divisionId,
    item_name: itemName,
    quantity,
    unit,
    unit_price: unitPrice,
    total_estimated: totalEstimated,
    category: category || null,
    status,
    notes: notes || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/treasurer-book");
  return { success: true };
}

export async function updateRabItem(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = createAdminClient();
  const assignment = await getCurrentAssignment();
  if (!assignment) return { error: "Silakan login terlebih dahulu" };

  const id = formData.get("id") as string;
  const divisionId = formData.get("division_id") as string;
  const itemName = formData.get("item_name") as string;
  const quantity = parseFloat(formData.get("quantity") as string) || 1;
  const unit = (formData.get("unit") as string) || "unit";
  const unitPrice = parseFloat(formData.get("unit_price") as string) || 0;
  const category = formData.get("category") as string;
  const notes = formData.get("notes") as string;
  const status = (formData.get("status") as string) || "draft";

  if (!id || !itemName || unitPrice < 0) {
    return { error: "Mohon isi nama item dan harga satuan RAB dengan benar" };
  }

  const totalEstimated = quantity * unitPrice;

  const { error } = await supabase
    .from("rab_items")
    .update({
      division_id: divisionId || undefined,
      item_name: itemName,
      quantity,
      unit,
      unit_price: unitPrice,
      total_estimated: totalEstimated,
      category: category || null,
      status,
      notes: notes || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/treasurer-book");
  return { success: true };
}

export async function deleteRabItem(id: string) {
  const assignment = await getCurrentAssignment();
  if (!assignment) return { error: "Silakan login terlebih dahulu" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("rab_items").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/treasurer-book");
  return { success: true };
}
