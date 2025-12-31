-- Set up cron job to process scheduled newsletters every minute
-- Run this in your Supabase SQL Editor for QA
-- 
-- This SQL script sets up pg_cron to automatically call the Edge Function every minute

-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP calls (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove existing job if it exists (ignore error if it doesn't exist)
DO $$
BEGIN
  PERFORM cron.unschedule('process-scheduled-newsletters');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Schedule the job to run every minute
-- The function is deployed with --no-verify-jwt so no auth token is needed
SELECT cron.schedule(
  'process-scheduled-newsletters',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://mjprqxxkvvoqkjumqdmd.supabase.co/functions/v1/process-scheduled-newsletters',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  )
  $$
);

-- Verify the job was created
SELECT jobid, jobname, schedule, command, active
FROM cron.job 
WHERE jobname = 'process-scheduled-newsletters';

