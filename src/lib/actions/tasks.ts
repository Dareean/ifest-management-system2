"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

export async function createTask(prevState: unknown, formData: FormData) {
  const supabase = createAdminClient();
  const kpiItemId = formData.get("kpi_item_id") as string;
  const divisionId = formData.get("division_id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const priority = formData.get("priority") as string || "medium";
  const deadline = formData.get("deadline") as string;

  if (!kpiItemId || !divisionId || !title) {
    return { error: "KPI, Divisi, dan Judul harus diisi" };
  }

  const { error } = await supabase.from("tasks").insert({
    committee_year_id: YEAR_ID,
    kpi_item_id: kpiItemId,
    division_id: divisionId,
    title,
    description: description || null,
    priority,
    deadline: deadline || null,
    status: "todo",
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/kpi");
  return { success: true };
}

export async function completeTask(taskId: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("tasks")
    .update({ status: "done", completed_at: new Date().toISOString() })
    .eq("id", taskId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/kpi");
  return { success: true };
}

export async function reopenTask(taskId: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("tasks")
    .update({ status: "todo", completed_at: null })
    .eq("id", taskId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/kpi");
  return { success: true };
}

export async function deleteTask(taskId: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/kpi");
  return { success: true };
}
