import { createAdminClient } from "@/lib/supabase/admin";
import { generateGoogleCalendarUrl } from "@/lib/utils/calendar";

const FROM_EMAIL = process.env.EMAIL_FROM || "ifest.hmti@gmail.com";
const FROM_NAME = process.env.EMAIL_FROM_NAME || "Sintuwu";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://ifest-ms.vercel.app";
const UNTAD_LOGO_URL = `${APP_URL}/assets/logo_utama/logo_untad.webp`;
const HMTI_LOGO_URL = `${APP_URL}/assets/logo_utama/HMTI%20LOGO.webp`;
const IFEST_LOGO_URL = `${APP_URL}/assets/logo_utama/Logo-IFEST-2026.webp`;

interface EmailTemplateParams {
  recipientName: string;
  introText: string;
  boxTitle: string;
  boxContentHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  ctaExtraHtml?: string;   /* rendered after the main CTA button */
}

function getEmailTemplateHtml({
  recipientName,
  introText,
  boxTitle,
  boxContentHtml,
  ctaText = "Buka Dashboard",
  ctaUrl = `${APP_URL}/login`,
  ctaExtraHtml = "",
}: EmailTemplateParams): string {
  return `
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notifikasi I-FEST 2026</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #fdf8fa;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        color: #1d1b1d;
        -webkit-font-smoothing: antialiased;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        border: 1px solid #f2ecef;
      }
      .content {
        padding: 40px;
      }
      .greeting {
        font-size: 16px;
        font-weight: bold;
        color: #1d1b1d;
        margin-bottom: 16px;
      }
      .intro {
        font-size: 14px;
        line-height: 1.6;
        color: #4a454c;
        margin-bottom: 24px;
      }
      .highlight-box {
        background-color: #fdf8fa;
        border-left: 4px solid #FF3D8B;
        border-radius: 4px 12px 12px 4px;
        padding: 20px;
        margin-bottom: 24px;
      }
      .box-title {
        font-size: 13px;
        font-weight: bold;
        color: #FF3D8B;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .box-content {
        font-size: 14px;
        line-height: 1.6;
        color: #1d1b1d;
      }
      .cta-container {
        text-align: center;
        margin-top: 32px;
        margin-bottom: 32px;
      }
      .cta-button {
        display: inline-block;
        background-color: #000000;
        color: #ffffff !important;
        text-decoration: none;
        font-size: 14px;
        font-weight: bold;
        padding: 14px 28px;
        border-radius: 8px;
        letter-spacing: 0.02em;
      }
      .cta-extra {
        margin-top: 16px;
      }
      .footer {
        margin-top: 32px;
        border-top: 1px solid #f2ecef;
        padding-top: 24px;
      }
      .signature-label {
        font-size: 14px;
        color: #4a454c;
        margin-bottom: 4px;
      }
      .signature-name {
        font-size: 14px;
        font-weight: bold;
        color: #1d1b1d;
        margin-bottom: 2px;
      }
      .signature-sub {
        font-size: 12px;
        color: #7b757c;
      }
      .bottom-bar {
        background-color: #f8f2f4;
        padding: 32px 40px;
        text-align: center;
        border-top: 1px solid #ece7e9;
      }
      .logos {
        margin-bottom: 20px;
      }
      .logo-img {
        height: 24px;
        margin: 0 8px;
        vertical-align: middle;
      }
      .disclaimer {
        font-size: 11px;
        line-height: 1.5;
        color: #7b757c;
        margin-bottom: 8px;
      }
      .copyright {
        font-size: 11px;
        color: #7b757c;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="content">
        <div class="greeting">Yth. ${recipientName},</div>
        <div class="intro">
          ${introText}
        </div>

        <div class="highlight-box">
          <div class="box-title">${boxTitle}</div>
          <div class="box-content">
            ${boxContentHtml}
          </div>
        </div>

        <div class="intro">
          Silakan buka dashboard akun Anda untuk melihat rincian selengkapnya atau melakukan tindakan lebih lanjut.
        </div>

        <div class="cta-container">
          <a href="${ctaUrl}" class="cta-button" target="_blank">${ctaText}</a>
          <div class="cta-extra">
            ${ctaExtraHtml}
          </div>
        </div>

        <div class="footer">
          <div class="signature-label">Hormat kami,</div>
          <div class="signature-name">Panitia Pelaksana I-FEST 2026</div>
          <div class="signature-sub">HMTI — Universitas Tadulako</div>
        </div>
      </div>

      <div class="bottom-bar">
        <div class="logos">
          <img src="${UNTAD_LOGO_URL}" alt="UNTAD Logo" class="logo-img" style="height: 24px;">
          <img src="${HMTI_LOGO_URL}" alt="HMTI Logo" class="logo-img" style="height: 24px;">
          <img src="${IFEST_LOGO_URL}" alt="IFEST Logo" class="logo-img" style="height: 28px;">
        </div>
        <div class="disclaimer">
          Email ini dikirim secara otomatis oleh sistem Sintuwu. Mohon tidak membalas email ini.
        </div>
        <div class="copyright">
          © 2026 HMTI — Universitas Tadulako. All rights reserved.
        </div>
      </div>
    </div>
  </body>
</html>
  `.trim();
}

async function sendEmail(
  recipientEmail: string,
  recipientName: string,
  subject: string,
  htmlContent: string,
): Promise<string | null> {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { email: FROM_EMAIL, name: FROM_NAME },
        to: [{ email: recipientEmail, name: recipientName }],
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Email] Failed to send:", errorText);
      return `Gagal mengirim email: ${errorText}`;
    }

    return null;
  } catch (err) {
    console.error("[Email] Error:", err);
    return `Gagal mengirim email: ${err instanceof Error ? err.message : String(err)}`;
  }
}

export async function sendLetterNotification(
  recipientEmail: string,
  recipientName: string,
  subject: string,
  letterType: string,
  letterSubject: string,
  status: string,
): Promise<string | null> {
  const statusLabels: Record<string, string> = {
    requested: "diajukan",
    in_revision: "direvisi",
    approved: "disetujui",
    sent: "dikirim",
  };

  const displayStatus = statusLabels[status] ?? status;
  const introText = `Kami informasikan bahwa terdapat pembaruan resmi terkait pengajuan surat di <strong>Sintuwu</strong> HMTI Universitas Tadulako.`;

  const boxContentHtml = `
    <p style="margin: 4px 0;"><strong>Perihal Surat:</strong> ${letterSubject}</p>
    <p style="margin: 4px 0;"><strong>Jenis Surat:</strong> ${letterType}</p>
    <p style="margin: 4px 0;"><strong>Status Pengajuan:</strong> <span style="font-weight: bold; color: ${status === "approved" ? "#A8D5A2" : status === "requested" ? "#FF3D8B" : "#1d1b1d"}">${displayStatus}</span></p>
  `.trim();

  return await sendEmail(
    recipientEmail,
    recipientName,
    `[Surat] ${letterSubject}`,
    getEmailTemplateHtml({
      recipientName,
      introText,
      boxTitle: "Detail Surat",
      boxContentHtml,
      ctaUrl: `${APP_URL}/login`,
    }),
  );
}

export async function sendMeetingInvite(
  recipientEmail: string,
  recipientName: string,
  meetingTitle: string,
  startedAt: string,
  meetingLink: string | null,
  location: string | null,
  agenda: string | null,
): Promise<string | null> {
  const date = new Date(startedAt).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const introText = `Kami informasikan bahwa Anda telah diundang untuk menghadiri agenda rapat kepanitiaan di <strong>Sintuwu</strong> HMTI Universitas Tadulako.`;

  // Generate Google Calendar link
  const gcalUrl = generateGoogleCalendarUrl({
    title: meetingTitle,
    description: agenda,
    location: location ?? meetingLink ?? undefined,
    startedAt,
  });

  let boxContentHtml = `
    <p style="margin: 4px 0;"><strong>Nama Rapat:</strong> ${meetingTitle}</p>
    <p style="margin: 4px 0;"><strong>Waktu:</strong> ${date}</p>
  `;
  // Prioritas offline: tampilkan lokasi dulu, baru link online
  if (location) {
    boxContentHtml += `<p style="margin: 4px 0;"><strong>Lokasi:</strong> ${location}</p>`;
  }
  if (meetingLink) {
    boxContentHtml += `<p style="margin: 4px 0;"><strong>Tautan Online:</strong> <a href="${meetingLink}" style="color: #FF3D8B; text-decoration: underline;">Klik di sini</a></p>`;
  }
  if (agenda) {
    boxContentHtml += `<p style="margin: 8px 0 0 0; padding-top: 8px; border-top: 1px solid #f2ecef;"><strong>Agenda:</strong> ${agenda}</p>`;
  }

  // CTA — dashboard + Google Calendar
  const ctaHtml = `
    <div style="text-align: center; margin-top: 32px; margin-bottom: 32px;">
      <a href="${APP_URL}/login" style="display: inline-block; background-color: #000000; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: bold; padding: 14px 28px; border-radius: 8px; letter-spacing: 0.02em;">Buka Dashboard</a>
      <br><br>
      <a href="${gcalUrl}" target="_blank" style="display: inline-block; background-color: #ffffff; color: #1d1b1d !important; text-decoration: none; font-size: 13px; font-weight: bold; padding: 12px 24px; border-radius: 8px; border: 1px solid #d0c9cd; letter-spacing: 0.02em;">
        &#x1F4C5; Simpan ke Google Calendar
      </a>
    </div>
  `;

  return await sendEmail(
    recipientEmail,
    recipientName,
    `[Rapat] ${meetingTitle}`,
    getEmailTemplateHtml({
      recipientName,
      introText,
      boxTitle: "Detail Rapat",
      boxContentHtml,
      ctaText: "",       // we override the entire CTA section below
      ctaUrl: "",
    }).replace(
      /<div class="cta-container">[\s\S]*?<\/div>/,
      ctaHtml,
    ),
  );
}

export async function sendEmailNotification(
  recipientEmail: string,
  recipientName: string,
  subject: string,
  htmlContent: string,
): Promise<string | null> {
  const introText = `Kami informasikan bahwa terdapat notifikasi penting dari sistem kepanitiaan <strong>Sintuwu</strong> HMTI Universitas Tadulako.`;

  return await sendEmail(
    recipientEmail,
    recipientName,
    subject,
    getEmailTemplateHtml({
      recipientName,
      introText,
      boxTitle: "Pesan Sistem",
      boxContentHtml: htmlContent,
    }),
  );
}

export async function sendWelcomeEmail(
  recipientEmail: string,
  recipientName: string,
  password: string,
): Promise<string | null> {
  const introText = `Selamat! Anda telah terdaftar sebagai panitia pelaksana kegiatan <strong>Informatics Festival (I-FEST) 2026</strong>. Akun Anda telah berhasil dibuat di <strong>Sintuwu</strong>.`;

  const boxContentHtml = `
    <p style="margin: 4px 0;"><strong>Email Login:</strong> ${recipientEmail}</p>
    <p style="margin: 4px 0;"><strong>Password Sementara:</strong> <code style="background-color: #f2ecef; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${password}</code></p>
    <p style="margin: 12px 0 0 0; font-size: 12px; color: #7b757c; font-style: italic;">Silakan ganti password Anda demi keamanan setelah pertama kali masuk.</p>
  `.trim();

  return await sendEmail(
    recipientEmail,
    recipientName,
    "Selamat Datang di Sintuwu!",
    getEmailTemplateHtml({
      recipientName,
      introText,
      boxTitle: "Informasi Login Akun",
      boxContentHtml,
      ctaText: "Login ke Dashboard",
      ctaUrl: `${APP_URL}/login`,
    }),
  );
}

export async function sendBroadcastEmail(
  recipientEmail: string,
  recipientName: string,
  subject: string,
  boxTitle: string,
  bodyHtml: string,
): Promise<string | null> {
  const introText = `Berikut adalah pengumuman resmi dari PIC / Penanggung Jawab untuk seluruh panitia pelaksana I-FEST 2026.`;
  return await sendEmail(
    recipientEmail,
    recipientName,
    subject,
    getEmailTemplateHtml({
      recipientName,
      introText,
      boxTitle: boxTitle || "PENGUMUMAN PANITIA",
      boxContentHtml: bodyHtml.replace(/\n/g, "<br>"), // support simple newlines
    }),
  );
}

