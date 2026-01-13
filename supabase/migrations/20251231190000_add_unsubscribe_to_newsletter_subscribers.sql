-- Migration: Add unsubscribe support to newsletter_subscribers
-- Description: Adds unsubscribe_token + unsubscribed_at, and backfills tokens for existing rows.
-- Date: 2025-12-31

-- Ensure gen_random_uuid() exists
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS unsubscribe_token TEXT,
  ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMP WITH TIME ZONE;

-- Default token for new rows
ALTER TABLE public.newsletter_subscribers
  ALTER COLUMN unsubscribe_token SET DEFAULT gen_random_uuid()::text;

-- Backfill token for existing rows
UPDATE public.newsletter_subscribers
SET unsubscribe_token = gen_random_uuid()::text
WHERE unsubscribe_token IS NULL;

-- Enforce constraints
ALTER TABLE public.newsletter_subscribers
  ALTER COLUMN unsubscribe_token SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_unsubscribe_token_key
  ON public.newsletter_subscribers(unsubscribe_token);

CREATE INDEX IF NOT EXISTS newsletter_subscribers_unsubscribed_at_idx
  ON public.newsletter_subscribers(unsubscribed_at);


