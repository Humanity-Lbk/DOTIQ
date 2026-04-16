-- Add email_sent_to column to reports table
ALTER TABLE reports ADD COLUMN IF NOT EXISTS email_sent_to TEXT;
