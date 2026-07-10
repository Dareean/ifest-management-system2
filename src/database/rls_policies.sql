-- ============================================================
-- I-FEST 2026 — RLS POLICIES
-- Enable Row-Level Security on all tables
-- ============================================================

-- Enable RLS
ALTER TABLE committee_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE letter_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE letter_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE letter_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_invitees ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to be idempotent
DROP POLICY IF EXISTS "Allow public read" ON committee_years;
DROP POLICY IF EXISTS "Allow public read" ON divisions;
DROP POLICY IF EXISTS "Allow public read" ON roles;
DROP POLICY IF EXISTS "Allow public read" ON kpi_items;
DROP POLICY IF EXISTS "Allow authenticated all" ON committee_years;
DROP POLICY IF EXISTS "Allow authenticated all" ON divisions;
DROP POLICY IF EXISTS "Allow authenticated all" ON roles;
DROP POLICY IF EXISTS "Allow authenticated all" ON users;
DROP POLICY IF EXISTS "Allow authenticated all" ON committee_assignments;
DROP POLICY IF EXISTS "Allow authenticated all" ON letter_templates;
DROP POLICY IF EXISTS "Allow authenticated all" ON letter_requests;
DROP POLICY IF EXISTS "Allow authenticated all" ON letter_revisions;
DROP POLICY IF EXISTS "Allow authenticated all" ON meetings;
DROP POLICY IF EXISTS "Allow authenticated all" ON meeting_invitees;
DROP POLICY IF EXISTS "Allow authenticated all" ON meeting_notes;
DROP POLICY IF EXISTS "Allow authenticated all" ON kpi_items;
DROP POLICY IF EXISTS "Allow authenticated all" ON tasks;
DROP POLICY IF EXISTS "Allow authenticated all" ON notifications;
DROP POLICY IF EXISTS "Allow users select own" ON users;
DROP POLICY IF EXISTS "Allow users update own" ON users;

-- ============================================================
-- Public read policies (for anon key / unauthenticated)
-- These allow the frontend to read reference data
-- ============================================================
CREATE POLICY "Allow public read" ON committee_years FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON divisions FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON roles FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON kpi_items FOR SELECT USING (true);

-- ============================================================
-- Authenticated users: full CRUD on all tables
-- (Fine-grained per-row role checks are enforced at the
--  application layer, not via overly complex RLS policies)
-- ============================================================
CREATE POLICY "Allow authenticated all" ON committee_years FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated all" ON divisions FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated all" ON roles FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated all" ON users FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated all" ON committee_assignments FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated all" ON letter_templates FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated all" ON letter_requests FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated all" ON letter_revisions FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated all" ON meetings FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated all" ON meeting_invitees FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated all" ON meeting_notes FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated all" ON kpi_items FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated all" ON tasks FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated all" ON notifications FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- User-specific policies (for users table)
-- Users can only see and edit their own profile
-- ============================================================
CREATE POLICY "Allow users select own" ON users FOR SELECT USING (auth.uid() = auth_id);
CREATE POLICY "Allow users update own" ON users FOR UPDATE USING (auth.uid() = auth_id) WITH CHECK (auth.uid() = auth_id);
