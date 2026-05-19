-- Stop the DB-side newsletter scheduler from generating pg_cron/pg_net churn.
-- Scheduled newsletter processing should be run outside Postgres, for example
-- by Supabase Scheduled Functions or Vercel Cron calling the Edge Function.

DO $$
BEGIN
  PERFORM cron.unschedule('process-scheduled-newsletters');
EXCEPTION
  WHEN undefined_function OR undefined_table THEN
    NULL;
  WHEN OTHERS THEN
    IF SQLERRM NOT ILIKE '%does not exist%' THEN
      RAISE;
    END IF;
END $$;

DO $$
BEGIN
  DELETE FROM cron.job_run_details
  WHERE jobid IN (
    SELECT jobid
    FROM cron.job
    WHERE jobname = 'process-scheduled-newsletters'
  )
  AND start_time < now() - interval '7 days';
EXCEPTION
  WHEN insufficient_privilege OR undefined_table THEN
    RAISE NOTICE 'Skipping cron.job_run_details cleanup: %', SQLERRM;
END $$;

DO $$
BEGIN
  DELETE FROM net._http_response
  WHERE created < now() - interval '7 days';
EXCEPTION
  WHEN insufficient_privilege OR undefined_table THEN
    RAISE NOTICE 'Skipping net._http_response cleanup: %', SQLERRM;
END $$;
