-- Add is_report_creator column to roles table
ALTER TABLE roles ADD COLUMN IF NOT EXISTS is_report_creator BOOLEAN DEFAULT false;

-- Update existing coordinator and vice coordinator roles to have is_report_creator = true by default
UPDATE roles SET is_report_creator = true WHERE level >= 55;
