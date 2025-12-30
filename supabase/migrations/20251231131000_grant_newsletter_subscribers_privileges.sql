-- Migration: Grant privileges for newsletter_subscribers
-- Description: Ensure anon/authenticated roles have required privileges; RLS still enforces access.
-- Author: Divij Shrivastava
-- Date: 2025-12-31

-- Allow public schema usage (usually already granted, but safe)
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Table privileges (RLS policies still apply)
GRANT SELECT, INSERT ON TABLE public.newsletter_subscribers TO anon, authenticated;
GRANT UPDATE, DELETE ON TABLE public.newsletter_subscribers TO authenticated;

-- Verify grants exist (best-effort; will raise if table missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'newsletter_subscribers'
  ) THEN
    RAISE EXCEPTION 'newsletter_subscribers table does not exist (apply create table migration first)';
  END IF;

  RAISE NOTICE 'SUCCESS: granted privileges on newsletter_subscribers';
END $$;


