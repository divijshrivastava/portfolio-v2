-- Migration: Add public archive support for newsletters
-- Description: Allow newsletters to be shown in a public archive
-- Author: Divij Shrivastava
-- Date: 2025-12-31

-- Add is_public column to newsletters table
ALTER TABLE public.newsletters
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Add index for efficiently querying public newsletters
CREATE INDEX IF NOT EXISTS newsletters_is_public_idx 
  ON public.newsletters(is_public, published_at DESC) 
  WHERE is_public = true AND status = 'published';

-- Create RLS policy for public access to published newsletters
DROP POLICY IF EXISTS "Public can view published newsletters" ON public.newsletters;

CREATE POLICY "Public can view published newsletters"
  ON public.newsletters
  FOR SELECT
  USING (
    is_public = true 
    AND status = 'published'
  );

-- Verify the changes
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'newsletters'
      AND column_name = 'is_public'
  ) THEN
    RAISE NOTICE 'SUCCESS: is_public column added to newsletters';
  ELSE
    RAISE EXCEPTION 'FAILED: is_public column not added';
  END IF;
END $$;

