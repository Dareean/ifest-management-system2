-- ============================================================
-- I-FEST 2026 — SEED DATA (lokal)
-- Dijalankan otomatis setelah migrations saat `supabase db reset`
-- ============================================================

-- 1. Committee year
-- ID sengaja dipakai SAMA dengan ID produksi (c2f2a48e-...) karena
-- kode aplikasi meng-hardcode YEAR_ID ini (src/lib/auth/authorize.ts, dll).
INSERT INTO committee_years (id, label, is_active, started_at)
VALUES ('c2f2a48e-3e58-4559-aaa0-623a3825348b', 'I-FEST 2026', true, '2026-03-05')
ON CONFLICT (id) DO NOTHING;

-- 2. Divisions
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

-- 3
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

-- 4. KPI Items
INSERT INTO kpi_items (committee_year_id, division_id, title, target, deadline, is_milestone) VALUES
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'bph'), 'Audiensi Eksternal VVIP', 'Hadir 100% pada Audiensi Eksternal VVIP (Dekanat, BI, Hannah Asa, Sponsor Utama)', NULL, true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'bph'), 'Resolusi Bottleneck Antar-Divisi', 'Menyelesaikan 100% hambatan komunikasi antar-divisi', NULL, false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'bph'), 'Notulensi Rapat', 'Notulensi dirilis maksimal 2x24 jam menggunakan format poin-poin singkat', NULL, false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'bph'), 'Template Surat Baku HMTI', '100% surat/proposal menggunakan Template Baku HMTI', NULL, true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), (SELECT id FROM divisions WHERE slug = 'bph'), 'LPJ Bulanan', 'Draft LPJ dicicil per bulan', NULL, false)
ON CONFLICT DO NOTHING;