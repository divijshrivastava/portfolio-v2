-- Migration: Fix admin permissions for user_activity table
-- Description: Allow admins to delete activity logs from the admin panel
-- Author: Divij Shrivastava
-- Date: 2025-12-31

-- Ensure RLS is enabled
ALTER TABLE IF EXISTS public.user_activity ENABLE ROW LEVEL SECURITY;

-- Drop existing admin policies if they exist
DROP POLICY IF EXISTS "Admins can delete user activity" ON public.user_activity;
DROP POLICY IF EXISTS "Admins can manage user activity" ON public.user_activity;

-- Create comprehensive admin policy for user_activity
-- Admins can SELECT, INSERT, UPDATE, DELETE
CREATE POLICY "Admins can manage user activity"
  ON public.user_activity
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Verify the policy was created
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'user_activity' 
      AND policyname = 'Admins can manage user activity'
  ) THEN
    RAISE NOTICE 'SUCCESS: Admin policy created for user_activity';
  ELSE
    RAISE WARNING 'FAILED: Admin policy was not created';
  END IF;
END $$;

