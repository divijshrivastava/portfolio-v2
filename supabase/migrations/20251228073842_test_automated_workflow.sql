-- Migration: Test automated GitHub Actions workflow
-- Description: Adds a test column to verify end-to-end automated deployment
-- Author: Automated Workflow Test
-- Date: 2025-12-28

-- Add test column to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS github_actions_test BOOLEAN DEFAULT true;

-- Add comment to document the test
COMMENT ON COLUMN public.projects.github_actions_test IS 'Test column to verify automated GitHub Actions workflow for migrations';

-- Verify the change
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'projects'
      AND column_name = 'github_actions_test'
  ) THEN
    RAISE NOTICE 'SUCCESS: github_actions_test column exists in projects table';
  ELSE
    RAISE EXCEPTION 'FAILED: github_actions_test column not found in projects table';
  END IF;
END $$;
