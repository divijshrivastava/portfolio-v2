-- Migration: Add newsletter scheduling support
-- Description: Add scheduled_for column and 'scheduled' status for sending newsletters at a future time
-- Author: Divij Shrivastava
-- Date: 2025-12-31

-- Add scheduled_for column to newsletter_sends
ALTER TABLE public.newsletter_sends
  ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP WITH TIME ZONE;

-- Update status check constraint to include 'scheduled'
ALTER TABLE public.newsletter_sends
  DROP CONSTRAINT IF EXISTS newsletter_sends_status_check;

ALTER TABLE public.newsletter_sends
  ADD CONSTRAINT newsletter_sends_status_check
  CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed'));

-- Index for efficiently finding scheduled sends that are ready to process
CREATE INDEX IF NOT EXISTS newsletter_sends_scheduled_for_idx
  ON public.newsletter_sends(scheduled_for)
  WHERE status = 'scheduled' AND scheduled_for IS NOT NULL;

-- Verify the changes
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'newsletter_sends'
      AND column_name = 'scheduled_for'
  ) THEN
    RAISE NOTICE 'SUCCESS: scheduled_for column added to newsletter_sends';
  ELSE
    RAISE EXCEPTION 'FAILED: scheduled_for column not added';
  END IF;
END $$;

