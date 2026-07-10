-- ============================================================
-- I-FEST MANAGEMENT SYSTEM — RLS POLICIES v2.0
-- Updated for profiles table (was users in v1)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE committee_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to be idempotent
DROP POLICY IF EXISTS "Allow public read" ON committee_years;
DROP POLICY IF EXISTS "Allow public read" ON divisions;
DROP POLICY IF EXISTS "Allow public read" ON roles;
DROP POLICY IF EXISTS "Allow public read" ON kpi_items;
DROP POLICY IF EXISTS "Allow authenticated all" ON committee_years;
DROP POLICY IF EXISTS "Allow authenticated all" ON divisions;
DROP POLICY IF EXISTS "Allow authenticated all" ON roles;
DROP POLICY IF EXISTS "Allow authenticated all" ON profiles;
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
DROP POLICY IF EXISTS "Allow authenticated all" ON budgets;
DROP POLICY IF EXISTS "Allow authenticated all" ON budget_transactions;
DROP POLICY IF EXISTS "Allow authenticated all" ON budget_requests;
DROP POLICY IF EXISTS "Allow authenticated all" ON email_queue;
DROP POLICY IF EXISTS "Allow profiles select own" ON profiles;
DROP POLICY IF EXISTS "Allow profiles update own" ON profiles;

-- Public read policies (reference data — safe for unauthenticated)
CREATE POLICY "Allow public read" ON committee_years FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON divisions FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON roles FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON kpi_items FOR SELECT USING (true);

-- Authenticated users: full CRUD (fine-grained auth at app layer)
CREATE POLICY "Allow authenticated all" ON committee_years FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated all" ON divisions FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated all" ON roles FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated all" ON profiles FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
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
CREATE POLICY "Allow authenticated all" ON budgets FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated all" ON budget_transactions FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated all" ON budget_requests FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated all" ON email_queue FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Profile-specific: users can only see/edit their own profile
CREATE POLICY "Allow profiles select own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow profiles update own" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
