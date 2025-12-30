-- Migration: Add newsletters + sending history
-- Description: Create tables for composing newsletters, sending to audiences, and logging deliveries
-- Author: Divij Shrivastava
-- Date: 2025-12-31

-- Newsletters (draft/published content)
CREATE TABLE IF NOT EXISTS public.newsletters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  preview_text TEXT,
  body_html TEXT NOT NULL,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{ type: 'blog'|'project'|'link', title, url, slug, id }]
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Newsletter send runs (one newsletter can be sent multiple times)
CREATE TABLE IF NOT EXISTS public.newsletter_sends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  newsletter_id UUID NOT NULL REFERENCES public.newsletters(id) ON DELETE CASCADE,
  audience JSONB NOT NULL, -- { type: 'all'|'source'|'manual', source?: string, emails?: string[] }
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent', 'failed')),
  sent_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  total_recipients INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0
);

-- Delivery logs (who received what, when, and provider status)
CREATE TABLE IF NOT EXISTS public.newsletter_deliveries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  send_id UUID NOT NULL REFERENCES public.newsletter_sends(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES public.newsletter_subscribers(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  provider TEXT,
  provider_message_id TEXT,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (send_id, email)
);

-- Updated at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS newsletters_set_updated_at ON public.newsletters;
CREATE TRIGGER newsletters_set_updated_at
BEFORE UPDATE ON public.newsletters
FOR EACH ROW
EXECUTE PROCEDURE public.set_updated_at();

-- RLS
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_deliveries ENABLE ROW LEVEL SECURITY;

-- Policies: admins only (via profiles.is_admin)
CREATE POLICY "Admins can manage newsletters"
  ON public.newsletters FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can manage newsletter sends"
  ON public.newsletter_sends FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can manage newsletter deliveries"
  ON public.newsletter_deliveries FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

-- Indexes
CREATE INDEX IF NOT EXISTS newsletters_created_at_idx ON public.newsletters(created_at DESC);
CREATE INDEX IF NOT EXISTS newsletter_sends_created_at_idx ON public.newsletter_sends(created_at DESC);
CREATE INDEX IF NOT EXISTS newsletter_deliveries_send_id_idx ON public.newsletter_deliveries(send_id);
CREATE INDEX IF NOT EXISTS newsletter_deliveries_email_idx ON public.newsletter_deliveries(email);

-- Verify the changes
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'newsletters'
  ) THEN
    RAISE NOTICE 'SUCCESS: newsletters table created';
  ELSE
    RAISE EXCEPTION 'FAILED: newsletters table not created';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'newsletter_sends'
  ) THEN
    RAISE NOTICE 'SUCCESS: newsletter_sends table created';
  ELSE
    RAISE EXCEPTION 'FAILED: newsletter_sends table not created';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'newsletter_deliveries'
  ) THEN
    RAISE NOTICE 'SUCCESS: newsletter_deliveries table created';
  ELSE
    RAISE EXCEPTION 'FAILED: newsletter_deliveries table not created';
  END IF;
END $$;


