# I-FEST Management System (IMS) — Product Requirement Document

**Versi:** 2.0
**Status:** Final
**Author:** Senior Product Manager & Technical Architect
**Audience:** Tim Developer, Stakeholder HMTI, Calon Pengurus Tahun Depan

---

## Daftar Isi

1. [Product Overview & Goals](#1-product-overview--goals)
2. [Tech Stack & Arsitektur](#2-tech-stack--arsitektur)
3. [Database Schema (ERD)](#3-database-schema-erd)
4. [Dynamic RBAC & Org Structure](#4-dynamic-rbac--org-structure)
5. [Modul Document & Request Workflow](#5-modul-document--request-workflow)
6. [Modul Meeting Planner](#6-modul-meeting-planner)
7. [Modul KPI & Task Tracker](#7-modul-kpi--task-tracker)
8. [Modul Notifikasi & Email](#8-modul-notifikasi--email)
9. [User Stories](#9-user-stories)
10. [Technical Architecture](#10-technical-architecture)
11. [Non-Functional Requirements](#11-non-functional-requirements)
12. [Handover & Dokumentasi](#12-handover--dokumentasi)

---

## 1. Product Overview & Goals

### 1.1 Latar Belakang

I-FEST adalah acara tahunan HMTI Universitas Tadulako yang melibatkan puluhan panitia dari berbagai divisi. Setiap tahun terjadi **pergantian kepanitiaan total**, sehingga sistem lama (Google Drive, chat grup, spreadsheet) menyebabkan:

- Data tercecer di banyak file
- Notulensi rapat hilang
- Riwayat surat tidak terdokumentasi
- KPI tahun lalu tidak bisa dijadikan acuan
- Setiap kepanitiaan baru mulai dari nol

### 1.2 Tujuan

1. **Zero Hardcode** — Semua konfigurasi (divisi, role, tahun) di database, bukan di source code
2. **Single Source of Truth** — Semua dokumen, rapat, KPI, tugas tersentralisasi
3. **Transisi Mulus** — Tahun depan tinggal klik "Buat Tahun Baru", data struktur otomatis tercopy
4. **Transparansi** — Status surat, progress KPI, notulensi rapat bisa diakses semua anggota
5. **Efisiensi** — Notifikasi real-time via email/in-app, approval workflow tanpa chit-chat WA

### 1.3 Peran dalam Sistem

| Peran | Level | Hak Akses |
|---|---|---|
| **PIC / Ketua Panitia** | 100 | Full akses, admin, approval surat final |
| **Wakil Ketua** | 90 | Admin, approval surat |
| **Sekretaris** | 80 | Admin surat (review/revisi/approve), notulensi |
| **Bendahara** | 70 | Modul keuangan |
| **Koordinator Divisi** | 50 | Kelola anggota, buat rapat, KPI divisi |
| **Anggota** | 10 | Lihat dashboard, isi KPI, hadiri rapat |

---

## 2. Tech Stack & Arsitektur

### 2.1 Stack

| Layer | Teknologi | Deployment |
|---|---|---|
| **Frontend** | Next.js 16 (App Router, Turbopack, Tailwind v4) | Vercel |
| **Backend** | Next.js Server Actions + API Routes | Vercel (satu monorepo) |
| **Background Jobs** | Node.js Worker (Express) | Render (cron: email queue, PDF gen, reminder) |
| **Database** | Supabase (PostgreSQL, Auth, RLS) | Supabase Cloud (Singapore) |
| **Email** | Brevo (Sendinblue) API v3 | Brevo Cloud |
| **Storage** | Supabase Storage | Supabase Cloud |
| **Auth** | Supabase Auth (Email/Password) | Supabase Cloud |

### 2.2 Diagram Arsitektur

```
┌──────────────────────────────────────────────────┐
│                   Vercel                         │
│  ┌────────────────────────────────────────────┐ │
│  │          Next.js 16 (App Router)           │ │
│  │  ┌──────────┐  ┌──────────────────────┐   │ │
│  │  │  Frontend │  │   Server Actions /   │   │ │
│  │  │  (SSR +   │  │   API Routes (BE)    │   │ │
│  │  │  Client)  │  │   - auth-aware       │   │ │
│  │  └────┬─────┘  │   - RLS bypass via    │   │ │
│  │       │         │     service role key  │   │ │
│  │       │         └──────────┬───────────┘   │ │
│  │       └────────────────────┘               │ │
│  └────────────────────────────────────────────┘ │
└────────────────────┬───────────────────────────┘
                     │ HTTPS
┌────────────────────┴───────────────────────────┐
│              Supabase Cloud                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │PostgreSQL│  │  Auth    │  │   Storage    │ │
│  │  (13 tbl)│  │(JWT/RLS) │  │ (surat PDF)  │ │
│  └──────────┘  └──────────┘  └──────────────┘ │
└────────────────────┬───────────────────────────┘
                     │ HTTPS (Admin API + anon key)
┌────────────────────┴───────────────────────────┐
│                   Render                       │
│  ┌──────────────────────────────────────────┐ │
│  │  Node.js Worker (Cron)                   │ │
│  │  - Email queue flush                     │ │
│  │  - Reminder (rapat, KPI deadline)        │ │
│  │  - Generate PDF surat                    │ │
│  │  - Auto-close expired meetings           │ │
│  └──────────────────────────────────────────┘ │
└────────────────────┬───────────────────────────┘
                     │ REST API + SMTP
┌────────────────────┴───────────────────────────┐
│                 Brevo Cloud                     │
│  ┌──────────────────────────────────────────┐ │
│  │  Transactional Email API                 │ │
│  │  - Notif surat                           │ │
│  │  - Undangan rapat                        │ │
│  │  - Reminder KPI                          │ │
│  └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

### 2.3 Alur Data Utama

```
User Action → Browser → Next.js Server Action → Supabase Admin Client → PostgreSQL
                                              ↓
                                         Jika perlu email:
                                         → Brevo API → Email terkirim
                                              ↓
                                         Notifikasi insert
                                         → Notification Bell update (real-time via refetch)
```

**Catatan Arsitektur:** Semua server action menggunakan `createAdminClient()` (service role key) untuk bypass RLS. RLS digunakan sebagai **lapisan keamanan kedua** jika ada akses langsung ke database (misal dari Supabase Dashboard atau client-side query).

---

## 3. Database Schema (ERD)

### 3.1 Entity Relationship Diagram (Relasi)

```
committee_years (1) ──┐
  ↑                    ├── (N) divisions
  │                    ├── (N) roles
  │                    ├── (N) letter_requests
  │                    ├── (N) meetings
  │                    ├── (N) kpi_items
  │                    ├── (N) tasks
  │                    └── (N) committee_assignments
  │
  │              ┌── profiles (1) ── (N) committee_assignments
  │              │      ↑
  │              │   auth.users (Supabase)
  │              │
  │              └── committee_assignments (1) ── (N) notifications
  │                                                (N) meeting_invitees
  │                                                (N) letter_requests (as requester/handler)
  │                                                (N) meeting_notes (as writer)
  │
  divisions (1) ── (N) committee_assignments
                  (N) letter_requests
                  (N) kpi_items
                  (N) tasks

  roles (1) ── (N) committee_assignments
```

### 3.2 Tabel Detail

#### `committee_years` — Tahun Kepanitiaan
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID PK | |
| label | VARCHAR(50) UNIK | "I-FEST 2026", "I-FEST 2027" |
| is_active | BOOLEAN | Hanya 1 tahun bisa aktif |
| started_at | DATE | Tanggal mulai |
| ended_at | DATE | Null jika masih berjalan |

#### `divisions` — Divisi (per tahun)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID PK | |
| committee_year_id | UUID FK → committee_years | Scoping per tahun |
| name | VARCHAR(100) | "Acara", "Humas", dll |
| slug | VARCHAR(50) | UNIK per tahun: "acara" |
| description | TEXT | |
| sort_order | INT | Urutan tampilan |

#### `roles` — Jabatan (per tahun)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID PK | |
| committee_year_id | UUID FK → committee_years | Scoping per tahun |
| name | VARCHAR(100) | "Koordinator", "Anggota" |
| slug | VARCHAR(50) | UNIK per tahun |
| level | INT | 100=PIC, 10=Anggota |
| is_approver | BOOLEAN | Bisa approve surat |
| is_meeting_creator | BOOLEAN | Bisa buat rapat |

#### `profiles` — Data Personal
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID PK FK → auth.users | Sama dengan Supabase Auth ID |
| full_name | VARCHAR(150) | |
| nim | VARCHAR(20) UNIK | NIM mahasiswa |
| phone | VARCHAR(20) | |
| avatar_url | TEXT | |

#### `committee_assignments` — Jabatan + Divisi per Orang
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID PK | |
| committee_year_id | UUID FK | Tahun |
| user_id | UUID FK → profiles | Orangnya |
| division_id | UUID FK → divisions | Divisi |
| role_id | UUID FK → roles | Jabatan |
| is_active | BOOLEAN | Aktif/tidak |
| UNIQUE | (committee_year_id, user_id) | 1 orang 1 jabatan per tahun |

#### `letter_requests` — Pengajuan Surat
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID PK | |
| committee_year_id | UUID FK | |
| requester_id | UUID FK → committee_assignments | Pengaju |
| current_handler_id | UUID FK → committee_assignments | Yang proses |
| division_id | UUID FK | Divisi pengaju |
| letter_type | VARCHAR(50) | "surat_tugas", "surat_izin" |
| subject | VARCHAR(255) | |
| body | TEXT | |
| status | VARCHAR(20) | requested → processed → sent |
| final_document_url | TEXT | Link PDF final |

#### `meetings` — Rapat
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID PK | |
| creator_id | UUID FK → committee_assignments | Pembuat |
| title | VARCHAR(255) | |
| meeting_type | VARCHAR(20) | "scheduled" / "adhoc" |
| meeting_link | VARCHAR(500) | Link Zoom/Meet |
| started_at | TIMESTAMPTZ | Waktu rapat |

#### `meeting_invitees` — Peserta Rapat
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID PK | |
| meeting_id | UUID FK | |
| committee_assignment_id | UUID FK | |
| rsvp_status | VARCHAR(20) | pending/accepted/declined |
| UNIQUE | (meeting_id, committee_assignment_id) | |

#### `meeting_notes` — Notulensi
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID PK | |
| meeting_id | UUID FK UNIK | 1 rapat 1 notulensi |
| writer_id | UUID FK | Penulis |
| content | TEXT | Isi notulensi |
| decision_points | JSONB | Poin keputusan |
| action_items | JSONB | Tindak lanjut |
| published_at | TIMESTAMPTZ | Waktu publish |

#### `kpi_items` — KPI per Divisi
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID PK | |
| division_id | UUID FK | |
| title | VARCHAR(255) | |
| target | TEXT | Target capaian |
| is_milestone | BOOLEAN | Milestone utama? |

#### `tasks` — Checklist Tugas
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID PK | |
| kpi_item_id | UUID FK → kpi_items | |
| assignee_id | UUID FK → committee_assignments | Penanggung jawab |
| title | VARCHAR(255) | |
| status | VARCHAR(20) | todo / done |
| priority | VARCHAR(10) | low/medium/high |

#### `notifications` — Notifikasi In-App
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID PK | |
| committee_assignment_id | UUID FK | Target user |
| type | VARCHAR(50) | letter_status, meeting_invite, kpi_reminder |
| title | VARCHAR(255) | |
| body | TEXT | |
| is_read | BOOLEAN | |
| email_sent | BOOLEAN | |

---

## 4. Dynamic RBAC & Org Structure

### 4.1 Prinsip Zero Hardcode

Tidak ada satupun nama divisi, jabatan, atau level yang ditulis di kode. Semua didefinisikan di tabel database per `committee_year_id`:

```
Request → SELECT roles WHERE committee_year_id = ? AND slug = ?
              ↓
         Dapatkan level, is_approver, is_meeting_creator
              ↓
         Gunakan untuk gate akses di aplikasi
```

### 4.2 Transisi Tahun Baru

Saat PIC membuat tahun baru (misal "I-FEST 2027"), sistem:

1. **Copy struktur:** `divisions` + `roles` dari tahun sebelumnya → tahun baru (dengan ID baru)
2. **Kosongkan personel:** `committee_assignments` tidak tercopy (PIC input ulang)
3. **Copy KPI (opsional):** KPI yang `is_milestone` bisa dicopy sebagai referensi
4. **Aktifkan tahun baru:** `is_active` tahun lama = false, tahun baru = true

### 4.3 Authorization Flow

```
Server Action → getCurrentAssignment(userId, activeYearId)
                    ↓
               Dapatkan role + level
                    ↓
               Cek permission (level >= required, is_approver, dll)
                    ↓
               Allow / Deny
```

Pengecekan dilakukan di **setiap server action**, bukan di middleware atau client, untuk keamanan maksimal.

---

## 5. Modul Document & Request Workflow

### 5.1 Alur Surat

```
User buat form → Status: REQUESTED
                      ↓
           Notif email + in-app ke Sekretaris
                      ↓
        ┌─────────────┴─────────────┐
        ↓                           ↓
  Approve                      Minta Revisi
  Status: PROCESSED            Status: REQUESTED (+revision_count)
        ↓                     Notif ke pengaju
  Sekretaris upload PDF             ↓
        ↓                     User revisi form
  Status: SENT                Kembali ke atas
  Notif ke pengaju + divisi
```

### 5.2 Form Surat

| Field | Tipe | Validasi |
|---|---|---|
| Jenis Surat | Dropdown | letter_type dari database |
| Perihal | Text | Required |
| Isi Surat | Textarea | Required, min 20 char |
| Divisi Tujuan | Dropdown | Dari tabel divisions |

### 5.3 Status Transparan

Setiap perubahan status tercatat di `letter_revisions` dan muncul sebagai timeline di halaman detail surat:

```
📄 12 Mar 2026 — Diajukan oleh Dareean (Acara)
✏️ 13 Mar 2026 — Revisi: "Tambahkan nomor surat" oleh Nur Ainun
✅ 14 Mar 2026 — Disetujui oleh Nur Ainun
📬 15 Mar 2026 — Surat terkirim
```

### 5.4 Repositori Surat

Semua surat final (status `sent`) tersimpan di Supabase Storage dengan path:

```
/letters/{committee_year_id}/{letter_id}.pdf
```

Link disimpan di `letter_requests.final_document_url`.

---

## 6. Modul Meeting Planner

### 6.1 Tipe Rapat

| Tipe | Keterangan | Undangan |
|---|---|---|
| **scheduled** | Rapat rutin (mingguan) | Semua anggota divisi tertentu |
| **adhoc** | Rapat mendadak | Peserta spesifik (pilih individu) |

### 6.2 Fitur "Panggil Individu" (Ad-hoc)

Saat membuat rapat ad-hoc, pembuat bisa memilih **satu per satu** anggota committee dari berbagai divisi:

```
Form Buat Rapat:
  Tipe: [Ad-hoc ▼]
  Judul: "Rapat Evaluasi Lomba"
  Link: https://meet.google.com/xxx
  Agenda: [textarea]
  Undang Peserta:
    ☑ BPH → ☑ Gabriel, ☑ Nur Ainun
    ☑ Acara → ☑ Putri Intan
    ☑ Humas → ☑ Febriansyah
    ☑ Logistik → ☑ Magribi
```

### 6.3 Notulensi Digital

- Terikat langsung ke `meeting_id` (1:1)
- Bisa diisi oleh Sekretaris atau peserta yang ditunjuk
- Memiliki struktur: `content` (teks bebas) + `decision_points` (JSONB) + `action_items` (JSONB)
- Setelah dipublish, notulensi bisa dilihat semua anggota
- Waktu publish tercatat (target: H+3 setelah rapat)

### 6.4 Alur Notulensi

```
Meeting berlangsung
       ↓
Penulis buka halaman meeting → Tab "Notulensi"
       ↓
Isi content + decision_points + action_items
       ↓
Klik "Simpan Draft" → Tersimpan, belum publish
       ↓
Klik "Publish Notulensi" → published_at terisi
       ↓
Notif + Email ke semua anggota "Notulensi tersedia"
```

---

## 7. Modul KPI & Task Tracker

### 7.1 Hirarki

```
Divisi (misal: Acara)
  └── KPI Item (is_milestone=false)
        └── Task 1 (status: todo/done)
        └── Task 2 (status: todo/done)
        └── Task 3 (status: todo/done)
  └── KPI Item (is_milestone=true) ← Milestone utama
        └── Task 4 (status: todo/done)
        └── Task 5 (status: todo/done)
```

### 7.2 Progress Bar

Setiap divisi menampilkan:
- **KPI Progress:** X dari Y KPI memiliki minimal 1 task selesai
- **Task Progress:** X dari Y total task selesai
- **Milestone:** Hanya menghitung KPI dengan `is_milestone=true`

### 7.3 CRUD Task

- Koordinator/anggota bisa **menambah task** ke KPI tertentu
- Assignee bisa **menandai selesai** (completed_at terisi)
- Yang menandai selesai bisa **membuka ulang** (reopen)
- Hanya pembuat task yang bisa **menghapus**

---

## 8. Modul Notifikasi & Email

### 8.1 Jenis Notifikasi

| Event | In-App | Email | Target |
|---|---|---|---|
| Surat baru diajukan | ✅ | ✅ | Sekretaris + PIC |
| Surat direvisi | ✅ | ✅ | Pengaju |
| Surat disetujui | ✅ | ✅ | Pengaju + divisi |
| Surat terkirim | ✅ | ✅ | Pengaju + divisi |
| Rapat baru dibuat | ✅ | ✅ | Semua invitees |
| RSVP diterima | ✅ | ❌ | Pembuat rapat |
| Notulensi dipublish | ✅ | ✅ | Semua anggota |
| KPI deadline approaching | ❌ | ✅ (cron) | Koordinator |

### 8.2 Template Email (Brevo)

Email dikirim menggunakan **Transactional Email API** Brevo dengan template HTML responsif. Setiap email mencakup:

- Logo I-FEST HMTI
- Nama penerima
- Body sesuai event
- CTA button (link ke halaman terkait)
- Footer "Dikirim oleh I-FEST Management System"

### 8.3 Cron Job (Render)

| Schedule | Task |
|---|---|
| Every 5 menit | Flush antrian email yang gagal |
| Setiap jam 08:00 | Notifikasi KPI deadline H-7, H-3, H-1 |
| Setiap jam 20:00 | Reminder notulensi belum dipublish (H+1, H+2, H+3) |
| Setiap hari 00:00 | Auto-close meeting yang sudah lewat 24 jam |

---

## 9. User Stories

### 9.1 PIC / Ketua Panitia

```
Sebagai PIC, saya ingin:
  - Melihat dashboard overview seluruh divisi
  - Mengelola divisi, role, dan tahun kepanitiaan
  - Memonitor progress KPI setiap divisi
  - Mengapprove surat yang butuh otorisasi akhir
  - Membuat tahun kepanitiaan baru dengan copy struktur
```

### 9.2 Sekretaris

```
Sebagai Sekretaris, saya ingin:
  - Menerima notifikasi saat ada pengajuan surat baru
  - Meninjau, mengapprove, atau meminta revisi surat
  - Mengupload PDF surat final
  - Mengelola template surat
  - Menulis dan mempublish notulensi rapat
```

### 9.3 Koordinator Divisi

```
Sebagai Koordinator, saya ingin:
  - Melihat dashboard personal dan divisi saya
  - Menjadwalkan rapat divisi (scheduled atau ad-hoc)
  - Mengundang anggota spesifik lintas divisi
  - Memonitor KPI divisi dan task anggota
  - Menambah KPI atau task baru
```

### 9.4 Anggota

```
Sebagai Anggota, saya ingin:
  - Melihat progress KPI divisi saya
  - Mengisi task yang diassign ke saya
  - Menerima undangan rapat dan RSVP
  - Melihat notulensi rapat yang sudah dipublish
  - Mengajukan permohonan surat
  - Mengupdate profil saya (no. telepon, dll)
```

### 9.5 Panitia Tahun Depan

```
Sebagai PIC tahun depan, saya ingin:
  - Login dengan akun baru yang didaftarkan admin
  - Melihat data tahun sebelumnya sebagai referensi
  - Membuat tahun kepanitiaan baru (copy struktur)
  - Mengisi personel baru tanpa menyentuh kode
  - Sistem langsung berfungsi setelah data diisi
```

---

## 10. Technical Architecture

### 10.1 Vercel (Frontend + API)

- **Framework:** Next.js 16 App Router dengan Turbopack
- **Rendering Strategy:**
  - Halaman publik (/, /login) → Static / Client-side
  - Halaman dashboard → Server-side dengan auth check
  - Halaman detail → Dynamic SSR (params id)
- **Data Fetching:**
  - Server Component → langsung panggil `createAdminClient()`
  - Client Component → Server Action via `useActionState`
  - Real-time notifikasi → interval refetch setiap 30 detik
- **Auth:** Cookie session via `@supabase/ssr`, middleware proteksi route

### 10.2 Supabase (Database + Auth + Storage)

- **Database:** PostgreSQL via Supabase
  - Service role key untuk admin client (bypass RLS)
  - Anon key untuk public client (terbatas RLS)
- **Auth:** Supabase Auth dengan Email/Password
  - Trigger `on_auth_user_created` untuk auto-create profile
- **Storage:** Untuk PDF surat final (bucket `letters`)

### 10.3 Render (Background Worker)

Node.js worker yang berjalan sebagai cron job:

```
// Worker responsibilities:
1. EmailQueue — Retry email gagal dari tabel email_queue
2. KpiReminder — Cek deadline H-7, H-3, H-1
3. MeetingCleanup — Auto-close meeting expired
4. NoteReminder — Reminder notulensi H+1, H+2, H+3
```

Worker mengakses Supabase via service role key dan Brevo API untuk mengirim email.

### 10.4 Brevo (Email Notification)

- **API:** Transactional Email API v3
- **Sender:** ifest.hmti@gmail.com (verified)
- **Template:** HTML responsive dengan dynamic variables
- **Rate Limit:** 300 emails/hour (sesuai plan Brevo gratis)

### 10.5 Security Flow

```
Browser Request
  ↓
Next.js Middleware → Check cookie → Redirect if unauthorized
  ↓
Server Component / Server Action
  ↓
getCurrentAssignment(userId, yearId)
  ↓
Check role.level / is_approver / is_meeting_creator
  ↓
Allow / Reject dengan error
  ↓
Jika allow → createAdminClient() → Supabase query
```

**3 Layer Keamanan:**
1. **Middleware** — Proteksi route level dasar
2. **Server Action** — Cek permission di setiap action
3. **RLS Database** — Fallback jika ada akses langsung

---

## 11. Non-Functional Requirements

### 11.1 Keamanan

| Requirement | Implementasi |
|---|---|
| No hardcoded secrets | Semua env var via `.env.local` / Vercel Environment Variables |
| SQL Injection | Semua query via Supabase JS client (parameterized) |
| XSS | Next.js default escaping, no `dangerouslySetInnerHTML` |
| CSRF | Server Action hanya bisa dipanggil dari origin yang sama |
| Data access | Service role key hanya di server, never exposed ke client |
| Password | Supabase Auth handle hashing, Argon2 |

### 11.2 Skalabilitas

| Requirement | Implementasi |
|---|---|
| Database | Supabase Postgres — auto-scale, 500 MB gratis |
| Frontend | Vercel Edge Network — global CDN |
| API | Next.js Server Actions — auto-scale dengan Vercel |
| Storage | Supabase Storage — 1 GB gratis |
| Email | Brevo — 300 emails/hari gratis |
| Image | Next.js Image Optimization — otomatis |

### 11.3 Maintainability

| Requirement | Implementasi |
|---|---|
| Zero hardcode | Divisi, role, tahun di database |
| Type Safety | TypeScript strict, Database types auto-generated |
| Design System | DESIGN.md + reusable UI components (Button, Card, Badge) |
| Migration | SQL migration versioned + idempotent (IF NOT EXISTS) |
| Seed Data | Script runtime terpisah (scripts/seed-auth-users.js) |

### 11.4 Performance

| Target | Implementasi |
|---|---|
| First Load < 2s | Server Components, minimal JS bundle |
| Page Transition < 500ms | App Router streaming, Turbopack |
| API Response < 200ms | Server Actions bypass RLS, direct DB query |
| Notification < 30s | Interval refetch setiap 30 detik |

---

## 12. Handover & Dokumentasi

### 12.1 Untuk Developer Tahun Depan

```
Yang perlu diubah untuk tahun baru:
1. Buka dashboard admin → Tahun Kepanitiaan → "Buat Baru"
2. Sistem akan copy struktur divisi + role
3. Input ulang personel (nama, NIM, email)
4. Import KPI dari tahun sebelumnya (opsional)
5. Selesai — sistem siap digunakan

Tidak perlu:
✗ Mengedit kode
✗ Mengubah database manual
✗ Men-deploy ulang (kecuali ada perubahan fitur)
```

### 12.2 File Penting untuk Maintenance

| File | Fungsi |
|---|---|
| `PRD.md` | Dokumen ini — panduan lengkap |
| `DESIGN.md` | Design system tokens (warna, font, spacing) |
| `src/database/migration.sql` | Schema lengkap (13 tabel) |
| `src/database/rls_policies.sql` | RLS policies |
| `src/database/seed.sql` | Seed data awal |
| `src/lib/supabase/types.ts` | TypeScript types untuk database |
| `scripts/seed-auth-users.js` | Script buat user awal |
| `.env.example` | Template environment variables |

### 12.3 Checklist Deploy Awal

- [ ] Enable Email/Password Auth di Supabase Dashboard
- [ ] Execute `migration.sql` di Supabase SQL Editor
- [ ] Execute `rls_policies.sql` di Supabase SQL Editor
- [ ] Execute `seed.sql` di Supabase SQL Editor
- [ ] Run `node scripts/seed-auth-users.js` untuk seed personel
- [ ] Verify Brevo sender email (`ifest.hmti@gmail.com`)
- [ ] Set environment variables di Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `BREVO_API_KEY`
- [ ] Deploy ke Vercel
- [ ] Deploy background worker ke Render (jika ada)
- [ ] Test login dengan akun personel (password: `ifest2026`)
- [ ] Test seluruh workflow: surat, rapat, KPI

### 12.4 Stack Diagram (Visual)

```
[HMTI User]
     │
     ▼
┌──────────────────────────────────────────────────┐
│                 Vercel (Next.js)                  │
│  ┌────────────────────────────────────────────┐ │
│  │  Server Actions (Auth + Permission Check)  │ │
│  │  ↓                                        │ │
│  │  Admin Client → Supabase (bypass RLS)      │ │
│  │  ↓                                        │ │
│  │  Jika perlu email: → Brevo API             │ │
│  └────────────────────────────────────────────┘ │
└──────────┬───────────────┬───────────────────────┘
           │               │
           ▼               ▼
   ┌────────────┐   ┌────────────┐
   │  Supabase  │   │   Brevo    │
   │ - DB       │   │ - Email    │
   │ - Auth     │   │            │
   │ - Storage  │   │            │
   └────────────┘   └────────────┘
```

---

## Appendix A: Status Codes

| Status | Arti |
|---|---|
| `requested` | Surat diajukan, menunggu review |
| `processed` | Surat disetujui, PDF sedang disiapkan |
| `sent` | Surat final sudah dikirim |
| `pending` | Undangan rapat belum direspon |
| `accepted` | Undangan rapat diterima |
| `declined` | Undangan rapat ditolak |
| `todo` | Task belum dikerjakan |
| `done` | Task selesai |
| `scheduled` | Rapat terjadwal rutin |
| `adhoc` | Rapat mendadak |

## Appendix B: Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxmxbyiggrottreetrig.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>

# Brevo
BREVO_API_KEY=<brevo_api_key>
BREVO_SENDER_EMAIL=ifest.hmti@gmail.com

# Next.js
NEXT_PUBLIC_APP_URL=https://ifest-management.vercel.app
```

---

*Dokumen ini hidup — update sesuai kebutuhan. Untuk pertanyaan atau usulan, buka issue di repository GitHub.*
