-- ============================================================
-- I-FEST MANAGEMENT SYSTEM — WhatsApp Integration Migration
-- Version: 1.1.0
-- Date: 2026-07-11
-- Description: Add WhatsApp notification support via Fonnte API
-- ============================================================

-- Add whatsapp_sent column to notifications table
-- This tracks whether a WhatsApp notification has been sent
-- (similar to the existing email_sent column)
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS whatsapp_sent BOOLEAN DEFAULT false;

-- Add index for faster queries when filtering by whatsapp_sent status
CREATE INDEX IF NOT EXISTS idx_notifications_whatsapp_sent
ON notifications(committee_assignment_id, whatsapp_sent);

-- Add comment to document the column
COMMENT ON COLUMN notifications.whatsapp_sent IS 'Indicates whether a WhatsApp notification was sent via Fonnte API';

-- ============================================================
-- MIGRATION NOTES:
-- ============================================================
-- 1. The 'phone' column already exists in the users table
--    (see 202607090001_initial_schema.sql line 58), so we don't
--    need to add it again.
--
-- 2. This migration is safe to run multiple times (idempotent)
--    due to the IF NOT EXISTS clauses.
--
-- 3. After running this migration, update your application code
--    to use the new whatsapp_sent flag when sending notifications.
--
-- 4. To verify the migration:
--    SELECT column_name, data_type, column_default
--    FROM information_schema.columns
--    WHERE table_name = 'notifications' AND column_name = 'whatsapp_sent';
-- ============================================================
