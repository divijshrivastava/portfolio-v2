-- Migration: Make newsletter send trigger pg_net schema-agnostic
-- Description: Calls pg_net http_post from either `net` schema (default) or `extensions` schema (if installed there).
-- Date: 2025-12-31

CREATE OR REPLACE FUNCTION public.trigger_send_newsletter()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  base_url TEXT;
  secret TEXT;
  target_url TEXT;
  payload JSONB;
  has_net_http_post BOOLEAN;
  has_extensions_http_post BOOLEAN;
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

    -- Detect pg_net function location
    SELECT EXISTS (
      SELECT 1
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'net' AND p.proname = 'http_post'
    ) INTO has_net_http_post;

    SELECT EXISTS (
      SELECT 1
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'extensions' AND p.proname = 'http_post'
    ) INTO has_extensions_http_post;

    BEGIN
      IF has_net_http_post THEN
        PERFORM net.http_post(
          url := target_url,
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-newsletter-secret', COALESCE(secret, '')
          ),
          body := payload,
          timeout_milliseconds := 10000
        );
      ELSIF has_extensions_http_post THEN
        PERFORM extensions.http_post(
          url := target_url,
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-newsletter-secret', COALESCE(secret, '')
          ),
          body := payload,
          timeout_milliseconds := 10000
        );
      ELSE
        RAISE WARNING 'pg_net http_post not found in schemas net/extensions; skipping webhook call';
      END IF;
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


