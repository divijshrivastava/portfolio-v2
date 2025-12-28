-- Complete QA Setup Script
-- Run this in your QA Supabase SQL Editor

-- ============================================
-- STEP 1: Check Current State
-- ============================================

-- Check if tables exist
SELECT
  CASE
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles')
    THEN '✅ profiles table exists'
    ELSE '❌ profiles table missing - need to run schema'
  END as profiles_status,
  CASE
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'blogs')
    THEN '✅ blogs table exists'
    ELSE '❌ blogs table missing - need to run schema'
  END as blogs_status;

-- Check existing users
SELECT
  id,
  email,
  created_at,
  confirmed_at,
  CASE WHEN confirmed_at IS NOT NULL THEN '✅ Confirmed' ELSE '❌ Not Confirmed' END as status
FROM auth.users
ORDER BY created_at DESC;

-- Check existing profiles (if table exists)
SELECT
  email,
  is_admin,
  CASE WHEN is_admin = true THEN '✅ Admin' ELSE '❌ Not Admin' END as admin_status,
  created_at
FROM public.profiles
ORDER BY created_at DESC;

-- ============================================
-- STEP 2: Create Admin User (if needed)
-- ============================================

-- If you don't have a user yet, you need to:
-- 1. Go to Authentication → Users in Supabase dashboard
-- 2. Click "Add user"
-- 3. Enter your email and password
-- 4. Enable "Auto Confirm User"
-- 5. Click "Create user"
-- 6. Then come back and run the next steps

-- ============================================
-- STEP 3: Create/Update Profile for Admin
-- ============================================

-- Replace 'YOUR_EMAIL_HERE' with your actual email
DO $$
DECLARE
  user_id UUID;
  user_email TEXT := 'divij.shrivastava@gmail.com'; -- CHANGE THIS TO YOUR EMAIL
BEGIN
  -- Get user ID from auth.users
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email;

  IF user_id IS NULL THEN
    RAISE NOTICE '❌ User not found with email: %', user_email;
    RAISE NOTICE 'Please create the user first in Authentication → Users';
  ELSE
    -- Insert or update profile
    INSERT INTO public.profiles (id, email, is_admin, created_at, updated_at)
    VALUES (user_id, user_email, true, NOW(), NOW())
    ON CONFLICT (id)
    DO UPDATE SET
      is_admin = true,
      updated_at = NOW();

    RAISE NOTICE '✅ Admin profile created/updated for: %', user_email;
  END IF;
END $$;

-- ============================================
-- STEP 4: Verify Setup
-- ============================================

-- Check admin users
SELECT
  p.email,
  p.is_admin,
  u.confirmed_at,
  CASE
    WHEN p.is_admin = true AND u.confirmed_at IS NOT NULL THEN '✅ Ready to login'
    WHEN p.is_admin = true AND u.confirmed_at IS NULL THEN '⚠️ Admin but not confirmed'
    ELSE '❌ Not admin'
  END as login_status
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.is_admin = true;

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- If login still doesn't work, check:
-- 1. Is the user confirmed? (confirmed_at should not be NULL)
-- 2. Does the profile exist with is_admin = true?
-- 3. Are you using the correct email and password?

-- To manually confirm a user (if auto-confirm didn't work):
-- UPDATE auth.users
-- SET confirmed_at = NOW(), email_confirmed_at = NOW()
-- WHERE email = 'divij.shrivastava@gmail.com';
