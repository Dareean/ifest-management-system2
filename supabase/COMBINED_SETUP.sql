-- ============================================================
-- I-FEST MANAGEMENT SYSTEM — COMPLETE COMBINED SETUP SQL
-- Jalankan file ini SATU KALI di SQL Editor Supabase Dashboard!
-- Menggabungkan seluruh skema database, migrasi, dan seed data.
-- Safe to run on blank or partially initialized databases.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. TABLES CREATION (Baseline)
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

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    committee_assignment_id UUID NOT NULL REFERENCES committee_assignments(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    is_read BOOLEAN DEFAULT false,
    email_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

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
-- 2. AUTH TRIGGER
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
-- 3. MIGRATIONS (ENSURE ALL NEW COLUMNS EXIST IDEMPOTENTLY)
-- ============================================================
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS whatsapp_sent BOOLEAN DEFAULT false;
ALTER TABLE divisions ADD COLUMN IF NOT EXISTS whatsapp_group_id VARCHAR(100);
ALTER TABLE divisions ADD COLUMN IF NOT EXISTS supervisor_id UUID REFERENCES committee_assignments(id) ON DELETE SET NULL;
ALTER TABLE budget_transactions ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE budget_transactions ADD COLUMN IF NOT EXISTS receipt_number VARCHAR(100);
ALTER TABLE letter_requests ADD COLUMN IF NOT EXISTS letter_number VARCHAR(100);
ALTER TABLE roles ADD COLUMN IF NOT EXISTS is_report_creator BOOLEAN DEFAULT false;
ALTER TABLE committee_assignments ADD COLUMN IF NOT EXISTS can_submit_report BOOLEAN DEFAULT false;
ALTER TABLE committee_assignments ADD COLUMN IF NOT EXISTS can_create_meeting BOOLEAN DEFAULT false;

-- Update existing coordinator and vice coordinator roles to have is_report_creator = true by default
UPDATE roles SET is_report_creator = true WHERE level >= 55;

-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS) & POLICIES
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

DO $$ BEGIN
    CREATE POLICY "Allow public read" ON committee_years FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public read" ON divisions FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public read" ON roles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public read" ON kpi_items FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated all" ON committee_years FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated all" ON divisions FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated all" ON roles FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated all" ON profiles FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated all" ON committee_assignments FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated all" ON letter_templates FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated all" ON letter_requests FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated all" ON letter_revisions FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated all" ON meetings FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated all" ON meeting_invitees FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated all" ON meeting_notes FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated all" ON kpi_items FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated all" ON tasks FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated all" ON notifications FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated all" ON weekly_reports FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated all" ON budgets FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated all" ON budget_transactions FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated all" ON budget_requests FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated all" ON email_queue FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Grants
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- ============================================================
-- 5. SEED DATA
-- ============================================================

-- 1. Committee year
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

-- 3. Roles
INSERT INTO roles (committee_year_id, name, slug, level, is_approver, is_meeting_creator, is_report_creator) VALUES
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), 'PIC / Penanggung Jawab', 'pic', 100, true, true, true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), 'Ketua Panitia', 'ketua-panitia', 90, true, true, true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), 'Wakil Ketua', 'wakil-ketua', 80, true, true, true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), 'Sekretaris I', 'sekretaris-1', 75, true, false, true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), 'Sekretaris II', 'sekretaris-2', 75, true, false, true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), 'Bendahara', 'bendahara', 70, false, false, true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), 'Koordinator Divisi', 'koordinator', 60, false, true, true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), 'Wakil Koordinator', 'wakil-koordinator', 55, false, false, true),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), 'Anggota', 'anggota', 50, false, false, false),
  ((SELECT id FROM committee_years WHERE label = 'I-FEST 2026'), 'PIC / Penanggung Jawab Subdivisi', 'pic-sub', 53, false, false, false)
ON CONFLICT (committee_year_id, slug) DO NOTHING;

-- 4. Budgets (auto-create budget Rp 0 untuk tiap divisi)
INSERT INTO budgets (committee_year_id, division_id, total_budget)
SELECT d.committee_year_id, d.id, 0
FROM divisions d
WHERE d.committee_year_id = (SELECT id FROM committee_years WHERE label = 'I-FEST 2026')
ON CONFLICT (committee_year_id, division_id) DO NOTHING;
