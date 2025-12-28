-- Migration: Add rate limiting for contact form
-- Description: Create rate_limits table to prevent contact form abuse
-- Author: Divij Shrivastava
-- Date: 2025-12-28

-- Create rate_limits table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  action_type TEXT NOT NULL, -- 'contact_form', 'blog_view', etc.
  attempt_count INTEGER DEFAULT 1,
  first_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ip_address, action_type)
);

-- Enable RLS for rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Policies for rate_limits
-- Only allow service role to manage rate limits
CREATE POLICY "Service role can manage rate limits"
  ON public.rate_limits FOR ALL
  USING (auth.role() = 'service_role');

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS rate_limits_ip_action_idx ON public.rate_limits(ip_address, action_type);
CREATE INDEX IF NOT EXISTS rate_limits_last_attempt_idx ON public.rate_limits(last_attempt_at);

-- Function to clean up old rate limit entries (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE last_attempt_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- Add ip_address field to messages table for tracking
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- Add index for messages by IP
CREATE INDEX IF NOT EXISTS messages_ip_address_idx ON public.messages(ip_address);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at);

-- Verify the changes
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'rate_limits'
  ) THEN
    RAISE NOTICE 'SUCCESS: rate_limits table created';
  ELSE
    RAISE EXCEPTION 'FAILED: rate_limits table not created';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'messages'
      AND column_name = 'ip_address'
  ) THEN
    RAISE NOTICE 'SUCCESS: ip_address column added to messages table';
  ELSE
    RAISE EXCEPTION 'FAILED: ip_address column not added to messages table';
  END IF;
END $$;
