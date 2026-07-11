# 📱 Fonnte WhatsApp Integration - Panduan Lengkap

Dokumentasi integrasi Fonnte WhatsApp API untuk I-FEST Management System.

---

## 📋 Daftar Isi

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Setup Fonnte Account](#setup-fonnte-account)
4. [Konfigurasi Project](#konfigurasi-project)
5. [Setup WhatsApp Groups](#setup-whatsapp-groups)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)

---

## 🎯 Overview

Sistem notifikasi I-FEST Management System sekarang mendukung **3 channel**:
- ✅ **In-App Notifications** (Database)
- ✅ **Email** (via Brevo)
- ✅ **WhatsApp** (via Fonnte)

### Cara Kerja WhatsApp Notifications:

**Untuk Notifikasi Divisi** (`notifyDivision()`):
- Jika divisi memiliki **Group ID**, sistem akan mengirim **1 pesan ke grup WhatsApp divisi** tersebut.
- Jika divisi **tidak** memiliki Group ID, sistem akan fallback mengirim ke **setiap anggota divisi** secara individual.

**Untuk Notifikasi Semua Panitia** (`notifyAllMembers()`):
- Sistem akan broadcast ke **semua grup divisi** yang memiliki Group ID terkonfigurasi.
- Jika tidak ada grup yang terkonfigurasi, fallback ke pengiriman per-orang.

**Untuk Notifikasi Individual** (`createNotification()`):
- Tetap kirim ke nomor WhatsApp individu (jika nomor terdaftar di database).

---

## ✅ Prerequisites

Sebelum memulai, pastikan Anda memiliki:

1. **Nomor WhatsApp** yang akan digunakan sebagai pengirim (bisa nomor pribadi atau bisnis)
2. **Akun Fonnte** (gratis/berbayar) - https://fonnte.com
3. **Grup WhatsApp** untuk setiap divisi I-FEST (opsional, tapi direkomendasikan)
4. **Akses ke Supabase SQL Editor** untuk menjalankan migration

---

## 🚀 Setup Fonnte Account

### Langkah 1: Registrasi & Login

1. Buka https://fonnte.com
2. Klik **Sign Up** atau **Login** jika sudah punya akun
3. Verifikasi email Anda

### Langkah 2: Tambah Device (Hubungkan WhatsApp)

1. Di dashboard Fonnte, klik menu **Devices**
2. Klik tombol **+ Add Device**
3. Masukkan nomor WhatsApp Anda (format: `628xxxxxxxxxx`)
4. Klik **Connect** atau ikon QR Code
5. **Scan QR Code** menggunakan WhatsApp di HP Anda:
   - Buka WhatsApp → **Settings** → **Linked Devices** → **Link a Device**
   - Scan QR yang muncul di dashboard Fonnte
6. Status device akan berubah menjadi **Connected** ✅

> ⚠️ **PENTING**: Pastikan HP Anda selalu terhubung ke internet agar device tetap connected.

### Langkah 3: Dapatkan API Token

1. Di dashboard Fonnte, klik menu **Settings** (atau **API Settings**)
2. Copy **API Token** yang muncul (format: `xxxxxxxxxxxxxxxxxxxxxx`)
3. Simpan token ini dengan aman

---

## ⚙️ Konfigurasi Project

### Langkah 1: Update Environment Variables

Buka file `.env.local` di root project Anda dan tambahkan:

```bash
FONNTE_API_TOKEN=paste_token_anda_disini
```

**Contoh**:
```bash
FONNTE_API_TOKEN=a1b2c3d4e5f6g7h8i9j0
```

### Langkah 2: Jalankan Database Migration

1. Buka **Supabase Dashboard** → **SQL Editor**
2. Buka file berikut di project Anda:
   - `supabase/migrations/202607111430_add_whatsapp_support.sql`
   - `supabase/migrations/202607111500_add_whatsapp_group_support.sql`
3. Copy seluruh isi file dan paste ke SQL Editor
4. Klik **Run** untuk menjalankan migration

**Verifikasi migration berhasil:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'notifications' AND column_name = 'whatsapp_sent';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'divisions' AND column_name = 'whatsapp_group_id';
```

Jika kedua query mengembalikan hasil, migration berhasil! ✅

---

## 👥 Setup WhatsApp Groups

### Langkah 1: Dapatkan Group ID dari Fonnte

1. Di dashboard Fonnte, klik menu **Groups**
2. Anda akan melihat daftar semua grup WhatsApp yang terhubung dengan nomor Anda
3. Untuk setiap grup divisi, **copy Group ID**-nya

**Format Group ID**: `120363XXXXXX@g.us`

> 💡 **Tips**: Nomor WhatsApp yang terhubung di Fonnte **HARUS menjadi anggota** grup tersebut agar bisa mengirim pesan.

### Langkah 2: Masukkan Group ID ke Database

Gunakan Supabase SQL Editor atau TablePlus untuk update:

```sql
-- Update grup untuk Divisi Acara
UPDATE divisions
SET whatsapp_group_id = '120363XXXXXX@g.us'
WHERE slug = 'acara' AND committee_year_id = 'c2f2a48e-3e58-4559-aaa0-623a3825348b';

-- Update grup untuk Divisi Konsumsi
UPDATE divisions
SET whatsapp_group_id = '120363YYYYYY@g.us'
WHERE slug = 'konsumsi' AND committee_year_id = 'c2f2a48e-3e58-4559-aaa0-623a3825348b';

-- Ulangi untuk divisi lainnya...
```

**Atau lihat semua divisi terlebih dahulu:**
```sql
SELECT id, name, slug, whatsapp_group_id
FROM divisions
WHERE committee_year_id = 'c2f2a48e-3e58-4559-aaa0-623a3825348b'
ORDER BY sort_order;
```

---

## 🧪 Testing

### Test 1: Kirim Pesan WhatsApp Manual

Anda bisa test Fonnte API langsung via **curl** atau **Postman**:

```bash
curl -X POST https://api.fonnte.com/send \
  -H "Authorization: YOUR_FONNTE_TOKEN" \
  -d "target=628123456789" \
  -d "message=Test pesan dari I-FEST Management System"
```

Jika berhasil, Anda akan menerima response:
```json
{
  "status": true,
  "message": "Message sent successfully"
}
```

### Test 2: Test via Application

Cara termudah adalah dengan membuat notifikasi dummy:

1. Login ke aplikasi sebagai admin
2. Buat task baru atau surat baru untuk divisi tertentu
3. Cek apakah pesan WhatsApp masuk ke grup divisi tersebut

### Test 3: Test via Script (Optional)

Jika Anda ingin test isolated, gunakan script yang sudah saya buatkan:

**File**: `src/scripts/test-fonnte.ts`

Ganti nomor test di script tersebut, lalu panggil fungsinya dari Next.js API route atau Server Action.

---

## 🛠️ Troubleshooting

### ❌ Pesan WhatsApp tidak terkirim

**Kemungkinan penyebab:**

1. **Token salah atau expired**
   - Cek kembali token di `.env.local`
   - Verifikasi token di dashboard Fonnte

2. **Device disconnect**
   - Buka dashboard Fonnte → **Devices**
   - Pastikan status **Connected**
   - Jika disconnect, scan ulang QR Code

3. **Group ID salah**
   - Verifikasi Group ID di database cocok dengan yang di Fonnte
   - Format harus: `120363XXXXXX@g.us`

4. **Nomor pengirim bukan anggota grup**
   - WhatsApp API hanya bisa kirim ke grup jika nomor pengirim adalah anggota grup tersebut
   - Pastikan nomor yang terhubung di Fonnte sudah masuk ke grup divisi

### ❌ Error "FONNTE_API_TOKEN not configured"

Pastikan:
- File `.env.local` ada di root project
- Variabel `FONNTE_API_TOKEN` ditulis dengan benar (case-sensitive)
- Restart dev server (`npm run dev`) setelah update `.env.local`

### ❌ Pesan terkirim tapi formatnya rusak

Fonnte mendukung format WhatsApp markdown:
- `*bold*` untuk **tebal**
- `_italic_` untuk *miring*
- `~strikethrough~` untuk ~~coret~~
- ` ```code``` ` untuk `monospace`

Jangan gunakan HTML tag di pesan WhatsApp.

---

## ❓ FAQ

### Q: Apakah bisa menggunakan WhatsApp Business API resmi?

A: Ya, tapi Fonnte lebih mudah dan murah untuk scale kecil-menengah seperti kepanitiaan. WhatsApp Business API resmi memerlukan approval dari Meta dan biaya lebih tinggi.

### Q: Apakah akun WhatsApp saya bisa di-ban?

A: Untuk penggunaan internal seperti ini, risiko sangat kecil. Tips agar aman:
- Gunakan nomor yang sudah "matang" (tidak baru dibuat)
- Minta semua panitia save nomor pengirim
- Jangan kirim spam ke nomor yang tidak dikenal

### Q: Berapa biaya Fonnte?

A: Fonnte memiliki paket gratis dengan limit tertentu, dan paket berbayar mulai dari ~Rp50.000/bulan. Cek https://fonnte.com/pricing

### Q: Apakah notifikasi tetap jalan jika WhatsApp gagal?

A: Ya! Sistem dirancang **fault-tolerant**. Jika WhatsApp gagal kirim (token habis, device disconnect, dll), notifikasi in-app dan email tetap berjalan normal.

### Q: Bagaimana cara disable WhatsApp notifications sementara?

Hapus atau comment variable `FONNTE_API_TOKEN` di `.env.local`, lalu restart server. Sistem akan otomatis skip WhatsApp notifications.

---

## 📊 Monitoring & Logs

### Cara Cek Status Pengiriman:

1. **In-App**: Kolom `whatsapp_sent` di tabel `notifications` (akan diimplementasi tracking di update berikutnya)
2. **Fonnte Dashboard**: Menu **History** menampilkan semua pesan yang terkirim
3. **Server Logs**: Error WhatsApp akan muncul di console log (non-critical, tidak crash app)

---

## 🎉 Selesai!

Sistem notifikasi WhatsApp Anda sekarang sudah aktif!

**Ringkasan Fitur:**
- ✅ Notifikasi tugas → kirim ke grup divisi
- ✅ Notifikasi surat → kirim ke grup divisi  
- ✅ Notifikasi rapat → kirim ke grup divisi
- ✅ Broadcast pengumuman → kirim ke semua grup divisi
- ✅ Fallback otomatis jika grup tidak terkonfigurasi

**File-file yang diubah:**
- `src/lib/fonnte.ts` - Fonnte API client
- `src/lib/internal-notifications.ts` - Notification system dengan WhatsApp support
- `supabase/migrations/*.sql` - Database schema updates

**Butuh bantuan lebih lanjut?**
Hubungi developer atau buka issue di repository project ini.

---

*Dokumentasi ini dibuat oleh Claude Code untuk I-FEST Management System v1.2.0*
