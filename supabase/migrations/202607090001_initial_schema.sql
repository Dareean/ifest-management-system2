-- ============================================================
-- I-FEST MANAGEMENT SYSTEM — Baseline Schema
-- Version: 2.1.0
-- Konsolidasi dari: migration.sql, v2.0_migration.sql,
--   weekly_reports_migration.sql, rls_policies.sql, seed.sql
-- Idempotent: aman dijalankan ulang.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. DYNAMIC STRUCTURE (Zero-Hardcode)
-- ============================================================

CREATE TABLE IF NOT EXISTS committee_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label VARCHAR(50) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT false,
    started_at DATE NOT NULL,
    ended_at DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS divisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    committee_year_id UUID NOT NULL REFERENCES committee_years(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    whatsapp_group_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(committee_year_id, slug)
);

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    committee_year_id UUID NOT NULL REFERENCES committee_years(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL,
    level INT DEFAULT 0,
    is_approver BOOLEAN DEFAULT false,
    is_meeting_creator BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(committee_year_id, slug)
);

-- ============================================================
-- 2. USER MANAGEMENT
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    nim VARCHAR(20) UNIQUE NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS committee_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    committee_year_id UUID NOT NULL REFERENCES committee_years(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    division_id UUID NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    assigned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(committee_year_id, user_id)
);

-- ============================================================
-- 3. DOCUMENT & REQUEST WORKFLOW
-- ============================================================

CREATE TABLE IF NOT EXISTS letter_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    committee_year_id UUID NOT NULL REFERENCES committee_years(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS letter_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    committee_year_id UUID NOT NULL REFERENCES committee_years(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES committee_assignments(id),
    current_handler_id UUID REFERENCES committee_assignments(id),
    division_id UUID NOT NULL REFERENCES divisions(id),
    letter_type VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'requested',
    revision_count INT DEFAULT 0,
    final_document_url TEXT,
    deadline_at TIMESTAMPTZ,
    target_institution VARCHAR(255),
    category VARCHAR(50),
    request_options TEXT,
    priority VARCHAR(10) DEFAULT 'sedang',
    letter_number VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS letter_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    letter_request_id UUID NOT NULL REFERENCES letter_requests(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES committee_assignments(id),
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. MEETING PLANNER
-- ============================================================

CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    committee_year_id UUID NOT NULL REFERENCES committee_years(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES committee_assignments(id),
    title VARCHAR(255) NOT NULL,
    agenda TEXT,
    meeting_type VARCHAR(20) DEFAULT 'scheduled',
    meeting_link VARCHAR(500),
    location VARCHAR(255),
    attachment_url TEXT,
    scope VARCHAR(20) DEFAULT 'individual',
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meeting_invitees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    committee_assignment_id UUID NOT NULL REFERENCES committee_assignments(id),
    rsvp_status VARCHAR(20) DEFAULT 'pending',
    email_sent BOOLEAN DEFAULT false,
    UNIQUE(meeting_id, committee_assignment_id)
);

CREATE TABLE IF NOT EXISTS meeting_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL UNIQUE REFERENCES meetings(id) ON DELETE CASCADE,
    writer_id UUID NOT NULL REFERENCES committee_assignments(id),
    content TEXT NOT NULL,
    decision_points JSONB,
    action_items JSONB,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. KPI & TASK MANAGEMENT
-- ============================================================

CREATE TABLE IF NOT EXISTS kpi_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    committee_year_id UUID NOT NULL REFERENCES committee_years(id) ON DELETE CASCADE,
    division_id UUID NOT NULL REFERENCES divisions(id),
    title VARCHAR(255) NOT NULL,
    target TEXT NOT NULL,
    deadline DATE,
    is_milestone BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    committee_year_id UUID NOT NULL REFERENCES committee_years(id) ON DELETE CASCADE,
    kpi_item_id UUID REFERENCES kpi_items(id) ON DELETE SET NULL,
    division_id UUID NOT NULL REFERENCES divisions(id),
    assignee_id UUID REFERENCES committee_assignments(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'todo',
    priority VARCHAR(10) DEFAULT 'medium',
    deadline DATE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 6. NOTIFICATION SYSTEM
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    committee_assignment_id UUID NOT NULL REFERENCES committee_assignments(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    is_read BOOLEAN DEFAULT false,
    email_sent BOOLEAN DEFAULT false,
    whatsapp_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 7. WEEKLY REPORT SYSTEM
-- ============================================================

CREATE TABLE IF NOT EXISTS weekly_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    committee_year_id UUID NOT NULL REFERENCES committee_years(id) ON DELETE CASCADE,
    division_id UUID NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES committee_assignments(id) ON DELETE CASCADE,
    week_label VARCHAR(50) NOT NULL,
    achievements TEXT NOT NULL,
    blockers TEXT NOT NULL,
    next_week_targets TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'NEED_FIX')),
    supervisor_notes TEXT,
    submitted_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(division_id, week_label)
);

-- ============================================================
-- 8. FINANCE MODULE
-- ============================================================

CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    committee_year_id UUID NOT NULL REFERENCES committee_years(id) ON DELETE CASCADE,
    division_id UUID NOT NULL REFERENCES divisions(id),
    total_budget NUMERIC(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(committee_year_id, division_id)
);

CREATE TABLE IF NOT EXISTS budget_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    category VARCHAR(100),
    attachment_url TEXT,
    receipt_number VARCHAR(100),
    transaction_date TIMESTAMPTZ DEFAULT now(),
    created_by UUID NOT NULL REFERENCES committee_assignments(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS budget_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    committee_year_id UUID NOT NULL REFERENCES committee_years(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES committee_assignments(id),
    division_id UUID NOT NULL REFERENCES divisions(id),
    amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    purpose TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'disbursed')),
    handler_id UUID REFERENCES committee_assignments(id),
    handled_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(150),
    subject VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    priority INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    error_message TEXT,
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT now(),
    sent_at TIMESTAMPTZ
);

-- ============================================================
-- AUTH TRIGGER
-- Auto-create profile row when a new auth user signs up
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
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', SPLIT_PART(NEW.email, '@', 1)),
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
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_committee_assignments_year ON committee_assignments(committee_year_id);
CREATE INDEX IF NOT EXISTS idx_committee_assignments_user ON committee_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_letter_requests_status ON letter_requests(status);
CREATE INDEX IF NOT EXISTS idx_letter_requests_year ON letter_requests(committee_year_id);
CREATE INDEX IF NOT EXISTS idx_meetings_year ON meetings(committee_year_id);
CREATE INDEX IF NOT EXISTS idx_meetings_started ON meetings(started_at);
CREATE INDEX IF NOT EXISTS idx_meetings_scope ON meetings(scope);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_year ON tasks(committee_year_id);
CREATE INDEX IF NOT EXISTS idx_kpi_year ON kpi_items(committee_year_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(committee_assignment_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_whatsapp_sent ON notifications(committee_assignment_id, whatsapp_sent);
CREATE INDEX IF NOT EXISTS idx_divisions_whatsapp_group ON divisions(whatsapp_group_id) WHERE whatsapp_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_weekly_reports_division ON weekly_reports(division_id);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_week ON weekly_reports(week_label);
CREATE INDEX IF NOT EXISTS idx_budget_transactions_budget ON budget_transactions(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_transactions_date ON budget_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_budget_transactions_category ON budget_transactions(category);
CREATE INDEX IF NOT EXISTS idx_budget_transactions_type ON budget_transactions(type);
CREATE INDEX IF NOT EXISTS idx_budget_requests_year ON budget_requests(committee_year_id);
CREATE INDEX IF NOT EXISTS idx_budget_requests_status ON budget_requests(status);
CREATE INDEX IF NOT EXISTS idx_budget_requests_division ON budget_requests(division_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status, priority);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

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
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

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
CREATE POLICY "Allow authenticated all" ON weekly_reports FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated all" ON budgets FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated all" ON budget_transactions FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated all" ON budget_requests FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated all" ON email_queue FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Profile-specific: users can only see/edit their own profile
CREATE POLICY "Allow profiles select own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow profiles update own" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
