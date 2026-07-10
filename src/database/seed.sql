-- ============================================================
-- I-FEST 2026 — SEED DATA
-- Run AFTER migration.sql
-- ============================================================

-- ============================================================
-- Auto-create profile on auth signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, nim)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'nim', '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Divisions (10 Divisi + BPH)
-- ============================================================
INSERT INTO divisions (committee_year_id, name, slug, description, sort_order) VALUES
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), 'BPH', 'bph', 'Badan Pengurus Harian — Ketua, Wakil, Sekretaris, Bendahara', 0),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), 'Acara', 'acara', 'Divisi Acara — Konseptor dan Eksekutor program I-FEST', 1),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), 'Humas', 'humas', 'Divisi Humas — Informasi, Media Partner, Survei, Tenant', 2),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), 'Sponsorship', 'sponsorship', 'Divisi Sponsorship — Negosiasi, Prospecting, Dokumentasi, Benefit', 3),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), 'Kreativitas', 'kreativitas', 'Divisi Kreativitas — Desain, Konten, Video, Dekorasi, Dokumentasi', 4),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), 'Ekonomi Kreatif', 'ekonomi-kreatif', 'Divisi Ekonomi Kreatif — Bazar, Merchandise, UMKM', 5),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), 'Konsumsi', 'konsumsi', 'Divisi Konsumsi — F&B untuk VIP, Panitia, Relawan', 6),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), 'Logistik', 'logistik', 'Divisi Logistik — Inventaris, Liaison, Pengembalian barang', 7),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), 'Lapangan', 'lapangan', 'Divisi Lapangan — Site Commander, Keamanan venue, Panggung', 8),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), 'Keamanan', 'keamanan', 'Divisi Keamanan — Ring 1, 2, 3, K3, Roadshow', 9)
ON CONFLICT (committee_year_id, slug) DO NOTHING;

-- ============================================================
-- Roles (sesuai hierarki SK)
-- ============================================================
INSERT INTO roles (committee_year_id, name, slug, level, is_approver, is_meeting_creator) VALUES
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), 'PIC / Penanggung Jawab', 'pic', 100, true, true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), 'Ketua Panitia', 'ketua-panitia', 90, true, true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), 'Wakil Ketua', 'wakil-ketua', 80, true, true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), 'Sekretaris I', 'sekretaris-1', 75, true, false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), 'Sekretaris II', 'sekretaris-2', 75, true, false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), 'Bendahara', 'bendahara', 70, false, false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), 'Koordinator Divisi', 'koordinator', 60, false, true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), 'Wakil Koordinator', 'wakil-koordinator', 55, false, false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), 'Anggota', 'anggota', 50, false, false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), 'PIC / Penanggung Jawab Subdivisi', 'pic-sub', 53, false, false)
ON CONFLICT (committee_year_id, slug) DO NOTHING;

-- ============================================================
-- KPI Items (dari Dokumen KPI I-FEST 2026)
-- ============================================================
INSERT INTO kpi_items (committee_year_id, division_id, title, target, deadline, is_milestone) VALUES
  -- BPH
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'bph'), 'Audiensi Eksternal VVIP', 'Hadir 100% pada Audiensi Eksternal VVIP (Dekanat, BI, Hannah Asa, Sponsor Utama)', NULL, true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'bph'), 'Resolusi Bottleneck Antar-Divisi', 'Menyelesaikan 100% hambatan komunikasi antar-divisi', NULL, false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'bph'), 'Notulensi Rapat', 'Notulensi dirilis maksimal 2x24 jam menggunakan format poin-poin singkat', NULL, false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'bph'), 'Template Surat Baku HMTI', '100% surat/proposal menggunakan Template Baku HMTI', NULL, true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'bph'), 'LPJ Bulanan', 'Draft LPJ dicicil per bulan', NULL, false),

  -- Acara
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'acara'), 'Konsep Kasar & Rulebook', 'Menyelesaikan 100% penyusunan konsep kasar, Rulebook Lomba, draft Rundown', '2026-10-01', true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'acara'), 'Modul Edukasi Roadshow', 'Fiksasi 1 Modul Edukasi Baku bersama Hannah Asa', '2026-05-31', true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'acara'), 'Tim Kecil Roadshow', 'Membentuk 3 Tim Kecil Roadshow dari anggota panitia lain untuk 25 titik', '2026-08-01', true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'acara'), 'Draft Rulebook 5 Lomba', 'Menyelesaikan Draft Rulebook untuk 5 lomba (RAB Kasar & Aturan Lomba)', '2026-05-31', true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'acara'), 'Buku Saku Modul Visitasi', 'Merumuskan draft Buku Saku Modul Visitasi sebagai syarat konversi SKS', '2026-08-01', true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'acara'), 'Audiensi Mitra Travel', 'Audiensi fiksasi dengan minimal 1 Mitra Travel Tour pada bulan Juni', '2026-06-30', false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'acara'), 'Blueprint Expo', 'Fiksasi Blueprint pembagian lapak/zonasi Paviliun S-DIH', '2026-08-01', true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'acara'), 'Kurasi 5 Karya Inovasi', 'Mengkurasi minimal 5 karya Inovasi dari mahasiswa tingkat akhir JTI', '2026-11-01', false),

  -- Humas
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'humas'), 'Response Time Medsos', 'Merespons interaksi via DM Instagram/Tiktok/WA maksimal 1x24 jam', NULL, false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'humas'), 'Eksekusi Surat Lintas Divisi', '100% permohonan draft surat dari divisi lain dieksekusi tanpa delay', NULL, false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'humas'), 'MoU Media Partner', 'Mengamankan MoU dengan minimal 15 Media Partner Lokal + 5 Nasional', '2026-10-01', true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'humas'), 'Distribusi Surat', 'Tingkat keberhasilan distribusi surat/proposal mencapai 95%', NULL, false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'humas'), 'Survei Venue', 'Laporan survei venue diperbarui maksimal 1x24 jam setelah dari lapangan', NULL, false),

  -- Sponsorship
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'sponsorship'), 'Closing Deal Sponsor', 'Wajib hadir mendampingi Ketupat/PIC dalam Negosiasi Final sponsor Diamond & Tungsten', '2026-10-01', true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'sponsorship'), 'Database Leads', 'Menyetorkan minimal 30 leads valid (Nama Manajer, Email HR/PR, No. Kontak)', '2026-06-30', true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'sponsorship'), 'Proposal Kustom', '100% proposal VIP/BUMN/Instansi telah di-kustomisasi (logo perusahaan + nama direktur)', NULL, false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'sponsorship'), 'Distribusi Proposal Fisik', '100% proposal fisik terdistribusi dengan follow-up H+3 dan H+7', '2026-08-01', false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'sponsorship'), 'QC Visual Sponsor', '0% komplain sponsor terkait peletakan logo, ad-lips MC, booth', NULL, false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'sponsorship'), 'LPJ & Plakat Sponsor', 'Menyerahkan LPJ dan Plakat Apresiasi ke mitra maksimal H+14', '2026-11-14', true),

  -- Kreativitas
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'kreativitas'), 'Konsistensi Brand', '100% output desain selaras dengan Brand Guidelines (KV) dari Buta Warna', NULL, false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'kreativitas'), 'Zero Bottleneck Buta Warna', 'Tidak ada keterlambatan revisi komunikasi dengan tim Buta Warna', NULL, false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'kreativitas'), 'Content Calendar Bulanan', 'Merilis Content Calendar selambatnya H-7 sebelum bulan baru', NULL, true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'kreativitas'), 'Final Video H-2', 'Video promo/edukasi diserahkan maksimal H-2 dari jadwal tayang', NULL, false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'kreativitas'), 'Desain Turunan 100%', '100% pemenuhan desain turunan tanpa mengubah Key Visual utama', NULL, false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'kreativitas'), 'Cetak Biru Dekorasi', 'Mengesahkan Cetak Biru Dekorasi Venue dan RAB Estetika', '2026-10-01', true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'kreativitas'), 'Backup Dokumentasi', '100% file mentah dokumentasi tercadang maksimal 1x24 jam', NULL, false),

  -- Ekonomi Kreatif
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'ekonomi-kreatif'), 'Target Dana Usaha', 'Memenuhi 100% target Dana Usaha (Rp 28-31 Juta)', '2026-10-14', true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'ekonomi-kreatif'), 'Zero Loss Keuangan', '0% selisih antara jumlah kupon/barang terjual dengan kas', NULL, false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'ekonomi-kreatif'), 'Target Penjualan Rutin', '200-320 pcs dessert/minggu & 25-40 paket lunch/minggu', NULL, false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'ekonomi-kreatif'), 'Produksi Merchandise', 'Menyelesaikan produksi Merchandise Chapter 1 & 2 secara Pre-Order tanpa overstok', '2026-08-01', true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'ekonomi-kreatif'), 'DP Tenant UMKM', 'Mengamankan DP 50% dari 15-30 Tenant UMKM', '2026-10-01', false),

  -- Konsumsi
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'konsumsi'), 'Fiksasi Vendor Catering', 'Mengesahkan RAB detail Konsumsi dan fiksasi 100% vendor', '2026-10-01', true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'konsumsi'), 'Riders VIP', 'Menyediakan riders konsumsi artis/VIP 100% sesuai permintaan', NULL, false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'konsumsi'), 'Distribusi Ransum', '0% panitia/relawan yang tidak mendapat jatah makan', NULL, false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'konsumsi'), 'Loading Konsumsi', 'Loading ribuan boks makanan dari vendor ke ruang penyimpanan < 30 menit', NULL, false),

  -- Logistik
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'logistik'), 'Kesiapan Properti Roadshow', '100% properti Roadshow sedia H-1 sebelum keberangkatan', NULL, false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'logistik'), 'Pengembalian Barang Pinjaman', '100% barang pinjaman HMTI/Fakultas kembali H+3 tanpa hilang/rusak', '2026-11-13', true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'logistik'), 'Verifikasi Anggaran Barang', '100% RAB Barang terverifikasi urgensinya', NULL, false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'logistik'), 'Pengecekan Alat H-2', 'Memastikan fungsi alat (HT, kabel) pada H-2 sebelum diserahkan', NULL, false),

  -- Lapangan
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'lapangan'), 'Area Venue Siap H-1', 'Area venue 100% siap operasional maksimal H-1', NULL, true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'lapangan'), 'Cetak Biru Keamanan Ring 1', 'Mengesahkan Cetak Biru lapis keamanan fisik Ring 1', '2026-10-14', true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'lapangan'), 'Navigasi VIP', '100% tamu VVIP tiba di kursi/ruang transit tanpa tersesat', NULL, false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'lapangan'), 'Delay Taktis Maksimal 3 Menit', 'Delay maksimal 3 menit sejak perintah dikeluarkan oleh Koor Lapangan', NULL, false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'lapangan'), '0% Penumpukan Massa', '0% bottleneck fatal di area registrasi dan lorong Expo', NULL, false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'lapangan'), 'Backup Genset', '0% insiden listrik anjlok dengan menyiapkan backup genset', '2026-10-28', true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'lapangan'), 'Changeover Panggung', '0% kendala posisi kursi/meja saat narasumber di atas panggung', NULL, false),

  -- Keamanan
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'keamanan'), 'Personel Keamanan Eksternal', 'Mengamankan minimal 20 personel keamanan eksternal (Menwa/Polisi)', '2026-10-01', true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'keamanan'), 'Sterilisasi Backstage', 'Mencegah penyusup tanpa ID Card/Gelang Akses khusus', NULL, false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'keamanan'), '0% Kebocoran Tiket', '0% penonton tanpa tiket masuk', NULL, false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'keamanan'), 'Keamanan Roadshow', '0 insiden keselamatan saat 25 titik Roadshow', NULL, false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'keamanan'), 'Posko P3K', 'Menyiapkan posko P3K dan jalur darurat', NULL, false)
ON CONFLICT DO NOTHING;
