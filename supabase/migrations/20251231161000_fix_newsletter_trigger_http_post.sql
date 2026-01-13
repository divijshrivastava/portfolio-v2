-- Migration: Fix newsletter send trigger http_post call
-- Description: Corrects pg_net call from extensions.net.http_post (invalid 3-part reference) to extensions.http_post.
-- Date: 2025-12-31

-- Ensure pg_net exists (installed into the `extensions` schema in prior migration)
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Fix trigger function: use extensions.http_post (not extensions.net.http_post)
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

    BEGIN
      PERFORM extensions.http_post(
        url := target_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-newsletter-secret', COALESCE(secret, '')
        ),
        body := payload,
        timeout_milliseconds := 10000
      );
    EXCEPTION WHEN OTHERS THEN
      -- Never block the DB write if the webhook call fails; log a warning instead.
      RAISE WARNING 'Newsletter send trigger http_post failed: %', SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate trigger to ensure it points at the latest function definition
DROP TRIGGER IF EXISTS newsletter_sends_fire_edge_function ON public.newsletter_sends;
CREATE TRIGGER newsletter_sends_fire_edge_function
AFTER INSERT OR UPDATE OF status ON public.newsletter_sends
FOR EACH ROW
EXECUTE FUNCTION public.trigger_send_newsletter();


