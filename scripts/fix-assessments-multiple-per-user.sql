-- Allow multiple assessments per user
-- Run this in Supabase SQL Editor

-- 1. Drop any unique constraint on user_id (if it exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'assessments_user_id_key'
    AND conrelid = 'assessments'::regclass
  ) THEN
    ALTER TABLE assessments DROP CONSTRAINT assessments_user_id_key;
  END IF;
END $$;

-- 2. Ensure created_at and updated_at have defaults
ALTER TABLE assessments
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

-- 3. Drop existing RLS policies on assessments and recreate them correctly
DROP POLICY IF EXISTS "Users can insert their own assessments" ON assessments;
DROP POLICY IF EXISTS "Users can view their own assessments" ON assessments;
DROP POLICY IF EXISTS "Users can update their own assessments" ON assessments;
DROP POLICY IF EXISTS "Users can delete their own assessments" ON assessments;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON assessments;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON assessments;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON assessments;

-- Enable RLS if not already enabled
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Users can insert their own assessments"
  ON assessments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own assessments"
  ON assessments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments"
  ON assessments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assessments"
  ON assessments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Allow super_admin to view all assessments (if profiles table has role column)
DROP POLICY IF EXISTS "Admins can view all assessments" ON assessments;
CREATE POLICY "Admins can view all assessments"
  ON assessments FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );
