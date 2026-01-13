-- Migration: Allow anonymous view_count updates via SECURITY DEFINER function
-- Description: Update increment_view_count function to use SECURITY DEFINER so it can bypass RLS
-- Author: Divij Shrivastava
-- Date: 2025-12-30

-- Drop and recreate the function with SECURITY DEFINER
-- This allows the function to run with elevated privileges and bypass RLS
DROP FUNCTION IF EXISTS increment_view_count(TEXT, UUID);

CREATE OR REPLACE FUNCTION increment_view_count(
  p_table_name TEXT,
  p_record_id UUID
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION increment_view_count(TEXT, UUID) TO anon, authenticated;

-- Add comment to document the function
COMMENT ON FUNCTION increment_view_count IS 'Atomically increments view_count for a blog or project record. Uses SECURITY DEFINER to bypass RLS for view_count updates.';

-- Drop the overly permissive policies we created above (they're not needed with SECURITY DEFINER)
DROP POLICY IF EXISTS "Anyone can update blog view_count" ON public.blogs;
DROP POLICY IF EXISTS "Anyone can update project view_count" ON public.projects;

