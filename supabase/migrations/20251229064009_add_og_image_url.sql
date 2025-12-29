-- Migration: Add og_image_url field for optimized social media previews
-- Description: Adds og_image_url column to projects and blogs tables to store optimized 1200x630 WebP images for social media previews
-- Author: Divij Shrivastava
-- Date: 2025-12-29

-- Add og_image_url to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS og_image_url TEXT;

-- Add og_image_url to blogs table
ALTER TABLE public.blogs 
ADD COLUMN IF NOT EXISTS og_image_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.projects.og_image_url IS 'Optimized Open Graph image URL (1200x630 WebP) for social media previews. Automatically generated when project is published with an image.';
COMMENT ON COLUMN public.blogs.og_image_url IS 'Optimized Open Graph image URL (1200x630 WebP) for social media previews. Automatically generated when blog is published with a cover image.';

-- Verify the changes
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'projects'
      AND column_name = 'og_image_url'
  ) THEN
    RAISE NOTICE 'SUCCESS: og_image_url column exists in projects table';
  ELSE
    RAISE EXCEPTION 'FAILED: og_image_url column not found in projects table';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'blogs'
      AND column_name = 'og_image_url'
  ) THEN
    RAISE NOTICE 'SUCCESS: og_image_url column exists in blogs table';
  ELSE
    RAISE EXCEPTION 'FAILED: og_image_url column not found in blogs table';
  END IF;
END $$;

