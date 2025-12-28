-- Migration: Test production approval gate
-- Description: Adds approval_test column to verify manual approval requirement
-- Author: Approval Gate Test
-- Date: 2025-12-28

-- Add test column to blogs table (different table to avoid conflicts)
ALTER TABLE public.blogs
ADD COLUMN IF NOT EXISTS approval_gate_test BOOLEAN DEFAULT true;

-- Add comment to document the test
COMMENT ON COLUMN public.blogs.approval_gate_test IS 'Test column to verify production approval gate works correctly';

-- Verify the change
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'blogs'
      AND column_name = 'approval_gate_test'
  ) THEN
    RAISE NOTICE 'SUCCESS: approval_gate_test column exists in blogs table';
  ELSE
    RAISE EXCEPTION 'FAILED: approval_gate_test column not found in blogs table';
  END IF;
END $$;
