import { createAdminClient } from "@/lib/supabase/admin";

export interface LetterDetail {
  id: string;
  letterType: string;
  subject: string;
  body: string;
  status: string;
  revisionCount: number;
  finalDocumentUrl: string | null;
  createdAt: string;
  updatedAt: string;
  division: string;
  requester: string;
  handler: string | null;
  revisions: {
    id: string;
    note: string;
    reviewer: string;
    createdAt: string;
  }[];
}

export async function getLetterDetail(id: string): Promise<LetterDetail | null> {
  const supabase = createAdminClient();

  const { data: letter } = await supabase
    .from("letter_requests")
    .select(`
      id,
      letter_type,
      subject,
      body,
      status,
      revision_count,
      final_document_url,
      created_at,
      updated_at,
      division:divisions(name),
      requester:committee_assignments!requester_id(user:users(full_name)),
      handler:committee_assignments!current_handler_id(user:users(full_name))
    `)
    .eq("id", id)
    .single();

  if (!letter) return null;

  const { data: revisions } = await supabase
    .from("letter_revisions")
    .select(`
      id,
      note,
      created_at,
      reviewer:committee_assignments(user:users(full_name))
    `)
    .eq("letter_request_id", id)
    .order("created_at", { ascending: false });

  const l = letter as any;

  return {
    id: l.id,
    letterType: l.letter_type,
    subject: l.subject,
    body: l.body,
    status: l.status,
    revisionCount: l.revision_count ?? 0,
    finalDocumentUrl: l.final_document_url,
    createdAt: l.created_at,
    updatedAt: l.updated_at,
    division: l.division?.name ?? "",
    requester: l.requester?.user?.full_name ?? "",
    handler: l.handler?.user?.full_name ?? null,
    revisions: (revisions ?? []).map((r: any) => ({
      id: r.id,
      note: r.note,
      reviewer: r.reviewer?.user?.full_name ?? "",
      createdAt: r.created_at,
    })),
  };
}
