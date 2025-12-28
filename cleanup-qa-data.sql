-- Clean up QA test data
-- Run this in your QA Supabase SQL Editor

-- ============================================
-- WARNING: This will delete ALL data in QA
-- Only run this on your QA database, NOT production!
-- ============================================

-- Check what will be deleted
SELECT 'Projects' as table_name, COUNT(*) as count FROM public.projects
UNION ALL
SELECT 'Blogs', COUNT(*) FROM public.blogs
UNION ALL
SELECT 'Messages', COUNT(*) FROM public.messages;

-- Uncomment the lines below to actually delete the data:

-- Delete all projects (except those you want to keep)
-- DELETE FROM public.projects;

-- Delete all blogs
-- DELETE FROM public.blogs;

-- Delete all messages
-- DELETE FROM public.messages;

-- Or delete only specific test projects by slug:
-- DELETE FROM public.projects WHERE slug LIKE 'test-%';
-- DELETE FROM public.projects WHERE slug = 'my-project';

-- Reset sequences (optional)
-- This won't affect UUIDs but good practice
-- ALTER SEQUENCE IF EXISTS projects_id_seq RESTART WITH 1;
