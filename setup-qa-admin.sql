-- Quick setup script for QA Admin user
-- Run this in your QA Supabase SQL Editor

-- First, make sure you have created an auth user via Supabase Auth UI
-- Then run this script, replacing the email with your actual admin email

-- Update the profile to set is_admin = true
-- REPLACE 'your-email@example.com' with your actual email
UPDATE public.profiles
SET is_admin = true
WHERE email = 'divij.shrivastava@gmail.com';

-- If the profile doesn't exist, this won't work
-- In that case, you need to first create the user via Supabase Auth UI
-- Then sign in once to create the profile
-- Then run this UPDATE query

-- Verify the admin user
SELECT id, email, is_admin, created_at
FROM public.profiles
WHERE email = 'divij.shrivastava@gmail.com';
