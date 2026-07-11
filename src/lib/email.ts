import { createAdminClient } from "@/lib/supabase/admin";

const FROM_EMAIL = "ifest.hmti@gmail.com";
const FROM_NAME = "I-FEST Management System";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://ifest-management-system.onrender.com";
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
}

function getEmailTemplateHtml({
  recipientName,
  introText,
  boxTitle,
  boxContentHtml,
  ctaText = "Buka Dashboard",
  ctaUrl = `${APP_URL}/dashboard`,
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
          Email ini dikirim secara otomatis oleh sistem I-FEST 2026. Mohon tidak membalas email ini.
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

async function queueEmail(
  recipientEmail: string,
  recipientName: string,
  subject: string,
  htmlContent: string,
  priority = 0,
) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("email_queue").insert({
    recipient_email: recipientEmail,
    recipient_name: recipientName,
    subject,
    html_content: htmlContent,
    priority,
    status: "pending",
    retry_count: 0,
  });
  if (error) {
    console.error("[EmailQueue] Insert failed:", error);
  }
}

export async function sendLetterNotification(
  recipientEmail: string,
  recipientName: string,
  subject: string,
  letterType: string,
  letterSubject: string,
  status: string,
) {
  const statusLabels: Record<string, string> = {
    requested: "diajukan",
    in_revision: "direvisi",
    approved: "disetujui",
    sent: "dikirim",
  };

  const displayStatus = statusLabels[status] ?? status;
  const introText = `Kami informasikan bahwa terdapat pembaruan resmi terkait pengajuan surat di <strong>I-FEST Management System</strong> HMTI Universitas Tadulako.`;
  
  const boxContentHtml = `
    <p style="margin: 4px 0;"><strong>Perihal Surat:</strong> ${letterSubject}</p>
    <p style="margin: 4px 0;"><strong>Jenis Surat:</strong> ${letterType}</p>
    <p style="margin: 4px 0;"><strong>Status Pengajuan:</strong> <span style="font-weight: bold; color: ${status === "approved" ? "#A8D5A2" : status === "requested" ? "#FF3D8B" : "#1d1b1d"}">${displayStatus}</span></p>
  `.trim();

  await queueEmail(
    recipientEmail,
    recipientName,
    `[Surat] ${letterSubject}`,
    getEmailTemplateHtml({
      recipientName,
      introText,
      boxTitle: "Detail Surat",
      boxContentHtml,
      ctaUrl: `${APP_URL}/dashboard/letters`,
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
) {
  const date = new Date(startedAt).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const introText = `Kami informasikan bahwa Anda telah diundang untuk menghadiri agenda rapat kepanitiaan di <strong>I-FEST Management System</strong> HMTI Universitas Tadulako.`;

  let boxContentHtml = `
    <p style="margin: 4px 0;"><strong>Nama Rapat:</strong> ${meetingTitle}</p>
    <p style="margin: 4px 0;"><strong>Waktu:</strong> ${date}</p>
  `;
  if (location) {
    boxContentHtml += `<p style="margin: 4px 0;"><strong>Lokasi:</strong> ${location}</p>`;
  }
  if (meetingLink) {
    boxContentHtml += `<p style="margin: 4px 0;"><strong>Tautan:</strong> <a href="${meetingLink}" style="color: #FF3D8B; text-decoration: underline;">Hubungi Link Pertemuan</a></p>`;
  }
  if (agenda) {
    boxContentHtml += `<p style="margin: 8px 0 0 0; padding-top: 8px; border-top: 1px solid #f2ecef;"><strong>Agenda:</strong> ${agenda}</p>`;
  }

  await queueEmail(
    recipientEmail,
    recipientName,
    `[Rapat] ${meetingTitle}`,
    getEmailTemplateHtml({
      recipientName,
      introText,
      boxTitle: "Detail Rapat",
      boxContentHtml,
      ctaUrl: `${APP_URL}/dashboard/meetings`,
    }),
  );
}

export async function sendEmailNotification(
  recipientEmail: string,
  recipientName: string,
  subject: string,
  htmlContent: string,
) {
  const introText = `Kami informasikan bahwa terdapat notifikasi penting dari sistem kepanitiaan <strong>I-FEST Management System</strong> HMTI Universitas Tadulako.`;

  await queueEmail(
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
) {
  const introText = `Selamat! Anda telah terdaftar sebagai panitia pelaksana kegiatan <strong>Informatics Festival (I-FEST) 2026</strong>. Akun Anda telah berhasil dibuat di <strong>I-FEST Management System</strong>.`;

  const boxContentHtml = `
    <p style="margin: 4px 0;"><strong>Email Login:</strong> ${recipientEmail}</p>
    <p style="margin: 4px 0;"><strong>Password Sementara:</strong> <code style="background-color: #f2ecef; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${password}</code></p>
    <p style="margin: 12px 0 0 0; font-size: 12px; color: #7b757c; font-style: italic;">Silakan ganti password Anda demi keamanan setelah pertama kali masuk.</p>
  `.trim();

  await queueEmail(
    recipientEmail,
    recipientName,
    "Selamat Datang di I-FEST Management System!",
    getEmailTemplateHtml({
      recipientName,
      introText,
      boxTitle: "Informasi Login Akun",
      boxContentHtml,
      ctaText: "Login ke Dashboard",
      ctaUrl: `${APP_URL}/login`,
    }),
    1,
  );
}
