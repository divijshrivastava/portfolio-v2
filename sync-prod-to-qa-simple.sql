-- ============================================
-- SIMPLE PRODUCTION → QA SYNC
-- ============================================
--
-- INSTRUCTIONS:
-- 1. Run PART 1 in PRODUCTION Supabase SQL Editor
-- 2. Copy the JSON results
-- 3. Run PART 2 in QA Supabase SQL Editor
--    (replace the placeholder JSON with your copied data)
--
-- ============================================

-- ============================================
-- PART 1: RUN THIS IN PRODUCTION
-- ============================================

-- Get all projects
SELECT json_agg(t) as projects_json
FROM (
  SELECT * FROM public.projects
  ORDER BY created_at DESC
) t;

-- Copy the result, then run next query

-- Get all blogs
SELECT json_agg(t) as blogs_json
FROM (
  SELECT * FROM public.blogs
  ORDER BY created_at DESC
) t;

-- Copy the result, then run next query

-- Get all messages
SELECT json_agg(t) as messages_json
FROM (
  SELECT * FROM public.messages
  ORDER BY created_at DESC
) t;

-- ============================================
-- PART 2: RUN THIS IN QA
-- Replace the JSON placeholders with your data
-- ============================================

-- Backup: Save current counts before clearing
SELECT
  'BEFORE SYNC' as status,
  (SELECT COUNT(*) FROM public.projects) as projects_count,
  (SELECT COUNT(*) FROM public.blogs) as blogs_count,
  (SELECT COUNT(*) FROM public.messages) as messages_count;

-- Temporarily disable RLS
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

-- Clear QA data
TRUNCATE TABLE public.projects CASCADE;
TRUNCATE TABLE public.blogs CASCADE;
TRUNCATE TABLE public.messages CASCADE;

-- ============================================
-- REPLACE THE JSON BELOW WITH YOUR DATA
-- ============================================

-- Import projects
-- Replace [...] with the projects_json from PART 1
DO $$
DECLARE
  projects_data json := '[...]'::json;  -- REPLACE THIS
BEGIN
  IF projects_data IS NOT NULL AND projects_data::text != '[...]' THEN
    INSERT INTO public.projects
    SELECT * FROM json_populate_recordset(NULL::public.projects, projects_data);
    RAISE NOTICE 'Imported % projects', json_array_length(projects_data);
  ELSE
    RAISE NOTICE 'No projects data provided - skipped';
  END IF;
END $$;

-- Import blogs
-- Replace [...] with the blogs_json from PART 1
DO $$
DECLARE
  blogs_data json := '[...]'::json;  -- REPLACE THIS
BEGIN
  IF blogs_data IS NOT NULL AND blogs_data::text != '[...]' THEN
    INSERT INTO public.blogs
    SELECT * FROM json_populate_recordset(NULL::public.blogs, blogs_data);
    RAISE NOTICE 'Imported % blogs', json_array_length(blogs_data);
  ELSE
    RAISE NOTICE 'No blogs data provided - skipped';
  END IF;
END $$;

-- Import messages
-- Replace [...] with the messages_json from PART 1
DO $$
DECLARE
  messages_data json := '[...]'::json;  -- REPLACE THIS
BEGIN
  IF messages_data IS NOT NULL AND messages_data::text != '[...]' THEN
    INSERT INTO public.messages
    SELECT * FROM json_populate_recordset(NULL::public.messages, messages_data);
    RAISE NOTICE 'Imported % messages', json_array_length(messages_data);
  ELSE
    RAISE NOTICE 'No messages data provided - skipped';
  END IF;
END $$;

-- Re-enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Verify sync
SELECT
  'AFTER SYNC' as status,
  (SELECT COUNT(*) FROM public.projects) as projects_count,
  (SELECT COUNT(*) FROM public.blogs) as blogs_count,
  (SELECT COUNT(*) FROM public.messages) as messages_count;

-- Show sample data
SELECT 'Projects' as table_name, title, created_at
FROM public.projects
ORDER BY created_at DESC
LIMIT 5;

SELECT 'Blogs' as table_name, title, created_at
FROM public.blogs
ORDER BY created_at DESC
LIMIT 5;
