-- Add letter_number column to letter_requests table
ALTER TABLE letter_requests ADD COLUMN IF NOT EXISTS letter_number VARCHAR(100);
