-- Migration: Grant privileges for newsletter tables
-- Description: Ensure authenticated role can access tables; RLS still enforces admin-only access.
-- Author: Divij Shrivastava
-- Date: 2025-12-31

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.newsletters TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.newsletter_sends TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.newsletter_deliveries TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'newsletters'
  ) THEN
    RAISE EXCEPTION 'newsletters table does not exist (apply create table migration first)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'newsletter_sends'
  ) THEN
    RAISE EXCEPTION 'newsletter_sends table does not exist (apply create table migration first)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'newsletter_deliveries'
  ) THEN
    RAISE EXCEPTION 'newsletter_deliveries table does not exist (apply create table migration first)';
  END IF;

  RAISE NOTICE 'SUCCESS: granted privileges on newsletters/newsletter_sends/newsletter_deliveries';
END $$;


