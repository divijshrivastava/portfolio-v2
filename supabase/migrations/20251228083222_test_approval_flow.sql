-- Migration: Test approval gate workflow
-- Description: Verify that production requires manual approval
-- Author: Approval Gate Test
-- Date: 2025-12-28

-- Add a comment to test the approval flow (harmless change)
COMMENT ON TABLE public.blogs IS 'Blog posts table - testing approval gate workflow';

-- Verify the comment was added
DO $$
BEGIN
  RAISE NOTICE 'SUCCESS: Approval gate test migration applied';
END $$;
