-- Migration: Remove view_count column from projects table
-- Description: Drop the view_count column and its associated index
-- Author: Divij Shrivastava
-- Date: 2025-12-28

-- Drop the index first
DROP INDEX IF EXISTS public.projects_view_count_idx;

-- Drop the view_count column from projects table
ALTER TABLE public.projects
DROP COLUMN IF EXISTS view_count;

-- Verify the column is removed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'projects'
      AND column_name = 'view_count'
  ) THEN
    RAISE NOTICE 'SUCCESS: view_count column removed from projects table';
  ELSE
    RAISE EXCEPTION 'FAILED: view_count column still exists in projects table';
  END IF;
END $$;
