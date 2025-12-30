'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { headers } from 'next/headers';

const RATE_LIMIT_CONFIG = {
  COOLDOWN_SECONDS: 30, // keep UX snappy, but reduce accidental spam/double-clicks
  MAX_DAILY_ATTEMPTS: 50, // hard cap per IP per 24h
};

export interface NewsletterSubscribeInput {
  email: string;
  source?: string;
}

interface RateLimitResult {
  allowed: boolean;
  error?: string;
  waitTime?: number; // seconds
}

async function getClientIP(): Promise<string> {
  const headersList = await headers();

  const ipHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip',
    'x-client-ip',
    'x-cluster-client-ip',
  ];

  for (const header of ipHeaders) {
    const value = headersList.get(header);
    if (value) return value.split(',')[0].trim();
  }

  return 'unknown';
}

async function checkRateLimit(ipAddress: string): Promise<RateLimitResult> {
  const supabase = createAdminClient();
  const now = new Date();

  // Daily cap
  const { count } = await supabase
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ipAddress)
    .eq('action_type', 'newsletter_subscribe')
    .gte('first_attempt_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString());

  if (count && count >= 1) {
    // Use the single rate limit row to enforce cooldown + daily attempts
    const { data: rl } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('ip_address', ipAddress)
      .eq('action_type', 'newsletter_subscribe')
      .single();

    if (rl) {
      if (rl.attempt_count >= RATE_LIMIT_CONFIG.MAX_DAILY_ATTEMPTS) {
        return {
          allowed: false,
          error: `Too many subscription attempts from your network today. Please try again tomorrow.`,
          waitTime: 3600,
        };
      }

      const lastAttempt = new Date(rl.last_attempt_at);
      const secondsSinceLast = (now.getTime() - lastAttempt.getTime()) / 1000;
      if (secondsSinceLast < RATE_LIMIT_CONFIG.COOLDOWN_SECONDS) {
        const waitTime = Math.ceil(RATE_LIMIT_CONFIG.COOLDOWN_SECONDS - secondsSinceLast);
        return {
          allowed: false,
          error: `Please wait ${waitTime}s before trying again.`,
          waitTime,
        };
      }
    }
  }

  return { allowed: true };
}

async function updateRateLimit(ipAddress: string): Promise<void> {
  const supabase = createAdminClient();
  const now = new Date();

  const { data: existing, error: fetchError } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('ip_address', ipAddress)
    .eq('action_type', 'newsletter_subscribe')
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('[Newsletter Rate Limit] Error fetching rate limit:', fetchError);
  }

  if (!existing) {
    const { error: insertError } = await supabase.from('rate_limits').insert({
      ip_address: ipAddress,
      action_type: 'newsletter_subscribe',
      attempt_count: 1,
      first_attempt_at: now.toISOString(),
      last_attempt_at: now.toISOString(),
    });

    if (insertError) {
      console.error('[Newsletter Rate Limit] Error creating rate limit record:', insertError);
      throw new Error(`Failed to create rate limit: ${insertError.message}`);
    }

    return;
  }

  const firstAttempt = new Date(existing.first_attempt_at);
  const hoursSinceFirstAttempt = (now.getTime() - firstAttempt.getTime()) / (1000 * 60 * 60);

  if (hoursSinceFirstAttempt >= 24) {
    await supabase
      .from('rate_limits')
      .update({
        attempt_count: 1,
        first_attempt_at: now.toISOString(),
        last_attempt_at: now.toISOString(),
      })
      .eq('ip_address', ipAddress)
      .eq('action_type', 'newsletter_subscribe');
  } else {
    await supabase
      .from('rate_limits')
      .update({
        attempt_count: existing.attempt_count + 1,
        last_attempt_at: now.toISOString(),
      })
      .eq('ip_address', ipAddress)
      .eq('action_type', 'newsletter_subscribe');
  }
}

export async function subscribeToNewsletter(input: NewsletterSubscribeInput) {
  try {
    const email = (input.email || '').trim().toLowerCase();
    const source = (input.source || '').trim().slice(0, 64) || null;

    if (!email) {
      return { success: false, error: 'Email is required.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const ipAddress = await getClientIP();

    const rateLimitCheck = await checkRateLimit(ipAddress);
    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        error: rateLimitCheck.error,
        rateLimited: true,
        waitTime: rateLimitCheck.waitTime,
      };
    }

    const supabase = createAdminClient();

    const { error } = await supabase.from('newsletter_subscribers').insert({
      email,
      ip_address: ipAddress,
      source,
    });

    // Unique violation -> treat as success (already subscribed)
    if (error) {
      if (error.code === '23505') {
        try {
          await updateRateLimit(ipAddress);
        } catch (rateLimitError: any) {
          console.error('Newsletter rate limit update failed:', rateLimitError);
        }

        return { success: true, message: `You're already subscribed.` };
      }

      console.error('Error inserting newsletter subscriber:', error);
      return { success: false, error: 'Failed to subscribe. Please try again.' };
    }

    try {
      await updateRateLimit(ipAddress);
    } catch (rateLimitError: any) {
      console.error('Newsletter rate limit update failed:', rateLimitError);
    }

    return { success: true, message: 'Subscribed! You’ll hear from me soon.' };
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}


