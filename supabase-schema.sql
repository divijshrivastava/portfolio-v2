-- Supabase Database Schema for Portfolio V2
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users/admin table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create blogs table
CREATE TABLE IF NOT EXISTS public.blogs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  read_time INTEGER, -- in minutes
  views INTEGER DEFAULT 0,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for blogs
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Policies for blogs
CREATE POLICY "Published blogs are viewable by everyone"
  ON public.blogs FOR SELECT
  USING (status = 'published' OR auth.uid() = author_id);

CREATE POLICY "Admins can insert blogs"
  ON public.blogs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can update blogs"
  ON public.blogs FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can delete blogs"
  ON public.blogs FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

-- Create index for blog queries
CREATE INDEX IF NOT EXISTS blogs_status_idx ON public.blogs(status);
CREATE INDEX IF NOT EXISTS blogs_created_at_idx ON public.blogs(created_at DESC);
CREATE INDEX IF NOT EXISTS blogs_slug_idx ON public.blogs(slug);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  project_url TEXT,
  youtube_url TEXT,
  github_url TEXT,
  project_type TEXT CHECK (project_type IN ('website', 'youtube', 'coding', 'other')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  tags TEXT[], -- Array of tags
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policies for projects
CREATE POLICY "Published projects are viewable by everyone"
  ON public.projects FOR SELECT
  USING (status = 'published' OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can insert projects"
  ON public.projects FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can update projects"
  ON public.projects FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can delete projects"
  ON public.projects FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

-- Create index for projects
CREATE INDEX IF NOT EXISTS projects_status_idx ON public.projects(status);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON public.projects(created_at DESC);

-- Create messages table (from contact form)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies for messages
CREATE POLICY "Anyone can insert messages"
  ON public.messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all messages"
  ON public.messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can update messages"
  ON public.messages FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can delete messages"
  ON public.messages FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

-- Create user activity table (IP tracking)
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ip_address TEXT,
  user_agent TEXT,
  page_visited TEXT,
  referrer TEXT,
  country TEXT,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for user_activity
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Policies for user_activity
CREATE POLICY "Anyone can insert activity"
  ON public.user_activity FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view activity"
  ON public.user_activity FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

-- Create index for activity queries
CREATE INDEX IF NOT EXISTS user_activity_created_at_idx ON public.user_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS user_activity_ip_idx ON public.user_activity(ip_address);

-- Create resume table
CREATE TABLE IF NOT EXISTS public.resume (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  is_current BOOLEAN DEFAULT TRUE,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for resume
ALTER TABLE public.resume ENABLE ROW LEVEL SECURITY;

-- Policies for resume
CREATE POLICY "Everyone can view current resume"
  ON public.resume FOR SELECT
  USING (is_current = true OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can insert resume"
  ON public.resume FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can update resume"
  ON public.resume FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON public.blogs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to auto-mark old resume as not current when new one is uploaded
CREATE OR REPLACE FUNCTION mark_old_resume_not_current()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_current = TRUE THEN
    UPDATE public.resume
    SET is_current = FALSE
    WHERE id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER ensure_single_current_resume BEFORE INSERT OR UPDATE ON public.resume
  FOR EACH ROW EXECUTE FUNCTION mark_old_resume_not_current();

-- Create storage buckets (run these in Supabase Dashboard > Storage)
-- 1. blog-images (for blog cover images)
-- 2. project-images (for project images)
-- 3. resume-files (for resume PDFs)
-- 4. uploads (for misc uploads)

-- Note: After running this SQL, you need to:
-- 1. Create storage buckets in Supabase Dashboard
-- 2. Set up storage policies for each bucket
-- 3. Create your first admin user by manually updating the is_admin field in profiles table
