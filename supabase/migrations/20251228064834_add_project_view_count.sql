-- Migration: Add view count tracking to projects
-- Description: Track how many times each project page is viewed
-- Author: Divij Shrivastava
-- Date: 2025-12-28

-- Add view_count column to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Add index for potential sorting by popularity
CREATE INDEX IF NOT EXISTS projects_view_count_idx
ON public.projects(view_count DESC);

-- Add comment to document the column
COMMENT ON COLUMN public.projects.view_count IS 'Number of times this project page has been viewed';

-- Verify the change
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'projects'
      AND column_name = 'view_count'
  ) THEN
    RAISE NOTICE 'SUCCESS: view_count column exists in projects table';
  ELSE
    RAISE EXCEPTION 'FAILED: view_count column not found in projects table';
  END IF;
END $$;
