-- Add can_create_meeting column to committee_assignments table
ALTER TABLE committee_assignments ADD COLUMN IF NOT EXISTS can_create_meeting BOOLEAN DEFAULT false;
