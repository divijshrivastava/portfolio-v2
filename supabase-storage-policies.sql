-- Supabase Storage Policies for Portfolio V2
-- Run this in your Supabase SQL Editor after creating the storage buckets
-- Make sure you've created these buckets in Storage:
-- 1. blog-images (public)
-- 2. project-images (public)
-- 3. resume-files (public)
-- 4. uploads (public)

-- ============================================
-- BLOG-IMAGES BUCKET POLICIES
-- ============================================

-- Allow authenticated users (admins) to upload images
CREATE POLICY "Admins can upload blog images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Allow public to read blog images
CREATE POLICY "Public can read blog images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- Allow admins to update blog images
CREATE POLICY "Admins can update blog images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Allow admins to delete blog images
CREATE POLICY "Admins can delete blog images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- ============================================
-- PROJECT-IMAGES BUCKET POLICIES
-- ============================================

-- Allow authenticated users (admins) to upload images
CREATE POLICY "Admins can upload project images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Allow public to read project images
CREATE POLICY "Public can read project images"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-images');

-- Allow admins to update project images
CREATE POLICY "Admins can update project images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'project-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Allow admins to delete project images
CREATE POLICY "Admins can delete project images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- ============================================
-- RESUME-FILES BUCKET POLICIES
-- ============================================

-- Allow authenticated users (admins) to upload resume files
CREATE POLICY "Admins can upload resume files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resume-files' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Allow public to read resume files
CREATE POLICY "Public can read resume files"
ON storage.objects FOR SELECT
USING (bucket_id = 'resume-files');

-- Allow admins to update resume files
CREATE POLICY "Admins can update resume files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'resume-files' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Allow admins to delete resume files
CREATE POLICY "Admins can delete resume files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'resume-files' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- ============================================
-- UPLOADS BUCKET POLICIES (for misc uploads)
-- ============================================

-- Allow authenticated users (admins) to upload files
CREATE POLICY "Admins can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'uploads' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Allow public to read uploaded files
CREATE POLICY "Public can read uploaded files"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads');

-- Allow admins to update uploaded files
CREATE POLICY "Admins can update uploaded files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'uploads' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Allow admins to delete uploaded files
CREATE POLICY "Admins can delete uploaded files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'uploads' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

