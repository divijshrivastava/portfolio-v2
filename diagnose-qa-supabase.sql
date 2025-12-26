-- Diagnostic script for QA Supabase
-- Run this in SQL Editor to see what's set up

-- 1. Check if profiles table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'profiles'
) as profiles_table_exists;

-- 2. Check if any auth users exist
SELECT COUNT(*) as auth_users_count
FROM auth.users;

-- 3. Check if any profiles exist
SELECT COUNT(*) as profiles_count
FROM public.profiles;

-- 4. Check if any admin users exist
SELECT email, is_admin, created_at
FROM public.profiles
WHERE is_admin = true;

-- 5. List all auth users
SELECT id, email, created_at, confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- 6. List all profiles
SELECT id, email, is_admin, created_at
FROM public.profiles
ORDER BY created_at DESC;
