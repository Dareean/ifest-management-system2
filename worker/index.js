// ============================================================
// I-FEST Management System — Background Worker
// Deployed on Render as a Cron Job
// ============================================================

const { createClient } = require("@supabase/supabase-js");

// Config from environment (set in Render dashboard)
const SUPABASE_URL = process.env.SUPABASE_URL || "https://xxmxbyiggrottreetrig.supabase.co";
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const YEAR_ID = process.env.YEAR_ID || "c2f2a48e-3e58-4559-aaa0-623a3825348b";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const FROM_EMAIL = "ifest.hmti@gmail.com";
const FROM_NAME = "I-FEST Management System";

// ============================================================
// 1. Email Queue Processor
// Retry failed emails from email_queue table
// ============================================================
async function processEmailQueue() {
  console.log("[Worker] Processing email queue...");

  const { data: pending } = await supabase
    .from("email_queue")
    .select("*")
    .in("status", ["pending", "failed"])
    .lt("retry_count", supabase.rpc("coalesce", { "max_retries": 3 }))
    .order("priority", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(50);

  if (!pending || pending.length === 0) {
    console.log("[Worker] No pending emails.");
    return;
  }

  for (const email of pending) {
    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": BREVO_API_KEY,
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
        console.log(`[Worker] Email sent: ${email.id}`);
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
        console.error(`[Worker] Email failed: ${email.id} — ${errText}`);
      }
    } catch (err) {
      console.error(`[Worker] Email error: ${email.id} — ${err.message}`);
    }
  }
}

// ============================================================
// 2. KPI Deadline Reminder
// Notify coordinators about approaching KPI deadlines
// ============================================================
async function checkKpiDeadlines() {
  console.log("[Worker] Checking KPI deadlines...");

  const today = new Date();
  const targets = [7, 3, 1]; // H-7, H-3, H-1

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
        console.log(`[Worker] KPI reminder sent: ${kpi.title} (H-${days})`);
      }
    }
  }
}

// ============================================================
// 3. Meeting Cleanup
// Auto-close meetings that ended more than 24 hours ago
// ============================================================
async function cleanupMeetings() {
  console.log("[Worker] Cleaning up expired meetings...");

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  await supabase
    .from("meetings")
    .update({ ended_at: cutoff })
    .is("ended_at", null)
    .lt("started_at", cutoff);

  console.log("[Worker] Meetings cleaned up.");
}

// ============================================================
// 4. Note Reminder
// Remind about unpublished meeting notes (H+1, H+2, H+3)
// ============================================================
async function checkUnpublishedNotes() {
  console.log("[Worker] Checking unpublished notes...");

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

    if (notes?.published_at) continue; // already published

    const hoursElapsed = (Date.now() - new Date(mtg.started_at).getTime()) / (1000 * 60 * 60);
    const daysElapsed = Math.floor(hoursElapsed / 24);

    if (daysElapsed === 1 || daysElapsed === 2 || daysElapsed === 3) {
      await supabase.from("notifications").insert({
        committee_assignment_id: mtg.creator_id,
        type: "note_reminder",
        title: `Notulensi rapat "${mtg.title}" belum dipublish`,
        body: `Sudah H+${daysElapsed}. Target maksimal H+3.`,
      });
      console.log(`[Worker] Note reminder: ${mtg.title} (H+${daysElapsed})`);
    }
  }
}

// ============================================================
// Main — detect which cron to run via env CRON_TASK
// Or run all if no specific task
// ============================================================
async function main() {
  const task = process.env.CRON_TASK || "all";
  console.log(`[Worker] Starting task: ${task}`);

  try {
    switch (task) {
      case "email":
        await processEmailQueue();
        break;
      case "kpi":
        await checkKpiDeadlines();
        break;
      case "meeting":
        await cleanupMeetings();
        break;
      case "notes":
        await checkUnpublishedNotes();
        break;
      default:
        await Promise.all([
          processEmailQueue(),
          checkKpiDeadlines(),
          cleanupMeetings(),
          checkUnpublishedNotes(),
        ]);
    }
  } catch (err) {
    console.error("[Worker] Error:", err);
    process.exit(1);
  }

  console.log("[Worker] Done.");
  process.exit(0);
}

main();
