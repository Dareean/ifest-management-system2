import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

export interface LetterData {
  id: string;
  letterType: string;
  subject: string;
  status: string;
  division: string;
  requester: string;
  createdAt: string;
}

export async function getLetters(): Promise<LetterData[]> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("letter_requests")
    .select(`
      id,
      letter_type,
      subject,
      body,
      status,
      revision_count,
      created_at,
      division:divisions(name, slug),
      requester:committee_assignments!requester_id(
        user:profiles(full_name, nim)
      )
    `)
    .eq("committee_year_id", YEAR_ID)
    .order("created_at", { ascending: false });

  if (!data) return [];

  return data.map((l: any) => ({
    id: l.id,
    letterType: l.letter_type,
    subject: l.subject,
    status: l.status,
    division: l.division?.name ?? "",
    requester: l.requester?.user?.full_name ?? "",
    createdAt: l.created_at,
  }));
}

const statusLabel: Record<string, string> = {
  requested: "Requested",
  in_revision: "Revisi",
  approved: "Approved",
  sent: "Sent",
};

const statusVariant: Record<string, "warning" | "info" | "success" | "default"> = {
  requested: "warning",
  in_revision: "info",
  approved: "success",
  sent: "default",
};

export function getStatusDisplay(status: string): { label: string; variant: "warning" | "info" | "success" | "default" } {
  return {
    label: statusLabel[status] ?? status,
    variant: statusVariant[status] ?? "default",
  };
}
