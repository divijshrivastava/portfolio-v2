-- Migration: App settings + newsletter send trigger (Edge Function)
-- Description: Adds a small settings table and a trigger that calls the send-newsletter Edge Function when a send run starts.
-- Author: Divij Shrivastava
-- Date: 2025-12-31

-- Enable pg_net for HTTP calls from Postgres triggers
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Settings table for storing runtime config (e.g., edge base URL + secrets)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write settings via the API.
CREATE POLICY "Admins can manage app settings"
  ON public.app_settings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

-- Helper: get a setting value inside SQL/trigger context
CREATE OR REPLACE FUNCTION public.get_app_setting(setting_key TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT value FROM public.app_settings WHERE key = setting_key
$$;

-- Trigger function: call Edge Function when a send moves to 'sending'
CREATE OR REPLACE FUNCTION public.trigger_send_newsletter()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  base_url TEXT;
  secret TEXT;
  target_url TEXT;
  payload JSONB;
BEGIN
  -- Only fire when status becomes 'sending'
  IF (TG_OP = 'INSERT' AND NEW.status = 'sending')
     OR (TG_OP = 'UPDATE' AND NEW.status = 'sending' AND (OLD.status IS DISTINCT FROM NEW.status)) THEN

    base_url := public.get_app_setting('SUPABASE_FUNCTIONS_BASE_URL');
    secret := public.get_app_setting('NEWSLETTER_WEBHOOK_SECRET');

    IF base_url IS NULL OR base_url = '' THEN
      RAISE WARNING 'SUPABASE_FUNCTIONS_BASE_URL not set in app_settings; skipping newsletter send trigger';
      RETURN NEW;
    END IF;

    target_url := rtrim(base_url, '/') || '/send-newsletter';
    payload := jsonb_build_object('send_id', NEW.id);

    PERFORM extensions.net.http_post(
      url := target_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-newsletter-secret', COALESCE(secret, '')
      ),
      body := payload,
      timeout_milliseconds := 10000
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS newsletter_sends_fire_edge_function ON public.newsletter_sends;
CREATE TRIGGER newsletter_sends_fire_edge_function
AFTER INSERT OR UPDATE OF status ON public.newsletter_sends
FOR EACH ROW
EXECUTE FUNCTION public.trigger_send_newsletter();

-- Verify
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'app_settings'
  ) THEN
    RAISE NOTICE 'SUCCESS: app_settings table created';
  ELSE
    RAISE EXCEPTION 'FAILED: app_settings table not created';
  END IF;
END $$;


