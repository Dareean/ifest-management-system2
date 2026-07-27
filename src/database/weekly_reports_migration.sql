-- ============================================================
-- WEEKLY REPORT SYSTEM MIGRATION
-- Run this in the Supabase SQL Editor
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

-- Enable Row Level Security (RLS)
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users full access
DROP POLICY IF EXISTS "Allow authenticated all" ON weekly_reports;
CREATE POLICY "Allow authenticated all" ON weekly_reports 
FOR ALL 
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_weekly_reports_division ON weekly_reports(division_id);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_week ON weekly_reports(week_label);
