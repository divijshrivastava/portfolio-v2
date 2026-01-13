-- Migration: Add view count tracking to resume
-- Description: Track how many times the resume page is viewed
-- Author: Divij Shrivastava
-- Date: 2025-12-28

-- Add view_count column to resume table
ALTER TABLE public.resume
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Add index for potential analytics
CREATE INDEX IF NOT EXISTS resume_view_count_idx
ON public.resume(view_count DESC);

-- Add comment to document the column
COMMENT ON COLUMN public.resume.view_count IS 'Number of times the resume page has been viewed';

-- Verify the change
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'resume'
      AND column_name = 'view_count'
  ) THEN
    RAISE NOTICE 'SUCCESS: view_count column exists in resume table';
  ELSE
    RAISE EXCEPTION 'FAILED: view_count column not found in resume table';
  END IF;
END $$;
