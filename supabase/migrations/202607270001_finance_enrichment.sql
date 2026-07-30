-- ============================================================
-- FINANCE ENRICHMENT — Bukti Transaksi & Kategori
-- ============================================================

-- Add attachment_url untuk upload bukti transaksi (nota/kwitansi/bukti transfer)
ALTER TABLE budget_transactions
ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- Add receipt_number untuk nomor referensi kwitansi/nota
ALTER TABLE budget_transactions
ADD COLUMN IF NOT EXISTS receipt_number VARCHAR(100);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_budget_transactions_category ON budget_transactions(category);
CREATE INDEX IF NOT EXISTS idx_budget_transactions_type ON budget_transactions(type);
