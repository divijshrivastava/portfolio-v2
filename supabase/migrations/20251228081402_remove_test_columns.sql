-- Migration: Remove test columns from previous workflow tests
-- Description: Clean up github_actions_test and approval_gate_test columns
-- Author: Cleanup
-- Date: 2025-12-28

-- Remove test column from projects table
ALTER TABLE public.projects
DROP COLUMN IF EXISTS github_actions_test;

-- Remove index if it exists
DROP INDEX IF EXISTS projects_view_count_idx;

-- Remove test column from blogs table
ALTER TABLE public.blogs
DROP COLUMN IF EXISTS approval_gate_test;

-- Verify the columns are removed
DO $$
BEGIN
  -- Check projects.github_actions_test is gone
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'projects'
      AND column_name = 'github_actions_test'
  ) THEN
    RAISE EXCEPTION 'FAILED: github_actions_test column still exists in projects table';
  ELSE
    RAISE NOTICE 'SUCCESS: github_actions_test column removed from projects table';
  END IF;

  -- Check blogs.approval_gate_test is gone
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'blogs'
      AND column_name = 'approval_gate_test'
  ) THEN
    RAISE EXCEPTION 'FAILED: approval_gate_test column still exists in blogs table';
  ELSE
    RAISE NOTICE 'SUCCESS: approval_gate_test column removed from blogs table';
  END IF;
END $$;
