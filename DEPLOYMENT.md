# Deployment Guide

This project uses a **two-environment deployment strategy** with QA and Production environments.

## 🏗️ Architecture Overview

**Two Environments:**
- **QA Environment**: https://divij-qa.tech (testing before production)
- **Production Environment**: https://divij.tech (live site for users)

**Deployment Flow:**
1. Push to `main` → Auto-deploy to QA
2. Test on QA environment
3. Manual approval in GitHub Actions
4. Auto-deploy to Production

**See [ENVIRONMENTS.md](./ENVIRONMENTS.md) for complete environment documentation.**

---

## ✅ Completed
- [x] Code pushed to GitHub: https://github.com/divijshrivastava/portfolio-v2
- [x] Git repository initialized
- [x] .gitignore configured (excludes .env.local, node_modules, .next, etc.)
- [x] CI/CD pipeline configured with QA and Production environments

## 🚀 Initial Setup: Two Vercel Projects

**You need to set up TWO separate Vercel projects:**

### Project 1: QA Environment (portfolio-v2-qa)

#### 1.1 Create QA Vercel Project

1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Select **`divijshrivastava/portfolio-v2`**
4. **Project Name:** `portfolio-v2-qa`
5. **Framework:** Next.js (auto-detected)
6. **Root Directory:** `./` (default)
7. **Git Branch:** `main`

#### 1.2 Add QA Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=<your-qa-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-qa-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-qa-service-role-key>
NEXT_PUBLIC_APP_URL=https://divij-qa.tech
NEXTAUTH_URL=https://divij-qa.tech
NEXTAUTH_SECRET=<generate-qa-secret>
```

**Generate secret:** `openssl rand -base64 32`

#### 1.3 Deploy QA

1. Click **"Deploy"**
2. Wait ~2 minutes
3. You'll get: `https://portfolio-v2-qa.vercel.app`

#### 1.4 Add Custom Domain to QA

1. Go to **Settings** > **Domains**
2. Add domain: `divij-qa.tech`
3. Follow DNS configuration (add CNAME or nameservers)
4. Wait for DNS propagation (~10-60 minutes)
5. Verify: Visit https://divij-qa.tech

---

### Project 2: Production Environment (portfolio-v2)

#### 2.1 Create Production Vercel Project

1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Select **`divijshrivastava/portfolio-v2`** (same repo)
4. **Project Name:** `portfolio-v2`
5. **Framework:** Next.js (auto-detected)
6. **Root Directory:** `./` (default)
7. **Git Branch:** `main`

#### 2.2 Add Production Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=<your-production-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-production-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-production-service-role-key>
NEXT_PUBLIC_APP_URL=https://divij.tech
NEXTAUTH_URL=https://divij.tech
NEXTAUTH_SECRET=<generate-production-secret>
```

**Important:** Use DIFFERENT secrets and Supabase credentials than QA!

#### 2.3 Deploy Production

1. Click **"Deploy"**
2. Wait ~2 minutes
3. You'll get: `https://portfolio-v2.vercel.app`

#### 2.4 Add Custom Domain to Production

1. Go to **Settings** > **Domains**
2. Add domain: `divij.tech`
3. Follow DNS configuration
4. Verify: Visit https://divij.tech

---

### Supabase Configuration

**For both QA and Production:**

1. Go to **Supabase Dashboard** > **Authentication** > **URL Configuration**
2. Add redirect URLs:
   - QA: `https://divij-qa.tech/**`
   - Production: `https://divij.tech/**`

---

## 🔧 GitHub Environment Setup

Create production approval gate:

1. Go to GitHub: **Settings** > **Environments**
2. Click **"New environment"**
3. Name: `production`
4. Add protection rules:
   - ✅ Required reviewers: Add yourself
   - Deployment branches: `main` only
5. Save

This enables manual approval before production deployments.

## 📊 Post-Deployment Checklist

- [ ] Visit your site and test all pages
- [ ] Login to admin at `/login`
- [ ] Create a test blog post
- [ ] Test contact form
- [ ] Verify images upload correctly
- [ ] Check mobile responsiveness
- [ ] Test in different browsers

## 🔄 QA and Production Deployment Workflow

This project uses a **two-environment strategy** for safe deployments.

### Standard Deployment Process

#### 1. Develop Feature

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and test locally
npm run dev

# Test thoroughly on localhost:3000
```

#### 2. Create Pull Request

```bash
# Push your feature branch
git push origin feature/new-feature

# Create PR on GitHub: feature/new-feature → main
# CI tests run automatically (~7 minutes)
# Wait for tests to pass
```

#### 3. Merge to Main

```bash
# After PR approval, merge to main
# This automatically triggers:
# ✅ QA deployment to https://divij-qa.tech
```

#### 4. Test on QA Environment

Visit **https://divij-qa.tech** and verify:

- [ ] Homepage loads correctly
- [ ] New feature works as expected
- [ ] No errors in browser console (F12)
- [ ] Mobile responsiveness
- [ ] Admin features work (if applicable)
- [ ] Database operations work

**Take your time testing on QA - it's free to break!**

#### 5. Approve Production Deployment

Once QA testing is complete:

1. Go to [GitHub Actions](../../actions)
2. Find the latest "Deploy QA and Production" workflow
3. Click **"Review deployments"**
4. Select **"production"** environment
5. Click **"Approve and deploy"**

#### 6. Production Deploys

After approval:
- Vercel automatically deploys to **https://divij.tech**
- Takes ~1-2 minutes
- Verify production site works correctly

### Quick Deployment (for simple changes)

```bash
# Make changes
git add .
git commit -m "Fix typo"
git push origin main

# QA deploys automatically (~2 min)
# Test quickly on https://divij-qa.tech
# Approve production in GitHub Actions
# Production deploys (~2 min)
```

**Total time:** ~5-10 minutes from push to production

### Emergency Hotfix

For critical production bugs:

```bash
# Create hotfix branch
git checkout -b hotfix/critical-bug

# Fix the bug
# Test locally

# Push and create PR
git push origin hotfix/critical-bug

# Merge to main after CI passes
# Test quickly on QA
# Immediately approve production
```

**Fastest path to production:** ~15-20 minutes

## 🔄 Rollback Procedures

### Instant Rollback (Recommended)

If production has issues:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Open **portfolio-v2** (production project)
3. Click **Deployments**
4. Find the last working deployment (✅)
5. Click **"..."** → **"Promote to Production"**

**Rollback time:** ~30 seconds

### Code Rollback (via Git)

```bash
# Find the problematic commit
git log --oneline

# Revert it
git revert <commit-hash>

# Push to main
git push origin main

# This deploys to QA first
# Test on QA, then approve for production
```

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

**Total: ~$1.25/month ($15/year)**

- **Vercel Free Tier**: 2 projects allowed (QA + Production) ✅
- **Supabase Free Tier**: 2 projects allowed (QA + Production) ✅
- **GitHub Actions**: Unlimited for public repos ✅
- **divij-qa.tech domain**: ~$10-15/year 💰

**Only real cost is the QA domain!** Everything else is free.

## 🎉 You're Live!

Your portfolio is now deployed with QA and Production environments!

**URLs:**
- **QA**: https://divij-qa.tech (for testing)
- **Production**: https://divij.tech (live site)

**Next steps:**
1. Test deployment workflow: Make a small change and push to `main`
2. Watch it deploy to QA automatically
3. Test on QA, then approve for production
4. Add your content (blogs, projects, resume)
5. Share your production URL on LinkedIn, Twitter, etc.

**Documentation:**
- Full workflow guide: [ENVIRONMENTS.md](./ENVIRONMENTS.md)
- Complete CI/CD strategy: [CICD-STRATEGY.md](./CICD-STRATEGY.md)

Enjoy your blazing-fast, production-ready portfolio with safe deployments! 🚀
