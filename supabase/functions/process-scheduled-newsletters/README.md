# Process Scheduled Newsletters - Cron Job Setup

This Edge Function processes scheduled newsletters by checking every minute for newsletters that are due to be sent.

## How it works

1. Queries `newsletter_sends` table for rows where:
   - `status = 'scheduled'`
   - `scheduled_for <= NOW()`
2. For each due send, updates status to `'sending'` and sets `started_at`
3. The DB trigger (`newsletter_sends_fire_edge_function`) automatically calls the `send-newsletter` function

## Setup Instructions

After deploying this function, you need to configure it to run on a schedule.

### Using Supabase CLI

```bash
supabase functions schedule process-scheduled-newsletters --cron "* * * * *"
```

This sets it to run every minute.

### Using Supabase Dashboard

1. Go to **Edge Functions** in your Supabase project dashboard
2. Click on `process-scheduled-newsletters`
3. Go to the **Settings** tab
4. Enable **Cron Jobs**
5. Set the cron expression: `* * * * *` (runs every minute)
6. Save

### Alternative: Using pg_cron (Advanced)

If you prefer using PostgreSQL's built-in pg_cron extension:

```sql
-- Enable pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the job (runs every minute)
SELECT cron.schedule(
  'process-scheduled-newsletters',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-scheduled-newsletters',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  )
  $$
);
```

Replace `YOUR_PROJECT_REF` and `YOUR_SERVICE_ROLE_KEY` with your actual values.

## Monitoring

Check the Edge Function logs in your Supabase dashboard to monitor:
- How many scheduled sends are being processed
- Any errors during processing
- Timing of cron job executions

## Testing

You can manually trigger the function to test it:

```bash
curl -X POST \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-scheduled-newsletters \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

