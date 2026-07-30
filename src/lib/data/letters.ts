import { createAdminClient } from "@/lib/supabase/admin";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

export interface LetterData {
  id: string;
  trackingNo: string;
  letterType: string;
  subject: string;
  status: string;
  division: string;
  divisionSlug: string;
  requester: string;
  requesterId: string;
  createdAt: string;
  category: string | null;
  priority: string;
  deadlineAt: string | null;
  targetInstitution: string | null;
}

export async function getLetters(requesterId?: string): Promise<LetterData[]> {
  const supabase = createAdminClient();

  let query = supabase
    .from("letter_requests")
    .select(`
      id,
      letter_type,
      subject,
      status,
      category,
      priority,
      deadline_at,
      target_institution,
      created_at,
      requester_id,
      division:divisions(name, slug),
      requester:committee_assignments!requester_id(
        user:profiles(full_name, nim)
      )
    `)
    .eq("committee_year_id", YEAR_ID)
    .order("created_at", { ascending: false });

  if (requesterId) {
    query = query.eq("requester_id", requesterId);
  }

  const { data } = await query;

  if (!data) return [];

  return data.map((l: any) => ({
    id: l.id,
    trackingNo: `SRT-2026-${l.id.slice(0, 6).toUpperCase()}`,
    letterType: l.letter_type,
    subject: l.subject,
    status: l.status,
    category: l.category,
    priority: l.priority ?? "sedang",
    deadlineAt: l.deadline_at,
    targetInstitution: l.target_institution,
    division: l.division?.name ?? "",
    divisionSlug: l.division?.slug ?? "",
    requester: l.requester?.user?.full_name ?? "",
    requesterId: l.requester_id,
    createdAt: l.created_at,
  }));
}

const statusLabel: Record<string, string> = {
  requested: "Diajukan",
  processing: "Diproses",
  sent: "Selesai",
  in_revision: "Revisi",
};

const statusVariant: Record<string, "warning" | "info" | "success" | "danger" | "default"> = {
  requested: "warning",
  processing: "info",
  sent: "success",
  in_revision: "danger",
};

export function getStatusDisplay(status: string): { label: string; variant: "warning" | "info" | "success" | "danger" | "default" } {
  return {
    label: statusLabel[status] ?? status,
    variant: statusVariant[status] ?? "default",
  };
}

const priorityVariant: Record<string, "default" | "danger" | "secondary"> = {
  tinggi: "danger",
  sedang: "default",
  rendah: "secondary",
};

const priorityLabel: Record<string, string> = {
  tinggi: "Tinggi",
  sedang: "Sedang",
  rendah: "Rendah",
};

export function getPriorityDisplay(priority: string): { label: string; variant: "default" | "danger" | "secondary" } {
  return {
    label: priorityLabel[priority] ?? priority,
    variant: priorityVariant[priority] ?? "default",
  };
}
