-- ============================================================
-- I-FEST MANAGEMENT SYSTEM — v2.0 Migration
-- Auth trigger, RLS policies, Finance tables
-- Execute ALL in Supabase SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- A. AUTH TRIGGER
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
-- B. UPDATED RLS POLICIES (using profiles instead of users)
-- ============================================================

-- Drop old policies that reference `users`
DROP POLICY IF EXISTS "Allow authenticated all" ON users;
DROP POLICY IF EXISTS "Allow users select own" ON users;
DROP POLICY IF EXISTS "Allow users update own" ON users;

-- Enable RLS on all tables (idempotent)
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

-- Drop existing policies to be idempotent
DO $$
DECLARE
  policies text[] := ARRAY[
    'Allow public read', 'Allow authenticated all',
    'Allow profiles select own', 'Allow profiles update own'
  ];
  tables text[] := ARRAY[
    'committee_years', 'divisions', 'roles', 'profiles',
    'committee_assignments', 'letter_templates', 'letter_requests',
    'letter_revisions', 'meetings', 'meeting_invitees', 'meeting_notes',
    'kpi_items', 'tasks', 'notifications'
  ];
  t text;
  p text;
BEGIN
  FOREACH t IN ARRAY tables LOOP
    FOREACH p IN ARRAY policies LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', p, t);
    END LOOP;
  END LOOP;
END;
$$;

-- Public read policies (reference data)
CREATE POLICY "Allow public read" ON committee_years FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON divisions FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON roles FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON kpi_items FOR SELECT USING (true);

-- Authenticated users: full CRUD (app-layer authorization)
DO $$
DECLARE
  tables text[] := ARRAY[
    'committee_years', 'divisions', 'roles', 'profiles',
    'committee_assignments', 'letter_templates', 'letter_requests',
    'letter_revisions', 'meetings', 'meeting_invitees', 'meeting_notes',
    'kpi_items', 'tasks', 'notifications'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format(
      'CREATE POLICY "Allow authenticated all" ON %I FOR ALL USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'')',
      t
    );
  END LOOP;
END;
$$;

-- Profile-specific: users can only see/edit their own profile
CREATE POLICY "Allow profiles select own" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow profiles update own" ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================
-- C. FINANCE MODULE TABLES
-- ============================================================

-- C.1 Budgets (anggaran per divisi)
DROP TABLE IF EXISTS budget_transactions CASCADE;
DROP TABLE IF EXISTS budget_requests CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS email_queue CASCADE;

CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    committee_year_id UUID NOT NULL REFERENCES committee_years(id) ON DELETE CASCADE,
    division_id UUID NOT NULL REFERENCES divisions(id),
    total_budget NUMERIC(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(committee_year_id, division_id)
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated all" ON budgets FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- C.2 Budget transactions (pemasukan/pengeluaran)
CREATE TABLE budget_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    category VARCHAR(100),
    transaction_date TIMESTAMPTZ DEFAULT now(),
    created_by UUID NOT NULL REFERENCES committee_assignments(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE budget_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated all" ON budget_transactions FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_budget_transactions_budget ON budget_transactions(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_transactions_date ON budget_transactions(transaction_date);

-- C.3 Budget requests (pengajuan dana)
CREATE TABLE budget_requests (
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

ALTER TABLE budget_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated all" ON budget_requests FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_budget_requests_year ON budget_requests(committee_year_id);
CREATE INDEX IF NOT EXISTS idx_budget_requests_status ON budget_requests(status);
CREATE INDEX IF NOT EXISTS idx_budget_requests_division ON budget_requests(division_id);

-- ============================================================
-- D. EMAIL QUEUE (for background worker)
-- ============================================================
CREATE TABLE email_queue (
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

ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated all" ON email_queue FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status, priority);
