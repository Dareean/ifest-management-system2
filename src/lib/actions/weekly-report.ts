"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendEmailNotification } from "@/lib/email";
import { DIVISION_MAP } from "@/lib/data/weekly-report";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

async function requireActiveMember() {
  const auth = await createClient();
  const { data: authData } = await auth.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) return null;

  const admin = createAdminClient();
  const { data: assignment } = await admin
    .from("committee_assignments")
    .select("id, division_id, role:roles(level, slug, is_report_creator)")
    .eq("committee_year_id", YEAR_ID)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (!assignment) return null;
  return assignment as any;
}

export async function submitWeeklyReport(prevState: any, formData: FormData) {
  const caller = await requireActiveMember();
  if (!caller) return { error: "Silakan login terlebih dahulu." };

  const supabase = createAdminClient();
  const divisionId = formData.get("division_id") as string;
  const weekLabel = formData.get("week_label") as string;
  const achievements = formData.get("achievements") as string;
  const blockers = formData.get("blockers") as string;
  const nextWeekTargets = formData.get("next_week_targets") as string;
  const attachmentUrl = formData.get("attachment_url") as string || null;

  if (!divisionId || !weekLabel || !achievements || !blockers || !nextWeekTargets) {
    return { error: "Semua field wajib diisi." };
  }

  // Auth check: caller must have is_report_creator or be BPH Admin (level >= 90)
  const level = caller.role?.level ?? 0;
  const canReport = !!caller.role?.is_report_creator || level >= 90;
  if (!canReport) {
    return { error: "Anda tidak memiliki akses untuk menyetor laporan." };
  }
  if (level < 70 && caller.division_id !== divisionId) {
    return { error: "Anda hanya dapat menyetor laporan untuk divisi Anda sendiri." };
  }

  // Check if report already exists for this week
  const { data: existingReport } = await supabase
    .from("weekly_reports")
    .select("id, status")
    .eq("division_id", divisionId)
    .eq("week_label", weekLabel)
    .maybeSingle();

  if (existingReport && existingReport.status === "APPROVED") {
    return { error: "Laporan untuk minggu ini sudah disetujui dan tidak dapat diubah." };
  }

  // 1. Fetch division detail to get name, slug, and supervisor info
  const { data: division } = await supabase
    .from("divisions")
    .select(`
      name, 
      slug, 
      supervisor:committee_assignments!divisions_supervisor_id_fkey(
        id,
        user_id,
        profiles(full_name)
      )
    `)
    .eq("id", divisionId)
    .single();

  const divisionName = DIVISION_MAP[division?.slug || ""] || division?.name || "Divisi";

  let reportId = existingReport?.id;

  if (existingReport) {
    // Update existing report
    const { error: updateError } = await supabase
      .from("weekly_reports")
      .update({
        achievements,
        blockers,
        next_week_targets: nextWeekTargets,
        status: "PENDING", // Reset status to PENDING upon resubmission
        submitted_by: caller.id,
        attachment_url: attachmentUrl,
        updated_at: new Date().toISOString()
      })
      .eq("id", existingReport.id);

    if (updateError) return { error: updateError.message };
  } else {
    // Insert new report
    const { data: newReport, error: insertError } = await supabase
      .from("weekly_reports")
      .insert({
        committee_year_id: YEAR_ID,
        division_id: divisionId,
        submitted_by: caller.id,
        week_label: weekLabel,
        achievements,
        blockers,
        next_week_targets: nextWeekTargets,
        attachment_url: attachmentUrl,
        status: "PENDING"
      })
      .select("id")
      .single();

    if (insertError) return { error: insertError.message };
    reportId = newReport.id;
  }

  // 2. Send email notification to supervisor if supervisor exists
  const supervisor = division?.supervisor as any;
  if (supervisor && supervisor.user_id) {
    const supervisorUserId = supervisor.user_id;
    const supervisorName = supervisor.profiles?.full_name || "Pengawas";
    
    // Get supervisor email from Auth admin
    const { data: authUser } = await supabase.auth.admin.getUserById(supervisorUserId);
    const supervisorEmail = authUser?.user?.email;

    if (supervisorEmail) {
      const subject = `[Weekly Report] Laporan Baru - Divisi ${divisionName} (${weekLabel})`;
      const htmlContent = `
        <p>Halo, <strong>${supervisorName}</strong>.</p>
        <p>Laporan progres mingguan baru telah diserahkan oleh Koordinator divisi <strong>${divisionName}</strong> untuk minggu <strong>${weekLabel}</strong>.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background-color: #f9f9f9; width: 30%;">Achievements</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${achievements.replace(/\n/g, "<br>")}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background-color: #f9f9f9;">Blockers</td>
            <td style="padding: 8px; border: 1px solid #ddd; color: #EF4444;">${blockers.replace(/\n/g, "<br>")}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background-color: #f9f9f9;">Next Week Targets</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${nextWeekTargets.replace(/\n/g, "<br>")}</td>
          </tr>
        </table>
        
        <p style="margin-top: 20px;">Silakan login ke dashboard Sintuwu untuk melakukan review dan menyetujui laporan tersebut.</p>
      `.trim();

      await sendEmailNotification(supervisorEmail, supervisorName, subject, htmlContent);
    }
  }

  revalidatePath("/dashboard/weekly-report");
  return { success: true };
}

export async function reviewWeeklyReport(
  reportId: string,
  status: "APPROVED" | "NEED_FIX",
  supervisorNotes: string
) {
  const caller = await requireActiveMember();
  if (!caller) return { error: "Silakan login terlebih dahulu." };

  const supabase = createAdminClient();

  // Fetch report details first to check ownership and gather data for notification
  const { data: report, error: reportError } = await supabase
    .from("weekly_reports")
    .select(`
      id,
      week_label,
      division_id,
      division:divisions(id, name, slug, supervisor_id),
      submitter:committee_assignments!weekly_reports_submitted_by_fkey(
        id,
        user_id,
        profiles(full_name)
      )
    `)
    .eq("id", reportId)
    .maybeSingle();

  if (reportError || !report) {
    return { error: "Laporan tidak ditemukan." };
  }

  const level = caller.role?.level ?? 0;
  const isSupervisor = (report.division as any)?.supervisor_id === caller.id;

  // Authorization check: User must be either the assigned supervisor of the division or BPH (level >= 75)
  if (!isSupervisor && level < 75) {
    return { error: "Anda tidak memiliki wewenang untuk memeriksa laporan divisi ini." };
  }

  // Update report
  const { error: updateError } = await supabase
    .from("weekly_reports")
    .update({
      status,
      supervisor_notes: supervisorNotes || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", reportId);

  if (updateError) return { error: updateError.message };

  // Send email notification to coordinator (the submitter)
  const submitter = report.submitter as any;
  const divisionName = DIVISION_MAP[(report.division as any)?.slug || ""] || (report.division as any)?.name || "Divisi";

  if (submitter && submitter.user_id) {
    const submitterUserId = submitter.user_id;
    const submitterName = submitter.profiles?.full_name || "Koordinator";

    // Get coordinator email from Auth admin
    const { data: authUser } = await supabase.auth.admin.getUserById(submitterUserId);
    const submitterEmail = authUser?.user?.email;

    if (submitterEmail) {
      const statusLabel = status === "APPROVED" ? "DISETUJUI" : "BUTUH REVISI";
      const subject = `[Weekly Report] Pembaruan Status - Divisi ${divisionName} (${report.week_label})`;
      const statusColor = status === "APPROVED" ? "#10B981" : "#EF4444";
      
      const htmlContent = `
        <p>Halo, <strong>${submitterName}</strong>.</p>
        <p>Laporan progres mingguan Anda untuk divisi <strong>${divisionName}</strong> (Minggu: <strong>${report.week_label}</strong>) telah diperiksa oleh Pengawas Operasional.</p>
        
        <div style="margin: 16px 0; padding: 16px; border-radius: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">
          <p style="margin: 4px 0;"><strong>Status Laporan:</strong> <span style="font-weight: bold; color: ${statusColor};">${statusLabel}</span></p>
          <p style="margin: 12px 0 4px 0;"><strong>Catatan Pengawas:</strong></p>
          <p style="margin: 0; font-style: italic; color: #4a454c; background-color: #ffffff; padding: 12px; border-radius: 4px; border-left: 4px solid #FF3D8B;">
            ${(supervisorNotes || "Tidak ada catatan tambahan.").replace(/\n/g, "<br>")}
          </p>
        </div>
        
        <p>Silakan buka dashboard Sintuwu untuk melihat detail laporan atau melakukan revisi jika dibutuhkan.</p>
      `.trim();

      await sendEmailNotification(submitterEmail, submitterName, subject, htmlContent);
    }
  }

  revalidatePath("/dashboard/weekly-report");
  return { success: true };
}
