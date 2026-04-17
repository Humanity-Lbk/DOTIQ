-- Fix requests table RLS to allow admins to insert and read their own requests
-- Run this in Supabase SQL Editor

ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can insert requests" ON requests;
DROP POLICY IF EXISTS "Users can view own requests" ON requests;
DROP POLICY IF EXISTS "Super admins view all requests" ON requests;
DROP POLICY IF EXISTS "Super admins update requests" ON requests;

CREATE POLICY "Admins can insert requests"
  ON requests FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Super admins view all requests"
  ON requests FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Admins view own requests"
  ON requests FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id AND EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Super admins update requests"
  ON requests FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Enable realtime on requests table for in-app notifications
ALTER PUBLICATION supabase_realtime ADD TABLE requests;
