-- ============================================================
-- I-FEST MANAGEMENT SYSTEM — Database Migration
-- Version: 1.0.0
-- Target: Supabase (PostgreSQL)
-- Note: Execute this SQL in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. DYNAMIC STRUCTURE (Zero-Hardcode)
-- ============================================================

CREATE TABLE committee_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT false,
    started_at DATE NOT NULL,
    ended_at DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE divisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    committee_year_id UUID NOT NULL REFERENCES committee_years(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(committee_year_id, slug)
);

CREATE TABLE roles (
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

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    nim VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE committee_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    committee_year_id UUID NOT NULL REFERENCES committee_years(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    division_id UUID NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    assigned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(committee_year_id, user_id)
);

-- ============================================================
-- 3. DOCUMENT & REQUEST WORKFLOW
-- ============================================================

CREATE TABLE letter_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    committee_year_id UUID NOT NULL REFERENCES committee_years(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE letter_requests (
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
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE letter_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    letter_request_id UUID NOT NULL REFERENCES letter_requests(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES committee_assignments(id),
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. MEETING PLANNER
-- ============================================================

CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    committee_year_id UUID NOT NULL REFERENCES committee_years(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES committee_assignments(id),
    title VARCHAR(255) NOT NULL,
    agenda TEXT,
    meeting_type VARCHAR(20) DEFAULT 'scheduled',
    meeting_link VARCHAR(500),
    location VARCHAR(255),
    attachment_url TEXT,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE meeting_invitees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    committee_assignment_id UUID NOT NULL REFERENCES committee_assignments(id),
    rsvp_status VARCHAR(20) DEFAULT 'pending',
    email_sent BOOLEAN DEFAULT false,
    UNIQUE(meeting_id, committee_assignment_id)
);

CREATE TABLE meeting_notes (
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

CREATE TABLE kpi_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    committee_year_id UUID NOT NULL REFERENCES committee_years(id) ON DELETE CASCADE,
    division_id UUID NOT NULL REFERENCES divisions(id),
    title VARCHAR(255) NOT NULL,
    target TEXT NOT NULL,
    deadline DATE,
    is_milestone BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE tasks (
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

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    committee_assignment_id UUID NOT NULL REFERENCES committee_assignments(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    is_read BOOLEAN DEFAULT false,
    email_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_committee_assignments_year ON committee_assignments(committee_year_id);
CREATE INDEX idx_committee_assignments_user ON committee_assignments(user_id);
CREATE INDEX idx_letter_requests_status ON letter_requests(status);
CREATE INDEX idx_letter_requests_year ON letter_requests(committee_year_id);
CREATE INDEX idx_meetings_year ON meetings(committee_year_id);
CREATE INDEX idx_meetings_started ON meetings(started_at);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_year ON tasks(committee_year_id);
CREATE INDEX idx_kpi_year ON kpi_items(committee_year_id);
CREATE INDEX idx_notifications_unread ON notifications(committee_assignment_id, is_read);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE committee_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE letter_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_invitees ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Example RLS: Users can only see data from their active committee year
-- (Detailed RLS policies to be configured via Supabase Dashboard after auth is set up)

-- ============================================================
-- SEED DATA: I-FEST 2026
-- ============================================================

-- 1. Create committee year
INSERT INTO committee_years (label, is_active, started_at)
VALUES ('I-FEST 2026', true, '2026-03-05');

-- 2. Create roles (based on SK Kepanitiaan)
-- Note: Assign the committee_year_id from the insert above
-- These would be inserted via the application after initial setup
