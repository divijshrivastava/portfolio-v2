-- Migration: Set up pg_cron job for processing scheduled newsletters
-- Description: Automatically calls process-scheduled-newsletters Edge Function every minute
-- Author: Divij Shrivastava
-- Date: 2025-12-31

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove existing job if it exists (ignore error if it doesn't exist)
DO $$
BEGIN
  PERFORM cron.unschedule('process-scheduled-newsletters');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Schedule the job to run every minute
-- This will call the Edge Function which processes any due scheduled newsletters
DO $$
DECLARE
  functions_base_url TEXT;
BEGIN
  -- Get the Supabase Functions base URL from app_settings
  SELECT value INTO functions_base_url 
  FROM public.app_settings 
  WHERE key = 'SUPABASE_FUNCTIONS_BASE_URL'
  LIMIT 1;
  
  IF functions_base_url IS NULL OR functions_base_url = '' THEN
    RAISE WARNING 'SUPABASE_FUNCTIONS_BASE_URL not set in app_settings. Newsletter cron job NOT created.';
    RAISE WARNING 'Please set it via: INSERT INTO app_settings (key, value) VALUES (''SUPABASE_FUNCTIONS_BASE_URL'', ''https://YOUR-PROJECT-REF.supabase.co/functions/v1'');';
    RETURN;
  END IF;

  -- Remove trailing slash if present
  functions_base_url := rtrim(functions_base_url, '/');

  -- Schedule the cron job
  PERFORM cron.schedule(
    'process-scheduled-newsletters',
    '* * * * *',
    format(
      'SELECT net.http_post(url := %L, headers := %L::jsonb, body := %L::jsonb)',
      functions_base_url || '/process-scheduled-newsletters',
      '{"Content-Type": "application/json"}',
      '{}'
    )
  );
  
  RAISE NOTICE 'SUCCESS: Newsletter cron job created for URL: %', functions_base_url || '/process-scheduled-newsletters';
END $$;

-- Verify the job was created
DO $$
DECLARE
  job_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO job_count
  FROM cron.job 
  WHERE jobname = 'process-scheduled-newsletters' AND active = true;
  
  IF job_count > 0 THEN
    RAISE NOTICE 'SUCCESS: Newsletter cron job is active';
  ELSE
    RAISE WARNING 'FAILED: Newsletter cron job was not created';
  END IF;
END $$;

