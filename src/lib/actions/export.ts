"use server";

import { createAdminClient } from "@/lib/supabase/admin";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

function toCSV(headers: string[], rows: string[][]): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
}

// ============================================================
// KPI Export
// ============================================================

export async function exportKpiCSV() {
  const supabase = createAdminClient();

  const { data: divisions } = await supabase
    .from("divisions")
    .select("id, name, slug")
    .eq("committee_year_id", YEAR_ID)
    .order("sort_order");

  if (!divisions) return "";

  const rows: string[][] = [];
  for (const div of divisions) {
      const { data: kpis } = await supabase
        .from("kpi_items")
        .select("id, title, target, deadline, is_milestone")
        .eq("committee_year_id", YEAR_ID)
        .eq("division_id", div.id);

    if (kpis) {
      for (const kpi of kpis) {
        const { data: tasks } = await supabase
          .from("tasks")
          .select("title, status")
          .eq("committee_year_id", YEAR_ID)
          .eq("kpi_item_id", kpi.id);

        const totalTasks = tasks?.length ?? 0;
        const doneTasks = tasks?.filter((t) => t.status === "done").length ?? 0;

        rows.push([
          div.name,
          kpi.title,
          kpi.target,
          kpi.deadline ?? "-",
          kpi.is_milestone ? "Milestone" : "Reguler",
          String(totalTasks),
          String(doneTasks),
          totalTasks > 0 ? `${Math.round((doneTasks / totalTasks) * 100)}%` : "-",
        ]);
      }
    }
  }

  return toCSV(
    ["Divisi", "KPI", "Target", "Deadline", "Tipe", "Total Task", "Selesai", "Progress"],
    rows,
  );
}

// ============================================================
// Surat Export
// ============================================================

export async function exportLettersCSV() {
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
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("meetings")
    .select(`
      id, title, agenda, meeting_type, meeting_link, location, started_at, ended_at,
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
      notes?.published_at ? "Published" : "Draft",
    ]);
  }

  return toCSV(
    ["Judul", "Agenda", "Tipe", "Link", "Lokasi", "Mulai", "Selesai", "Pembuat", "Notulensi"],
    rows,
  );
}

// ============================================================
// Personel Export
// ============================================================

export async function exportPersonnelCSV() {
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
