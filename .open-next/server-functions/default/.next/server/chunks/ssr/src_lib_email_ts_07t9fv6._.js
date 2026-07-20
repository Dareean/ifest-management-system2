module.exports=[28725,a=>{"use strict";let b=process.env.EMAIL_FROM||"ifest.hmti@gmail.com",c=process.env.EMAIL_FROM_NAME||"I-FEST Management System",d=process.env.NEXT_PUBLIC_APP_URL||"https://ifest-ms.vercel.app",e=`${d}/assets/logo_utama/logo_untad.webp`,f=`${d}/assets/logo_utama/HMTI%20LOGO.webp`,g=`${d}/assets/logo_utama/Logo-IFEST-2026.webp`;function h({recipientName:a,introText:b,boxTitle:c,boxContentHtml:i,ctaText:j="Buka Dashboard",ctaUrl:k=`${d}/login`,ctaExtraHtml:l=""}){return`
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
        <div class="greeting">Yth. ${a},</div>
        <div class="intro">
          ${b}
        </div>

        <div class="highlight-box">
          <div class="box-title">${c}</div>
          <div class="box-content">
            ${i}
          </div>
        </div>

        <div class="intro">
          Silakan buka dashboard akun Anda untuk melihat rincian selengkapnya atau melakukan tindakan lebih lanjut.
        </div>

        <div class="cta-container">
          <a href="${k}" class="cta-button" target="_blank">${j}</a>
          <div class="cta-extra">
            ${l}
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
          <img src="${e}" alt="UNTAD Logo" class="logo-img" style="height: 24px;">
          <img src="${f}" alt="HMTI Logo" class="logo-img" style="height: 24px;">
          <img src="${g}" alt="IFEST Logo" class="logo-img" style="height: 28px;">
        </div>
        <div class="disclaimer">
          Email ini dikirim secara otomatis oleh sistem I-FEST 2026. Mohon tidak membalas email ini.
        </div>
        <div class="copyright">
          \xa9 2026 HMTI — Universitas Tadulako. All rights reserved.
        </div>
      </div>
    </div>
  </body>
</html>
  `.trim()}async function i(a,d,e,f){try{let g=await fetch("https://api.brevo.com/v3/smtp/email",{method:"POST",headers:{"api-key":process.env.BREVO_API_KEY,"Content-Type":"application/json"},body:JSON.stringify({sender:{email:b,name:c},to:[{email:a,name:d}],subject:e,htmlContent:f})});if(!g.ok){let a=await g.text();return console.error("[Email] Failed to send:",a),`Gagal mengirim email: ${a}`}return null}catch(a){return console.error("[Email] Error:",a),`Gagal mengirim email: ${a instanceof Error?a.message:String(a)}`}}async function j(a,b,c,e,f,g,j){let k=new Date(e).toLocaleDateString("id-ID",{weekday:"long",year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"}),l=function({title:a,description:b,location:c,startedAt:d,endedAt:e}){let f=new Date(d),g=new Date(e||f.getTime()+36e5),h=a=>a.toISOString().replace(/[-:]|\.\d{3}/g,""),i=new URLSearchParams({action:"TEMPLATE",text:a,dates:`${h(f)}/${h(g)}`});return b&&i.set("details",b),c&&i.set("location",c),`https://calendar.google.com/calendar/render?${i.toString()}`}({title:c,description:j,location:g??f??void 0,startedAt:e}),m=`
    <p style="margin: 4px 0;"><strong>Nama Rapat:</strong> ${c}</p>
    <p style="margin: 4px 0;"><strong>Waktu:</strong> ${k}</p>
  `;g&&(m+=`<p style="margin: 4px 0;"><strong>Lokasi:</strong> ${g}</p>`),f&&(m+=`<p style="margin: 4px 0;"><strong>Tautan Online:</strong> <a href="${f}" style="color: #FF3D8B; text-decoration: underline;">Klik di sini</a></p>`),j&&(m+=`<p style="margin: 8px 0 0 0; padding-top: 8px; border-top: 1px solid #f2ecef;"><strong>Agenda:</strong> ${j}</p>`);let n=`
    <div style="text-align: center; margin-top: 32px; margin-bottom: 32px;">
      <a href="${d}/login" style="display: inline-block; background-color: #000000; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: bold; padding: 14px 28px; border-radius: 8px; letter-spacing: 0.02em;">Buka Dashboard</a>
      <br><br>
      <a href="${l}" target="_blank" style="display: inline-block; background-color: #ffffff; color: #1d1b1d !important; text-decoration: none; font-size: 13px; font-weight: bold; padding: 12px 24px; border-radius: 8px; border: 1px solid #d0c9cd; letter-spacing: 0.02em;">
        &#x1F4C5; Simpan ke Google Calendar
      </a>
    </div>
  `;return await i(a,b,`[Rapat] ${c}`,h({recipientName:b,introText:"Kami informasikan bahwa Anda telah diundang untuk menghadiri agenda rapat kepanitiaan di <strong>I-FEST Management System</strong> HMTI Universitas Tadulako.",boxTitle:"Detail Rapat",boxContentHtml:m,ctaText:"",ctaUrl:""}).replace(/<div class="cta-container">[\s\S]*?<\/div>/,n))}async function k(a,b,c,d){return await i(a,b,c,h({recipientName:b,introText:"Kami informasikan bahwa terdapat notifikasi penting dari sistem kepanitiaan <strong>I-FEST Management System</strong> HMTI Universitas Tadulako.",boxTitle:"Pesan Sistem",boxContentHtml:d}))}async function l(a,b,c){let e=`
    <p style="margin: 4px 0;"><strong>Email Login:</strong> ${a}</p>
    <p style="margin: 4px 0;"><strong>Password Sementara:</strong> <code style="background-color: #f2ecef; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${c}</code></p>
    <p style="margin: 12px 0 0 0; font-size: 12px; color: #7b757c; font-style: italic;">Silakan ganti password Anda demi keamanan setelah pertama kali masuk.</p>
  `.trim();return await i(a,b,"Selamat Datang di I-FEST Management System!",h({recipientName:b,introText:"Selamat! Anda telah terdaftar sebagai panitia pelaksana kegiatan <strong>Informatics Festival (I-FEST) 2026</strong>. Akun Anda telah berhasil dibuat di <strong>I-FEST Management System</strong>.",boxTitle:"Informasi Login Akun",boxContentHtml:e,ctaText:"Login ke Dashboard",ctaUrl:`${d}/login`}))}async function m(a,b,c,d,e){return await i(a,b,c,h({recipientName:b,introText:"Berikut adalah pengumuman resmi dari PIC / Penanggung Jawab untuk seluruh panitia pelaksana I-FEST 2026.",boxTitle:d||"PENGUMUMAN PANITIA",boxContentHtml:e.replace(/\n/g,"<br>")}))}a.s(["sendBroadcastEmail",0,m,"sendEmailNotification",0,k,"sendMeetingInvite",0,j,"sendWelcomeEmail",0,l],28725)}];

//# sourceMappingURL=src_lib_email_ts_07t9fv6._.js.map