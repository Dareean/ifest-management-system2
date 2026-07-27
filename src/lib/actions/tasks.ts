"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

async function requireActiveMember() {
  const auth = await createClient();
  const { data: authData } = await auth.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) return null;

  const admin = createAdminClient();
  const { data: assignment } = await admin
    .from("committee_assignments")
    .select("id, division_id, role:roles(level)")
    .eq("committee_year_id", YEAR_ID)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (!assignment) return null;
  return assignment as any;
}

export async function createTask(prevState: unknown, formData: FormData) {
  const caller = await requireActiveMember();
  if (!caller) return { error: "Silakan login terlebih dahulu" };

  const supabase = createAdminClient();
  const divisionId = formData.get("division_id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const priority = (formData.get("priority") as string) || "medium";
  const deadline = formData.get("deadline") as string;
  const assigneeId = formData.get("assignee_id") as string;

  if (!divisionId || !title) {
    return { error: "Divisi dan Judul harus diisi" };
  }

  // Auth check
  const level = caller.role?.level ?? 0;
  if (level < 55) {
    return { error: "Anda tidak memiliki akses untuk membuat task" };
  }
  if (level < 70 && caller.division_id !== divisionId) {
    return { error: "Anda hanya dapat mengelola task untuk divisi Anda sendiri" };
  }

  const { error } = await supabase.from("tasks").insert({
    committee_year_id: YEAR_ID,
    division_id: divisionId,
    title,
    description: description || null,
    priority,
    deadline: deadline || null,
    assignee_id: assigneeId || null,
    status: "todo",
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/tasks");
  return { success: true };
}

export async function completeTask(taskId: string) {
  const caller = await requireActiveMember();
  if (!caller) return { error: "Silakan login terlebih dahulu" };

  const supabase = createAdminClient();

  // Fetch task to verify ownership
  const { data: task, error: fetchErr } = await supabase
    .from("tasks")
    .select("division_id, assignee_id")
    .eq("id", taskId)
    .maybeSingle();

  if (fetchErr || !task) return { error: "Task tidak ditemukan" };

  const level = caller.role?.level ?? 0;
  if (level < 70) {
    if (level >= 55) {
      if (caller.division_id !== task.division_id) {
        return { error: "Anda hanya dapat mengubah task untuk divisi Anda sendiri" };
      }
    } else {
      // Regular Member
      if (caller.id !== task.assignee_id) {
        return { error: "Anda hanya dapat menyelesaikan task yang ditugaskan kepada Anda" };
      }
    }
  }

  const { error } = await supabase
    .from("tasks")
    .update({ status: "done", completed_at: new Date().toISOString() })
    .eq("id", taskId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/tasks");
  return { success: true };
}

export async function reopenTask(taskId: string) {
  const caller = await requireActiveMember();
  if (!caller) return { error: "Silakan login terlebih dahulu" };

  const supabase = createAdminClient();

  // Fetch task to verify ownership
  const { data: task, error: fetchErr } = await supabase
    .from("tasks")
    .select("division_id, assignee_id")
    .eq("id", taskId)
    .maybeSingle();

  if (fetchErr || !task) return { error: "Task tidak ditemukan" };

  const level = caller.role?.level ?? 0;
  if (level < 70) {
    if (level >= 55) {
      if (caller.division_id !== task.division_id) {
        return { error: "Anda hanya dapat mengubah task untuk divisi Anda sendiri" };
      }
    } else {
      // Regular Member
      if (caller.id !== task.assignee_id) {
        return { error: "Anda hanya dapat mengelola task yang ditugaskan kepada Anda" };
      }
    }
  }

  const { error } = await supabase
    .from("tasks")
    .update({ status: "todo", completed_at: null })
    .eq("id", taskId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/tasks");
  return { success: true };
}

export async function deleteTask(taskId: string) {
  const caller = await requireActiveMember();
  if (!caller) return { error: "Silakan login terlebih dahulu" };

  const supabase = createAdminClient();

  // Fetch task to verify ownership
  const { data: task, error: fetchErr } = await supabase
    .from("tasks")
    .select("division_id")
    .eq("id", taskId)
    .maybeSingle();

  if (fetchErr || !task) return { error: "Task tidak ditemukan" };

  const level = caller.role?.level ?? 0;
  if (level < 70) {
    if (level >= 55) {
      if (caller.division_id !== task.division_id) {
        return { error: "Anda hanya dapat menghapus task di divisi Anda sendiri" };
      }
    } else {
      return { error: "Hanya BPH atau Koordinator yang dapat menghapus task" };
    }
  }

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/tasks");
  return { success: true };
}

export async function updateTask(
  taskId: string,
  data: {
    title?: string;
    description?: string | null;
    status?: string;
    priority?: string;
    deadline?: string | null;
    assigneeId?: string | null;
  }
) {
  const caller = await requireActiveMember();
  if (!caller) return { error: "Silakan login terlebih dahulu" };

  const supabase = createAdminClient();

  // Fetch task to verify ownership
  const { data: task, error: fetchErr } = await supabase
    .from("tasks")
    .select("division_id, assignee_id")
    .eq("id", taskId)
    .maybeSingle();

  if (fetchErr || !task) return { error: "Task tidak ditemukan" };

  const level = caller.role?.level ?? 0;
  if (level < 70) {
    if (level >= 55) {
      if (caller.division_id !== task.division_id) {
        return { error: "Anda hanya dapat mengubah task untuk divisi Anda sendiri" };
      }
    } else {
      // Regular Member can only update status of their own assigned tasks
      if (caller.id !== task.assignee_id) {
        return { error: "Anda hanya dapat mengelola task yang ditugaskan kepada Anda" };
      }
      // If it's a regular member, they should ONLY be able to change status!
      if (
        data.title !== undefined ||
        data.description !== undefined ||
        data.priority !== undefined ||
        data.deadline !== undefined ||
        data.assigneeId !== undefined
      ) {
        return { error: "Anggota hanya dapat mengubah status task" };
      }
    }
  }

  const updatePayload: any = {};
  if (data.title !== undefined) updatePayload.title = data.title;
  if (data.description !== undefined) updatePayload.description = data.description;
  if (data.status !== undefined) {
    updatePayload.status = data.status;
    if (data.status === "done") {
      updatePayload.completed_at = new Date().toISOString();
    } else {
      updatePayload.completed_at = null;
    }
  }
  if (data.priority !== undefined) updatePayload.priority = data.priority;
  if (data.deadline !== undefined) updatePayload.deadline = data.deadline;
  if (data.assigneeId !== undefined) updatePayload.assignee_id = data.assigneeId;

  const { error } = await supabase
    .from("tasks")
    .update(updatePayload)
    .eq("id", taskId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/tasks");
  return { success: true };
}