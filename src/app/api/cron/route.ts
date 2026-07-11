import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";

const FROM_EMAIL = "ifest.hmti@gmail.com";
const FROM_NAME = "I-FEST Management System";
const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";
const BATCH_SIZE = 20;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const task = searchParams.get("task") || "all";

  const supabase = createAdminClient();
  const results: string[] = [];

  try {
    switch (task) {
      case "email":
        await processEmailQueue(supabase, results);
        break;
      case "kpi":
        await checkKpiDeadlines(supabase, results);
        break;
      case "meeting":
        await cleanupMeetings(supabase, results);
        break;
      case "notes":
        await checkUnpublishedNotes(supabase, results);
        break;
      default:
        await Promise.all([
          processEmailQueue(supabase, results),
          checkKpiDeadlines(supabase, results),
          cleanupMeetings(supabase, results),
          checkUnpublishedNotes(supabase, results),
        ]);
    }

    return NextResponse.json({ success: true, task, results });
  } catch (error) {
    console.error("[Cron] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

async function processEmailQueue(supabase: SupabaseClient, results: string[]) {
  const { data: pending } = await supabase
    .from("email_queue")
    .select("*")
    .in("status", ["pending", "failed"])
    .lt("retry_count", 3)
    .order("priority", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(BATCH_SIZE);

  if (!pending || pending.length === 0) {
    results.push("No pending emails");
    return;
  }

  for (const email of pending) {
    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": process.env.BREVO_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { email: FROM_EMAIL, name: FROM_NAME },
          to: [{ email: email.recipient_email, name: email.recipient_name || "" }],
          subject: email.subject,
          htmlContent: email.html_content,
        }),
      });

      if (response.ok) {
        await supabase
          .from("email_queue")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", email.id);
        results.push(`Sent: ${email.id}`);
      } else {
        const errText = await response.text();
        const newRetry = (email.retry_count || 0) + 1;
        await supabase
          .from("email_queue")
          .update({
            status: newRetry >= 3 ? "failed" : "pending",
            retry_count: newRetry,
            error_message: errText,
          })
          .eq("id", email.id);
        results.push(`Failed: ${email.id} — ${errText}`);
      }
    } catch (err) {
      results.push(`Error: ${email.id} — ${(err as Error).message}`);
    }
  }
}

async function checkKpiDeadlines(supabase: SupabaseClient, results: string[]) {
  const today = new Date();
  const targets = [7, 3, 1];

  for (const days of targets) {
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + days);
    const dateStr = targetDate.toISOString().slice(0, 10);

    const { data: kpis } = await supabase
      .from("kpi_items")
      .select("id, title, division_id")
      .eq("committee_year_id", YEAR_ID)
      .eq("deadline", dateStr);

    if (!kpis || kpis.length === 0) continue;

    for (const kpi of kpis) {
      const { data: members } = await supabase
        .from("committee_assignments")
        .select("id")
        .eq("committee_year_id", YEAR_ID)
        .eq("division_id", kpi.division_id)
        .eq("is_active", true);

      if (members) {
        const notifications = members.map((m) => ({
          committee_assignment_id: m.id,
          type: "kpi_reminder",
          title: `Deadline KPI: ${kpi.title}`,
          body: `Tersisa ${days} hari lagi. Segera selesaikan target KPI ini.`,
        }));

        await supabase.from("notifications").insert(notifications);
        results.push(`KPI reminder: ${kpi.title} (H-${days})`);
      }
    }
  }
}

async function cleanupMeetings(supabase: SupabaseClient, results: string[]) {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from("meetings")
    .update({ ended_at: cutoff })
    .is("ended_at", null)
    .lt("started_at", cutoff)
    .select("id");

  results.push(`Cleaned up ${data?.length || 0} meetings`);
}

async function checkUnpublishedNotes(supabase: SupabaseClient, results: string[]) {
  const { data: meetings } = await supabase
    .from("meetings")
    .select("id, title, started_at, creator_id")
    .eq("committee_year_id", YEAR_ID)
    .not("ended_at", "is", null);

  if (!meetings) return;

  for (const mtg of meetings) {
    const { data: notes } = await supabase
      .from("meeting_notes")
      .select("published_at")
      .eq("meeting_id", mtg.id)
      .maybeSingle();

    if (notes?.published_at) continue;

    const hoursElapsed = (Date.now() - new Date(mtg.started_at).getTime()) / (1000 * 60 * 60);
    const daysElapsed = Math.floor(hoursElapsed / 24);

    if (daysElapsed === 1 || daysElapsed === 2 || daysElapsed === 3) {
      await supabase.from("notifications").insert({
        committee_assignment_id: mtg.creator_id,
        type: "note_reminder",
        title: `Notulensi rapat "${mtg.title}" belum dipublish`,
        body: `Sudah H+${daysElapsed}. Target maksimal H+3.`,
      });
      results.push(`Note reminder: ${mtg.title} (H+${daysElapsed})`);
    }
  }
}
