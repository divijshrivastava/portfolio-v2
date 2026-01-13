-- Migration: Add newsletter subscribers
-- Description: Create newsletter_subscribers table for email signups
-- Author: Divij Shrivastava
-- Date: 2025-12-31

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address TEXT,
  source TEXT, -- 'footer', 'homepage', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (email)
);

-- Enable RLS for newsletter_subscribers
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policies for newsletter_subscribers
-- Allow anyone to subscribe (insert only)
CREATE POLICY "Anyone can insert newsletter subscribers"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Admins can view subscribers
CREATE POLICY "Admins can view newsletter subscribers"
  ON public.newsletter_subscribers FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

-- Admins can update subscribers
CREATE POLICY "Admins can update newsletter subscribers"
  ON public.newsletter_subscribers FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

-- Admins can delete subscribers
CREATE POLICY "Admins can delete newsletter subscribers"
  ON public.newsletter_subscribers FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

-- Indexes for common access patterns
CREATE INDEX IF NOT EXISTS newsletter_subscribers_created_at_idx
  ON public.newsletter_subscribers(created_at DESC);

CREATE INDEX IF NOT EXISTS newsletter_subscribers_ip_address_idx
  ON public.newsletter_subscribers(ip_address);

-- Verify the changes
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'newsletter_subscribers'
  ) THEN
    RAISE NOTICE 'SUCCESS: newsletter_subscribers table created';
  ELSE
    RAISE EXCEPTION 'FAILED: newsletter_subscribers table not created';
  END IF;
END $$;


