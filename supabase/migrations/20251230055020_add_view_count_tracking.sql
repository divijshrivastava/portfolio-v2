-- Migration: Add view count tracking to blogs and projects
-- Description: Track page visits for blog posts and project detail pages
-- Author: Divij Shrivastava
-- Date: 2025-12-30

-- Add view_count column to blogs table
ALTER TABLE public.blogs
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0 NOT NULL;

-- Add view_count column to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0 NOT NULL;

-- Add index for potential sorting by popularity (blogs)
CREATE INDEX IF NOT EXISTS blogs_view_count_idx
ON public.blogs(view_count DESC);

-- Add index for potential sorting by popularity (projects)
CREATE INDEX IF NOT EXISTS projects_view_count_idx
ON public.projects(view_count DESC);

-- Add comments to document the columns
COMMENT ON COLUMN public.blogs.view_count IS 'Number of times this blog post page has been viewed';
COMMENT ON COLUMN public.projects.view_count IS 'Number of times this project detail page has been viewed';

-- Create a function for atomic view count increment
-- This ensures thread-safe increments even under high concurrency
CREATE OR REPLACE FUNCTION increment_view_count(
  p_table_name TEXT,
  p_record_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_new_count INTEGER;
BEGIN
  IF p_table_name = 'blogs' THEN
    UPDATE public.blogs
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = p_record_id
    RETURNING view_count INTO v_new_count;
  ELSIF p_table_name = 'projects' THEN
    UPDATE public.projects
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = p_record_id
    RETURNING view_count INTO v_new_count;
  ELSE
    RAISE EXCEPTION 'Invalid table name: %', p_table_name;
  END IF;
  
  RETURN COALESCE(v_new_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Add comment to document the function
COMMENT ON FUNCTION increment_view_count IS 'Atomically increments view_count for a blog or project record';

-- Verify the changes
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'blogs'
      AND column_name = 'view_count'
  ) THEN
    RAISE NOTICE 'SUCCESS: view_count column exists in blogs table';
  ELSE
    RAISE EXCEPTION 'FAILED: view_count column not found in blogs table';
  END IF;

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

