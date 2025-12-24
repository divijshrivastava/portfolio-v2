# Portfolio V2 Setup Guide

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js with Supabase
- **Image Storage**: Supabase Storage
- **Hosting**: Vercel (free tier)
- **Cost**: $0/month

## Prerequisites
1. Node.js 18+ installed
2. A Supabase account (free tier)
3. A Vercel account (free tier)
4. GitHub account

## Step 1: Supabase Setup

### 1.1 Create a New Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if you don't have one)
4. Create a new project:
   - Name: `portfolio-v2`
   - Database Password: (save this somewhere safe)
   - Region: Choose closest to your users
   - Pricing Plan: Free

### 1.2 Run the Database Schema
1. In your Supabase project, go to **SQL Editor**
2. Create a new query
3. Copy the entire contents of `supabase-schema.sql` from this project
4. Run the query
5. Verify all tables were created successfully

### 1.3 Create Storage Buckets
1. Go to **Storage** in Supabase Dashboard
2. Create the following buckets:
   - `blog-images` (public)
   - `project-images` (public)
   - `resume-files` (public)
   - `uploads` (public)

3. For each bucket, set up the following storage policies:

**Upload Policy (for authenticated users only):**
```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images' AND
  auth.role() = 'authenticated'
);
```

**Read Policy (public access):**
```sql
-- Allow public to read
CREATE POLICY "Public can read"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');
```

**Delete Policy (admin only):**
```sql
-- Allow admins to delete
CREATE POLICY "Admins can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);
```

Repeat for all buckets (blog-images, project-images, resume-files, uploads).

### 1.4 Create Your Admin User
1. Go to **Authentication** > **Users**
2. Click "Add user" > "Create new user"
3. Enter your email and password
4. Copy the User UID
5. Go to **SQL Editor** and run:
```sql
UPDATE public.profiles
SET is_admin = true
WHERE id = 'YOUR_USER_UID_HERE';
```

### 1.5 Get Your Supabase Credentials
1. Go to **Settings** > **API**
2. Copy the following:
   - Project URL
   - `anon` public key
   - `service_role` key (keep this secret!)

## Step 2: Local Development Setup

### 2.1 Install Dependencies
```bash
cd portfolio-v2
npm install
```

### 2.2 Set Up Environment Variables
Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_a_random_secret_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

To generate a random secret for NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 2.3 Run the Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your portfolio.

## Step 3: Vercel Deployment

### 3.1 Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit - Portfolio V2"
git remote add origin your_github_repo_url
git push -u origin main
```

### 3.2 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next
5. Add Environment Variables (same as `.env.local` but update URLs):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your_random_secret
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   ```
6. Click "Deploy"

### 3.3 Update Supabase Auth Settings
1. In Supabase Dashboard, go to **Authentication** > **URL Configuration**
2. Add your Vercel URL to:
   - Site URL: `https://your-domain.vercel.app`
   - Redirect URLs: `https://your-domain.vercel.app/api/auth/callback`

## Step 4: Migrate Data from MySQL to Supabase

### 4.1 Export Data from MySQL
Run the migration script (we'll create this):
```bash
node scripts/export-from-mysql.js
```

This will create JSON files with your data:
- `blogs.json`
- `projects.json`
- `messages.json`
- `user_activity.json`

### 4.2 Import Data to Supabase
```bash
node scripts/import-to-supabase.js
```

### 4.3 Migrate Images
1. Download all images from your current server
2. Run the image migration script:
```bash
node scripts/migrate-images.js
```

This will:
- Upload images to Supabase Storage
- Update image URLs in the database

## Features Checklist

### Public Features
- [ ] Homepage with intro section
- [ ] Blog listing page
- [ ] Individual blog post pages
- [ ] Projects showcase page
- [ ] About page
- [ ] Contact form
- [ ] Resume viewer/download
- [ ] Mobile-responsive design
- [ ] Fast loading with image optimization
- [ ] SEO optimization

### Admin Features
- [ ] Admin login
- [ ] Admin dashboard
- [ ] Create/edit blogs with WYSIWYG editor
- [ ] Approve/delete blogs
- [ ] Upload blog images
- [ ] Create/edit projects
- [ ] Approve/delete projects
- [ ] View inbox messages
- [ ] View user activity (IP tracking)
- [ ] Upload resume

## Performance Optimizations
- Next.js Image component for automatic image optimization
- Static Site Generation (SSG) for blog posts
- Incremental Static Regeneration (ISR) for dynamic content
- Edge functions for API routes
- Automatic code splitting
- Mobile-first responsive design with Tailwind CSS

## Estimated Costs
- Supabase Free Tier:
  - 500MB database
  - 1GB file storage
  - 50GB bandwidth
  - 50,000 monthly active users
- Vercel Free Tier:
  - 100GB bandwidth/month
  - Unlimited websites
  - Automatic HTTPS

**Total: $0/month** (well within free tier limits for a portfolio)

## Upgrading Limits
If you exceed free tier limits:
- Supabase Pro: $25/month (8GB database, 100GB storage)
- Vercel Pro: $20/month (1TB bandwidth)

For a personal portfolio, free tier should be sufficient.

## Next Steps
1. Complete the implementation following the todos
2. Customize the design to match your brand
3. Add your content (blogs, projects, resume)
4. Test on mobile devices
5. Deploy to production
6. Set up custom domain (optional)
7. Monitor usage in Supabase and Vercel dashboards
