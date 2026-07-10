import { BrevoClient } from "@getbrevo/brevo";
import { createAdminClient } from "@/lib/supabase/admin";

const FROM_EMAIL = "ifest.hmti@gmail.com";
const FROM_NAME = "I-FEST Management System";

function createBrevoClient() {
  return new BrevoClient({ apiKey: process.env.BREVO_API_KEY! });
}

export async function sendLetterNotification(
  recipientEmail: string,
  recipientName: string,
  subject: string,
  letterType: string,
  letterSubject: string,
  status: string,
) {
  try {
    const client = createBrevoClient();
    const statusLabels: Record<string, string> = {
      requested: "diajukan",
      in_revision: "direvisi",
      approved: "disetujui",
      sent: "dikirim",
    };

    await client.transactionalEmails.sendTransacEmail({
      sender: { email: FROM_EMAIL, name: FROM_NAME },
      to: [{ email: recipientEmail, name: recipientName }],
      subject: `[Surat] ${letterSubject}`,
      htmlContent: `
        <div style="font-family: Geist, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #001233;">I-FEST Management System</h2>
          <p>Halo <strong>${recipientName}</strong>,</p>
          <p>Permohonan surat <strong>${letterSubject}</strong> (${letterType}) telah <strong>${statusLabels[status] ?? status}</strong>.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0;" />
          <p style="color: #666; font-size: 12px;">
            Email ini dikirim otomatis oleh I-FEST Management System HMTI UNTAD.
          </p>
        </div>
      `,
    });
  } catch (e) {
    console.error("Brevo sendLetterNotification failed:", e);
  }
}

export async function sendMeetingInvite(
  recipientEmail: string,
  recipientName: string,
  meetingTitle: string,
  startedAt: string,
  meetingLink: string | null,
  location: string | null,
  agenda: string | null,
) {
  try {
    const client = createBrevoClient();
    const date = new Date(startedAt).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    let detailsHtml = `<p><strong>Waktu:</strong> ${date}</p>`;
    if (meetingLink) detailsHtml += `<p><strong>Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>`;
    if (location) detailsHtml += `<p><strong>Lokasi:</strong> ${location}</p>`;
    if (agenda) detailsHtml += `<p><strong>Agenda:</strong> ${agenda}</p>`;

    await client.transactionalEmails.sendTransacEmail({
      sender: { email: FROM_EMAIL, name: FROM_NAME },
      to: [{ email: recipientEmail, name: recipientName }],
      subject: `[Rapat] ${meetingTitle}`,
      htmlContent: `
        <div style="font-family: Geist, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #001233;">I-FEST Management System</h2>
          <p>Halo <strong>${recipientName}</strong>,</p>
          <p>Anda diundang untuk menghadiri rapat:</p>
          <h3 style="color: #0466c8;">${meetingTitle}</h3>
          ${detailsHtml}
          <hr style="border: none; border-top: 1px solid #e0e0e0;" />
          <p style="color: #666; font-size: 12px;">
            Email ini dikirim otomatis oleh I-FEST Management System HMTI UNTAD.
          </p>
        </div>
      `,
    });
  } catch (e) {
    console.error("Brevo sendMeetingInvite failed:", e);
  }
}

export async function sendEmailNotification(
  recipientEmail: string,
  recipientName: string,
  subject: string,
  htmlContent: string,
) {
  try {
    const client = createBrevoClient();
    await client.transactionalEmails.sendTransacEmail({
      sender: { email: FROM_EMAIL, name: FROM_NAME },
      to: [{ email: recipientEmail, name: recipientName }],
      subject,
      htmlContent: `
        <div style="font-family: Geist, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #001233;">I-FEST Management System</h2>
          ${htmlContent}
          <hr style="border: none; border-top: 1px solid #e0e0e0;" />
          <p style="color: #666; font-size: 12px;">
            Email ini dikirim otomatis oleh I-FEST Management System HMTI UNTAD.
          </p>
        </div>
      `,
    });
  } catch (e) {
    console.error("Brevo sendEmailNotification failed:", e);
  }
}
