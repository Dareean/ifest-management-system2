-- ============================================================
-- I-FEST MANAGEMENT SYSTEM — WhatsApp Group Support
-- Version: 1.2.0
-- Date: 2026-07-11
-- Description: Add WhatsApp Group ID support for division notifications
-- ============================================================

-- Add whatsapp_group_id column to divisions table
-- This stores the Fonnte Group ID (JID) for each division's WhatsApp group
ALTER TABLE divisions
ADD COLUMN IF NOT EXISTS whatsapp_group_id VARCHAR(100);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_divisions_whatsapp_group
ON divisions(whatsapp_group_id) WHERE whatsapp_group_id IS NOT NULL;

-- Add comment to document the column
COMMENT ON COLUMN divisions.whatsapp_group_id IS
'WhatsApp Group ID (JID) dari Fonnte untuk notifikasi grup divisi ini. Contoh: 120363XXXXXX@g.us';

-- ============================================================
-- USAGE INSTRUCTIONS:
-- ============================================================
-- 1. Di dashboard Fonnte, buka menu "Groups" untuk melihat daftar grup
--    yang terkoneksi dengan WhatsApp Anda.
--
-- 2. Copy "Group ID" (format: 120363XXXXXX@g.us) dari grup divisi tersebut.
--
-- 3. Update tabel divisions dengan Group ID:
--    UPDATE divisions
--    SET whatsapp_group_id = '120363XXXXXX@g.us'
--    WHERE slug = 'divisi-konsumsi';
--
-- 4. Setelah Group ID diisi, notifikasi divisi akan otomatis dikirim
--    ke grup WhatsApp tersebut (bukan per-orang).
--
-- 5. Jika Group ID tidak diisi (NULL), sistem akan fallback ke
--    pengiriman per-orang seperti sebelumnya.
-- ============================================================

-- ============================================================
-- VERIFICATION:
-- ============================================================
-- Cek kolom baru sudah ada:
-- SELECT column_name, data_type, character_maximum_length
-- FROM information_schema.columns
-- WHERE table_name = 'divisions' AND column_name = 'whatsapp_group_id';
--
-- Lihat divisi mana yang sudah punya Group ID:
-- SELECT name, slug, whatsapp_group_id
-- FROM divisions
-- WHERE committee_year_id = 'c2f2a48e-3e58-4559-aaa0-623a3825348b';
-- ============================================================
