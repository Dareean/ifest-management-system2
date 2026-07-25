"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

async function requireActiveMember() {
  const auth = await createClient();
  const { data: authData } = await auth.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) return null;

  const admin = createAdminClient();
  const { data: assignment } = await admin
    .from("committee_assignments")
    .select("id")
    .eq("committee_year_id", YEAR_ID)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (!assignment) return null;
  return { id: (assignment as any).id };
}

function toCSV(headers: string[], rows: any[][]): string {
  const escape = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
}

// ============================================================
// Task Export
// ============================================================

export async function exportTasksCSV() {
  const member = await requireActiveMember();
  if (!member) return "";
  const supabase = createAdminClient();

  const { data: divisions } = await supabase
    .from("divisions")
    .select("id, name, slug")
    .eq("committee_year_id", YEAR_ID)
    .order("sort_order");

  if (!divisions) return "";

  const rows: string[][] = [];
  for (const div of divisions) {
    const { data: tasks } = await supabase
      .from("tasks")
      .select(`
        title,
        description,
        status,
        priority,
        deadline,
        assignee:committee_assignments(
          profiles(full_name)
        )
      `)
      .eq("committee_year_id", YEAR_ID)
      .eq("division_id", div.id)
      .order("created_at");

    if (tasks) {
      for (const t of tasks) {
        const assigneeName = (t.assignee as any)?.profiles?.full_name ?? "-";
        rows.push([
          div.name,
          t.title,
          t.description ?? "-",
          t.priority,
          t.status === "done" ? "Selesai" : "Todo",
          t.deadline ?? "-",
          assigneeName,
        ]);
      }
    }
  }

  return toCSV(
    ["Divisi", "Judul Task", "Deskripsi", "Prioritas", "Status", "Deadline", "Penanggung Jawab"],
    rows,
  );
}

// Keep exportKpiCSV as alias for safety
export async function exportKpiCSV() {
  return exportTasksCSV();
}

// ============================================================
// Surat Export
// ============================================================

export async function exportLettersCSV() {
  const member = await requireActiveMember();
  if (!member) return "";
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("letter_requests")
    .select(`
      letter_type, subject, status, revision_count, priority,
      category, deadline_at, target_institution, created_at,
      division:divisions(name),
      requester:committee_assignments!requester_id(user:profiles(full_name))
    `)
    .eq("committee_year_id", YEAR_ID)
    .order("created_at", { ascending: false });

  if (!data) return "";

  const rows = data.map((r: any) => [
    r.letter_type,
    r.subject,
    r.status,
    r.priority ?? "sedang",
    r.category ?? "",
    r.deadline_at ?? "",
    r.target_institution ?? "",
    String(r.revision_count),
    r.division?.name ?? "",
    r.requester?.user?.full_name ?? "",
    new Date(r.created_at).toLocaleDateString("id-ID"),
  ]);

  return toCSV(
    ["Jenis Surat", "Perihal", "Status", "Prioritas", "Kategori", "Deadline", "Instansi Tujuan", "Revisi", "Divisi", "Pengaju", "Tanggal"],
    rows,
  );
}

// ============================================================
// Rapat Export
// ============================================================

export async function exportMeetingsCSV() {
  const member = await requireActiveMember();
  if (!member) return "";
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("meetings")
    .select(`
      id, title, agenda, meeting_type, meeting_link, location, started_at, ended_at, scope,
      creator:committee_assignments!creator_id(user:profiles(full_name))
    `)
    .eq("committee_year_id", YEAR_ID)
    .order("started_at", { ascending: false });

  if (!data) return "";

  const rows: string[][] = [];
  for (const m of data as any[]) {
    const { data: notes } = await supabase
      .from("meeting_notes")
      .select("published_at")
      .eq("meeting_id", m.id)
      .maybeSingle();

    rows.push([
      m.title,
      m.agenda ?? "-",
      m.meeting_type,
      m.meeting_link ?? "-",
      m.location ?? "-",
      new Date(m.started_at).toLocaleDateString("id-ID"),
      m.ended_at ? new Date(m.ended_at).toLocaleDateString("id-ID") : "-",
      m.creator?.user?.full_name ?? "",
      m.scope ?? "individual",
      notes?.published_at ? "Published" : "Draft",
    ]);
  }

  return toCSV(
    ["Judul", "Agenda", "Tipe", "Link", "Lokasi", "Mulai", "Selesai", "Pembuat", "Lingkup", "Notulensi"],
    rows,
  );
}

// ============================================================
// Personel Export
// ============================================================

export async function exportPersonnelCSV() {
  const member = await requireActiveMember();
  if (!member) return "";
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("committee_assignments")
    .select(`
      user:profiles(full_name, nim),
      division:divisions(name),
      role:roles(name, level)
    `)
    .eq("committee_year_id", YEAR_ID)
    .eq("is_active", true)
    .order("level", { ascending: false });

  if (!data) return "";

  const rows = data.map((a: any) => [
    a.user?.full_name ?? "",
    a.user?.nim ?? "",
    a.division?.name ?? "",
    a.role?.name ?? "",
    String(a.role?.level ?? 0),
  ]);

  return toCSV(["Nama", "NIM", "Divisi", "Jabatan", "Level"], rows);
}
