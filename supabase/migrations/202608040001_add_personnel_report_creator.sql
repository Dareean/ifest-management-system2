-- Add can_submit_report column to committee_assignments table
ALTER TABLE committee_assignments ADD COLUMN IF NOT EXISTS can_submit_report BOOLEAN DEFAULT false;
