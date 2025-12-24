# Deployment Guide

Your code is now on GitHub! Let's deploy it to production.

## ✅ Completed
- [x] Code pushed to GitHub: https://github.com/divijshrivastava/portfolio-v2
- [x] Git repository initialized
- [x] .gitignore configured (excludes .env.local, node_modules, .next, etc.)

## 🚀 Deploy to Vercel (5 minutes)

### 1. Import Project to Vercel

1. Go to https://vercel.com
2. Click **"Add New Project"**
3. Click **"Import Git Repository"**
4. Select **`divijshrivastava/portfolio-v2`** from the list
5. Click **"Import"**

### 2. Configure Project Settings

**Framework Preset:** Next.js (auto-detected) ✓
**Root Directory:** `./` (leave as default)
**Build Command:** `npm run build` (auto-detected)
**Output Directory:** `.next` (auto-detected)

### 3. Add Environment Variables

Click **"Environment Variables"** and add these:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=generate_new_secret_for_production
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

**Important Notes:**
- Replace `your-project.vercel.app` with your actual Vercel URL (you'll get this after deployment)
- Generate a new NEXTAUTH_SECRET for production: `openssl rand -base64 32`
- Get Supabase credentials from: Supabase Dashboard > Settings > API

### 4. Deploy

1. Click **"Deploy"**
2. Wait ~2 minutes for the build to complete
3. You'll get a URL like: `https://portfolio-v2-xxxxx.vercel.app`

### 5. Update Environment Variables with Actual URL

After first deployment:

1. Copy your Vercel URL
2. Go to **Vercel Dashboard** > **Your Project** > **Settings** > **Environment Variables**
3. Update these variables:
   - `NEXTAUTH_URL` = your actual Vercel URL
   - `NEXT_PUBLIC_APP_URL` = your actual Vercel URL
4. Click **"Save"**
5. Go to **Deployments** tab and click **"Redeploy"**

### 6. Configure Supabase for Production

1. Go to **Supabase Dashboard** > **Authentication** > **URL Configuration**
2. Add your Vercel URL:
   - **Site URL:** `https://your-project.vercel.app`
   - **Redirect URLs:** `https://your-project.vercel.app/**`
3. Save changes

## 🎨 Custom Domain (Optional)

### Add Your Own Domain

1. In Vercel: **Settings** > **Domains**
2. Add your domain (e.g., `divij.dev`)
3. Follow DNS configuration instructions
4. Update environment variables to use your custom domain
5. Update Supabase redirect URLs to use your custom domain

## 📊 Post-Deployment Checklist

- [ ] Visit your site and test all pages
- [ ] Login to admin at `/login`
- [ ] Create a test blog post
- [ ] Test contact form
- [ ] Verify images upload correctly
- [ ] Check mobile responsiveness
- [ ] Test in different browsers

## 🔄 Future Deployments

Every time you push to GitHub `main` branch, Vercel will automatically:
1. Build your site
2. Run tests
3. Deploy if build succeeds
4. Give you a preview URL

### To Deploy Changes:

```bash
# Make your changes
git add .
git commit -m "Description of changes"
git push origin main
```

Vercel will auto-deploy in ~2 minutes! ✨

## 🐛 Troubleshooting

### Build Fails on Vercel

**Check build logs for errors. Common fixes:**

1. **Environment variables missing:** Make sure all variables are set in Vercel
2. **Supabase connection fails:** Verify SUPABASE_URL and keys are correct
3. **Build timeout:** Contact Vercel support (shouldn't happen with this project)

### Can't Login to Admin

1. Verify Supabase redirect URLs include your Vercel domain
2. Check NEXTAUTH_URL matches your deployment URL
3. Ensure admin user exists in Supabase with `is_admin = true`

### Images Not Loading

1. Check Supabase Storage buckets exist and are public
2. Verify storage policies allow public read access
3. Check NEXT_PUBLIC_SUPABASE_URL is correct

## 📈 Monitoring

### Vercel Analytics (Free)

1. Go to **Vercel Dashboard** > **Analytics**
2. Enable Web Analytics
3. View visitors, page views, and performance metrics

### Supabase Usage

1. Go to **Supabase Dashboard** > **Settings** > **Usage**
2. Monitor database size, storage, bandwidth
3. All within free tier limits for portfolio sites

## 💰 Costs

**Total: $0/month**

- Vercel Free Tier: 100GB bandwidth/month
- Supabase Free Tier: 500MB DB + 1GB storage
- Perfect for portfolio sites!

## 🎉 You're Live!

Your portfolio is now deployed! Share your URL:
- https://portfolio-v2.vercel.app (or your custom domain)

Next steps:
1. Add your content (blogs, projects, resume)
2. Share on LinkedIn, Twitter, etc.
3. Add to your GitHub profile
4. Update your email signature

Enjoy your blazing-fast, modern portfolio! 🚀
