// @ts-ignore Deno imports
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore Deno imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

/**
 * Cron job that runs every minute to check for scheduled newsletters that are due to be sent.
 * For each due newsletter, it updates the status to 'sending' which triggers the send-newsletter function via DB trigger.
 */
serve(async (req: Request) => {
  try {
    console.log('[process-scheduled-newsletters] Starting cron job');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find all scheduled sends where scheduled_for <= now
    const { data: dueSends, error: fetchError } = await supabase
      .from('newsletter_sends')
      .select('id, newsletter_id, scheduled_for')
      .eq('status', 'scheduled')
      .lte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true })
      .limit(100); // Process max 100 at a time

    if (fetchError) {
      console.error('[process-scheduled-newsletters] Failed to fetch due sends:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch scheduled sends', details: fetchError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!dueSends || dueSends.length === 0) {
      console.log('[process-scheduled-newsletters] No sends due at this time');
      return new Response(
        JSON.stringify({ message: 'No scheduled sends due', count: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[process-scheduled-newsletters] Found ${dueSends.length} due sends`);

    const results = [];

    for (const send of dueSends) {
      try {
        console.log(`[process-scheduled-newsletters] Processing send ${send.id} scheduled for ${send.scheduled_for}`);
        
        // Update status to 'sending' and set started_at
        // This will trigger the newsletter_sends_fire_edge_function trigger
        const { error: updateError } = await supabase
          .from('newsletter_sends')
          .update({
            status: 'sending',
            started_at: new Date().toISOString(),
          })
          .eq('id', send.id);

        if (updateError) {
          console.error(`[process-scheduled-newsletters] Failed to update send ${send.id}:`, updateError);
          results.push({ id: send.id, status: 'error', error: updateError.message });
        } else {
          console.log(`[process-scheduled-newsletters] Successfully triggered send ${send.id}`);
          results.push({ id: send.id, status: 'triggered' });
        }
      } catch (err: any) {
        console.error(`[process-scheduled-newsletters] Error processing send ${send.id}:`, err);
        results.push({ id: send.id, status: 'error', error: String(err?.message || err) });
      }
    }

    const successCount = results.filter((r) => r.status === 'triggered').length;
    const errorCount = results.filter((r) => r.status === 'error').length;

    console.log(`[process-scheduled-newsletters] Completed: ${successCount} triggered, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        message: 'Processed scheduled sends',
        total: dueSends.length,
        triggered: successCount,
        errors: errorCount,
        results,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[process-scheduled-newsletters] Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(err?.message || err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

