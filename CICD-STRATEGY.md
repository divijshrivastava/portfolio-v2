# Production-Ready CI/CD Pipeline with QA and Production Environments

## Overview

Transform the current CI/CD pipeline to support a complete QA → Production workflow with manual approval gates, using two separate Vercel projects and domains.

## Current State

- **CI Pipeline**: Tests, linting, type-checking, e2e tests, security scans via `.github/workflows/ci.yml`
- **Deployment**: Vercel automatically deploys `main` branch to production via GitHub integration
- **Domain**: divij.tech (production)
- **Environments**: Single production Supabase project
- **Approval**: None - automatic deployments when pushing to `main`

## New Architecture: Two Projects, Two Domains

**Your Approach:**
- **QA Project**: `portfolio-v2-qa` on Vercel → `divij-qa.tech` domain
- **Production Project**: `portfolio-v2` on Vercel → `divij.tech` domain (existing)
- **Two Supabase Projects**: QA database + Production database
- **Deployment Flow**: Push to `main` → Auto-deploy to QA → Test → Approve → Deploy to Production

**Why This Works Better:**
- ✅ Persistent QA environment with stable URL (divij-qa.tech)
- ✅ Easier to share with others for testing
- ✅ Still uses only free tiers (Vercel allows 2 projects for free)
- ✅ Clear separation between QA and Production
- ✅ Both frontend and backend are separate per environment

## Target Architecture

```
┌──────────────────────────────────────────────────┐
│          Developer pushes to main branch         │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│              CI Tests Run (GitHub Actions)       │
│  - Linting, type-check, unit tests, e2e, security│
└────────────────────┬─────────────────────────────┘
                     │
                     ▼ (if tests pass)
┌──────────────────────────────────────────────────┐
│         Auto-Deploy to QA Environment            │
│  Vercel Project: portfolio-v2-qa                 │
│  Domain: divij-qa.tech                           │
│  Database: QA Supabase                           │
│  Time: ~2 minutes                                │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│           Manual Testing on divij-qa.tech        │
│  - Test all features                             │
│  - Verify database operations                    │
│  - Check mobile/desktop                          │
│  - Admin features, blog, contact, etc.           │
│  Time: User-controlled                           │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼ (when ready)
┌──────────────────────────────────────────────────┐
│    GitHub Environment Approval Gate ("production")│
│  - Go to GitHub Actions                          │
│  - Click "Review deployments"                    │
│  - Approve or Reject                             │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼ (after approval)
┌──────────────────────────────────────────────────┐
│       Deploy to Production Environment           │
│  Vercel Project: portfolio-v2                    │
│  Domain: divij.tech                              │
│  Database: Production Supabase                   │
│  Time: ~2 minutes                                │
│  Method: Vercel auto-deployment                  │
└──────────────────────────────────────────────────┘
```

**Key Points:**
- **Two separate Vercel projects** (QA and Production)
- **Two separate domains** (divij-qa.tech and divij.tech)
- **Two separate Supabase databases** (QA and Production)
- **Same codebase** deployed to both (from `main` branch)
- **Manual approval required** before production deployment
- **Automatic deployment to QA** on every push to main

## Summary: What We're Actually Building

**The Approach:** Two separate Vercel projects (QA and Production) with automatic deployment to QA, manual approval, then deployment to Production.

**Infrastructure Setup:**
1. **Buy domain**: `divij-qa.tech` (cost: ~$10-15/year)
2. **Create QA Vercel project**: `portfolio-v2-qa` connected to GitHub → deploys to divij-qa.tech
3. **Create QA Supabase project**: Separate database for testing
4. **Configure both Vercel projects**: QA project uses QA Supabase, Production uses Production Supabase
5. **Add GitHub workflow**: Automatic QA deployment + approval gate for production

**Code Changes:**
1. **GitHub workflow** (`.github/workflows/deploy-qa-prod.yml`) - Orchestrates QA and Production deployments
2. **Environment utilities** (`lib/config/environment.ts`) - Detects QA vs Production environment
3. **Documentation** (`ENVIRONMENTS.md`) - Complete environment guide

**What Stays the Same:**
- CI tests run on every push/PR (already working)
- No changes to Supabase clients or application code
- No changes to build process or Next.js configuration

**Key Benefits:**
- ✅ Persistent QA environment with stable URL (divij-qa.tech)
- ✅ Both QA and Production are full production-grade deployments
- ✅ Easy to share QA site for testing/demos
- ✅ Clear separation between environments
- ✅ Leverages Vercel's strengths
- ✅ Simple rollback strategy
- ✅ Still uses free tiers (except $10-15/year for QA domain)

**Cost Analysis:**
- Vercel: $0 (free tier allows 2 projects)
- Supabase: $0 (free tier allows 2 projects)
- GitHub Actions: $0 (public repo = unlimited, or within free tier for private)
- **divij-qa.tech domain**: ~$10-15/year (only real cost)

**Total Annual Cost:** ~$10-15/year

**Time Investment:** 6-9 hours total setup, then fully automated

---

## Implementation Steps

### Step 1: Purchase QA Domain

**Action:**
1. Buy `divij-qa.tech` domain from registrar (Namecheap, Google Domains, etc.)
2. Cost: ~$10-15/year
3. Keep DNS management with registrar for now (will add Vercel nameservers later)

**Note:** You'll configure DNS after creating the Vercel QA project

---

### Step 2: Create QA Supabase Project

**Actions:**
1. Go to supabase.com → Create new project
2. Name: `portfolio-v2-qa`
3. Region: Same as production (for consistency)
4. Database password: Generate strong password
5. Wait for project to provision (~2 minutes)

6. Run database schema:
   - Go to SQL Editor
   - Copy contents of `supabase-schema.sql`
   - Execute to create all tables, RLS policies, functions

7. Create storage buckets:
   - Go to Storage
   - Create buckets: `blog-images`, `profile-images`, `project-images`, `resumes`
   - Set public access policies (same as production)

8. Create test admin user:
   - Go to Authentication → Users
   - Create user manually with your email
   - Go to SQL Editor, run:
     ```sql
     UPDATE profiles SET is_admin = true WHERE email = 'your-email@example.com';
     ```

9. Optionally seed test data:
   - Add sample blog posts
   - Add sample projects
   - Add test images

10. Note down credentials (you'll need these):
    - Project URL: `https://xxxxx.supabase.co`
    - Anon key: From Settings → API
    - Service role key: From Settings → API (keep secret!)

**Cost:** $0 (Supabase free tier allows 2 projects)

---

### Step 3: Create QA Vercel Project

**Actions:**
1. Go to Vercel Dashboard → Add New Project
2. Import your GitHub repository (same repo as production project)
3. Project name: `portfolio-v2-qa`
4. Framework: Next.js (auto-detected)
5. Root Directory: `.` (same as production)
6. **Important:** Change the Git branch to `main` (same branch as production)
7. Before deploying, configure environment variables:

**Environment Variables for QA Project:**
```
NEXT_PUBLIC_SUPABASE_URL=<qa-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<qa-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<qa-service-role-key>
NEXT_PUBLIC_APP_URL=https://divij-qa.tech
NEXTAUTH_URL=https://divij-qa.tech
NEXTAUTH_SECRET=<generate-random-secret-qa>
```

8. Click "Deploy"
9. Wait for deployment (~2 minutes)
10. You'll get a Vercel URL like `portfolio-v2-qa.vercel.app`

**Cost:** $0 (Vercel free tier allows multiple projects)

---

### Step 4: Configure QA Domain (divij-qa.tech)

**Actions:**
1. In Vercel Dashboard → portfolio-v2-qa project → Settings → Domains
2. Add domain: `divij-qa.tech`
3. Vercel will show you nameservers to add
4. Go to your domain registrar DNS settings
5. Add Vercel's nameservers (or add CNAME record as shown)
6. Wait for DNS propagation (~10-60 minutes)
7. Verify: Visit `https://divij-qa.tech` - should show your portfolio

**Result:** QA environment is now accessible at divij-qa.tech

---

### Step 5: Verify Production Project Configuration

**Actions:**
1. Go to Vercel Dashboard → portfolio-v2 (your existing production project)
2. Go to Settings → Environment Variables
3. Verify/Add production environment variables:

**Environment Variables for Production Project:**
```
NEXT_PUBLIC_SUPABASE_URL=<production-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<production-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<production-service-role-key>
NEXT_PUBLIC_APP_URL=https://divij.tech
NEXTAUTH_URL=https://divij.tech
NEXTAUTH_SECRET=<generate-random-secret-production>
```

4. Ensure these are different from QA credentials
5. Redeploy if you made changes

**Result:** Production environment confirmed working at divij.tech

---

### Step 6: Configure Vercel Git Integration

**For QA Project:**
1. Go to portfolio-v2-qa → Settings → Git
2. Production Branch: `main`
3. This means: every push to `main` auto-deploys to QA

**For Production Project:**
1. Go to portfolio-v2 → Settings → Git
2. Production Branch: `main` (already set)
3. **IMPORTANT:** We'll gate this with GitHub workflow

**Result:** Both projects watch the `main` branch

---

### Step 7: Create GitHub Environment for Approval

**Actions:**
1. Go to GitHub Repo → Settings → Environments
2. Click "New environment"
3. Name: `production`
4. Configure protection rules:
   - ✅ Required reviewers: Add yourself
   - Wait timer: 0 minutes (approve immediately when ready)
   - Deployment branches: `main` only
5. Save

**Result:** Production deployments will require manual approval

---

### Step 8: Create Deployment Workflow

**Create new file:** `.github/workflows/deploy-qa-prod.yml`

This workflow will:
1. Trigger on push to `main`
2. Run CI tests first (or depend on existing ci.yml)
3. Wait for QA deployment to complete (Vercel auto-deploys)
4. Pause for manual approval via GitHub Environment
5. Trigger production deployment (or rely on Vercel's auto-deploy)

**Key Design Decision:**
- Option A: Let both Vercel projects auto-deploy, use GitHub Environment just for gating/notification
- Option B: Disable auto-deploy on production project, use Vercel CLI to deploy after approval

**Recommended: Option A** (simpler, leverages Vercel's strengths)

---

### Step 9: Add Environment Utilities

**Create new file:** `lib/config/environment.ts`

Purpose:
- Detect if running on QA (divij-qa.tech) or Production (divij.tech)
- Validate environment variables
- Provide type-safe config access
- Show environment badge in admin UI

**Example Implementation:**
```typescript
export function getEnvironment(): 'qa' | 'production' | 'development' {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'divij-qa.tech') return 'qa';
    if (window.location.hostname === 'divij.tech') return 'production';
  }
  if (process.env.NEXT_PUBLIC_APP_URL?.includes('divij-qa.tech')) return 'qa';
  if (process.env.NEXT_PUBLIC_APP_URL?.includes('divij.tech')) return 'production';
  return 'development';
}
```

---

### Step 10: Update Documentation

**Create:** `ENVIRONMENTS.md`

Contents:
- QA vs Production environment explanation
- How to test on divij-qa.tech
- How to approve production deployments
- Rollback procedures
- Troubleshooting guide

**Update:** `DEPLOYMENT.md`

Add:
- Two-environment deployment flow
- QA testing checklist
- Production approval process
- Emergency procedures

---

### Step 11: Configure Branch Protection (Optional but Recommended)

**Actions:**
1. GitHub Repo → Settings → Branches
2. Add rule for `main` branch
3. Enable:
   - Require pull request before merging
   - Require status checks (CI tests)
   - Require 1 approval

**Result:** Prevents accidental direct pushes to main, ensures quality

## File Changes Summary

### New Files (Code)
1. `.github/workflows/deploy-qa-prod.yml` - QA and Production deployment workflow with approval gate
2. `lib/config/environment.ts` - Runtime environment detection (QA vs Production vs Development)
3. `ENVIRONMENTS.md` - Comprehensive QA and Production environment guide

### Modified Files (Code)
1. `DEPLOYMENT.md` - Update with two-project deployment workflow
2. `app/api/health/route.ts` - Add environment detection endpoint (optional)

### Infrastructure Changes (Manual - No Code)
1. **Domain Purchase**: Buy `divij-qa.tech` domain (~$10-15/year)

2. **Supabase**: Create QA project
   - Project name: `portfolio-v2-qa`
   - Run `supabase-schema.sql`
   - Create storage buckets
   - Seed test data

3. **Vercel**: Create QA project
   - Project name: `portfolio-v2-qa`
   - Connect to same GitHub repo
   - Watch `main` branch
   - Configure QA environment variables
   - Add `divij-qa.tech` domain

4. **Vercel**: Update Production project
   - Verify environment variables
   - Ensure watching `main` branch

5. **GitHub Repository**:
   - Create "production" environment with approval requirements
   - Optional: Configure branch protection rules for `main`

6. **DNS**: Configure `divij-qa.tech` to point to Vercel QA project

## Workflow Execution Examples

### Scenario 1: Normal Feature Development

1. **Develop Feature** (e.g., add dark mode)
   - Create feature branch: `feature/add-dark-mode`
   - Make code changes locally
   - Test locally with dev environment (`npm run dev`)

2. **Create Pull Request**
   - Push feature branch to GitHub
   - Create PR: `feature/add-dark-mode` → `main`
   - CI tests run automatically (~7 minutes):
     - Quality checks: ~1 min
     - Unit tests: ~1 min
     - E2E tests: ~2-3 min
     - Build verification: ~2 min
     - Security scan: ~30s
   - Get code review approval
   - Wait for tests to pass

3. **Merge to Main**
   - Merge PR after CI passes and approval
   - Triggers push to `main` branch

4. **Automatic QA Deployment**
   - Vercel automatically deploys to QA project (~1-2 minutes)
   - QA site updates: `https://divij-qa.tech`
   - Uses QA Supabase database
   - You receive deployment notification

5. **Test on QA Environment**
   - Visit `https://divij-qa.tech`
   - Test new dark mode feature thoroughly
   - Verify database interactions
   - Test on mobile and desktop
   - Check all critical paths (login, blog, contact, admin)
   - Share QA URL with others for feedback if needed
   - Time: User-controlled (could be minutes to hours/days)

6. **Approve Production Deployment**
   - When satisfied with QA testing, go to GitHub Actions
   - Find the deployment workflow run
   - Click "Review deployments"
   - Select "production" environment
   - Click "Approve and deploy"
   - Or click "Reject" if issues found

7. **Automatic Production Deployment** (After Approval)
   - Vercel automatically deploys to Production project (~1-2 minutes)
   - Production site updates: `https://divij.tech`
   - Uses Production Supabase database
   - You receive deployment success notification
   - Production is now live with new feature!

**Total Time:** ~10 minutes CI + User testing time + ~2 minutes production deployment

---

### Scenario 2: Emergency Hotfix

1. **Identify Critical Bug**
   - Bug found on production (`divij.tech`)
   - Need immediate fix

2. **Create and Fix**
   - Create hotfix branch: `hotfix/critical-bug`
   - Fix the bug quickly
   - Test locally

3. **Fast-Track PR**
   - Push and create PR
   - CI runs (~7 minutes)
   - Self-approve code review (personal project)
   - Merge to main immediately after CI passes

4. **QA Deployment**
   - Vercel auto-deploys to `divij-qa.tech` (~1-2 minutes)
   - Quick smoke test on QA (2-3 minutes)

5. **Immediate Production Approval**
   - Go to GitHub Actions
   - Approve production deployment immediately
   - Vercel deploys to `divij.tech` (~1-2 minutes)

**Total Time:** ~15-20 minutes from fix to production

---

### Scenario 3: Testing Major Changes

1. **Develop Major Feature** (e.g., complete blog redesign)
   - Work on feature branch for several days
   - Create PR when ready
   - Merge to main after CI passes

2. **Extended QA Testing**
   - QA deploys to `divij-qa.tech`
   - Test for several days on QA environment
   - Get feedback from users
   - Find and fix bugs
   - Each fix: new PR → merge → QA auto-deploys
   - Production approval stays pending

3. **Multiple Iterations on QA**
   - Day 1: Initial deployment, find 5 bugs
   - Day 2: Fix bugs, merge, QA updates automatically
   - Day 3: More testing, find 2 more issues
   - Day 4: Fix remaining issues
   - Day 5: Final QA approval

4. **Production Deployment**
   - After thorough QA testing (5 days), approve production
   - Production deploys with stable, tested code

**Key Benefit:** QA environment can iterate multiple times before touching production

---

### Scenario 4: Rollback After Bad Deployment

1. **Production Deployment Goes Bad**
   - Just deployed to `divij.tech`
   - Critical bug discovered immediately
   - Need to rollback NOW

2. **Instant Rollback via Vercel**
   - Go to Vercel Dashboard → portfolio-v2 (production project)
   - Click "Deployments"
   - Find previous working deployment (marked ✅)
   - Click three dots → "Promote to Production"
   - Site rolls back in ~30 seconds

3. **Fix the Issue**
   - Meanwhile, fix the bug locally
   - Create PR, merge to main
   - Test on QA thoroughly this time
   - Approve production when confident

**Rollback Time:** ~30 seconds (no code changes needed)

## Free Tier Limits & Compliance

| Service | Free Tier | Your Usage | Status |
|---------|-----------|------------|--------|
| **GitHub Actions** | Public repos: Unlimited<br>Private repos: 2000 min/month | ~100-150 min/month<br>(CI tests + deployment workflow) | ✅ Well within limits |
| **Vercel** | 2 hobby projects allowed<br>100GB bandwidth/month per project<br>Unlimited builds | 2 projects (QA + Prod)<br>~10GB bandwidth total<br>~20-30 builds/month | ✅ Perfect fit |
| **Supabase** | 2 projects<br>500MB database each<br>1GB storage each<br>50K MAU | 2 projects (QA + Prod)<br>< 100MB data each<br>< 500MB storage each<br>< 1K MAU | ✅ Exact fit |
| **Domain** | N/A - must purchase | divij-qa.tech (~$10-15/year) | 💰 Small cost |

**Total Monthly Cost Breakdown:**
- GitHub Actions: $0 (free tier)
- Vercel: $0 (free tier, 2 projects allowed)
- Supabase: $0 (free tier, 2 projects allowed)
- Domain (divij-qa.tech): ~$1.25/month ($15/year)
- **Total: ~$1.25/month or $15/year**

**Important Notes:**
- ✅ GitHub Actions for **public repositories** = unlimited minutes (free forever)
- ✅ If your repo is **private**, you get 2000 minutes/month free (sufficient for this workflow)
- ✅ Vercel free tier (Hobby plan) allows **2 projects** - perfect for QA + Production
- ✅ Vercel free tier prohibits commercial use - ensure this is personal/portfolio site only
- ✅ Supabase allows exactly **2 projects** on free tier - exactly what we need
- 💰 Only real cost is the **divij-qa.tech domain** (~$10-15/year depending on registrar)
- 💡 Alternative: Use a subdomain like **qa.divij.tech** if you want to avoid buying a separate domain (reduces cost to $0/month)

## Rollback Strategy

### Option 1: Instant Rollback via Vercel (Recommended)

**Best for:** Immediate issues detected right after deployment

**Steps:**
1. Go to Vercel dashboard → Your Project → Deployments
2. Find the last known good deployment (will be marked with ✅)
3. Click the three dots menu → "Promote to Production"
4. Deployment rolls back in ~30 seconds
5. No code changes needed
6. No approval gate needed (emergency override)

**Time:** ~30 seconds
**Downside:** Doesn't fix the code in git, just rolls back the deployment

---

### Option 2: Git Revert (Recommended for Code Fixes)

**Best for:** Fixing bad code in git history + rolling back deployment

**Steps:**
1. Identify the bad commit: `git log --oneline`
2. Revert it: `git revert <commit-hash>`
3. Push revert commit to `main`
4. This triggers production approval gate again
5. Quickly approve the revert
6. Vercel deploys the fixed code in ~2 minutes

**Time:** ~5 minutes
**Advantage:** Fixes both deployment AND git history

---

### Option 3: Database Rollback (If Needed)

**Best for:** Bad database migrations or data corruption

**Steps:**
1. Go to Supabase dashboard → Database → Backups
2. Supabase free tier: automatic daily backups (7 day retention)
3. Restore from backup OR manually revert schema changes
4. Run fix migrations if needed

**Time:** Varies (5-30 minutes depending on database size)
**Note:** Coordinate with code rollback to keep code and DB in sync

---

### Rollback Decision Tree

```
Is production broken? → YES
  ↓
Is it a deployment issue? → YES
  ↓
Use Option 1 (Instant Vercel Rollback)
  ↓
Then investigate and fix code properly


Is production broken? → YES
  ↓
Is it a code bug? → YES
  ↓
Use Option 2 (Git Revert)
  ↓
Fix properly in next deployment


Is production broken? → YES
  ↓
Is it a database issue? → YES
  ↓
Use Option 3 (Database Rollback)
  ↓
Then update migrations and redeploy
```

## Security Considerations

1. **Secrets Management:**
   - All secrets stored in Vercel dashboard (environment variables)
   - Never committed to repository
   - Separate secrets for QA and production
   - Rotate secrets periodically

2. **Environment Isolation:**
   - QA and production completely isolated
   - No shared database or storage
   - Different Supabase projects
   - Separate domain/URLs

3. **Access Control:**
   - GitHub environment protection rules
   - Required approvers for production
   - Audit log of all deployments
   - IP-based restrictions (optional)

## Testing Strategy on QA Environment

**Before Approving Production Deployment:**

**On divij-qa.tech, verify:**

1. ✅ QA deployment succeeded (check Vercel dashboard)
2. ✅ Homepage loads correctly
3. ✅ Blog listing shows all posts
4. ✅ Individual blog posts load and display properly
5. ✅ Blog view counter increments
6. ✅ Admin login works
7. ✅ Admin dashboard shows correct data
8. ✅ Contact form submission saves to QA database
9. ✅ Image uploads work (if applicable to your changes)
10. ✅ Mobile responsiveness on different devices
11. ✅ Check browser console for errors (F12)
12. ✅ Verify QA Supabase database has new data
13. ✅ Test new feature thoroughly (the reason for this deployment)
14. ✅ Check Vercel logs for any errors
15. ✅ Check Supabase logs for any database errors

**When to approve production:**
- All above tests pass
- No errors in logs
- New feature works as expected
- No regressions in existing functionality
- You're confident this is ready for users

**When to reject/delay production:**
- Any test fails
- Errors in logs
- Feature not working correctly
- Need more testing time
- Waiting for stakeholder feedback

## Monitoring & Observability

**Post-Deployment Checks:**
1. Vercel deployment logs
2. Health endpoint: `/api/health`
3. Supabase dashboard metrics
4. Vercel analytics (free tier)
5. Browser console errors (manual)

**Alerts:**
- GitHub Actions email notifications
- Vercel deployment status
- Supabase connection errors

## Success Criteria

### Core Requirements ✅
- ✅ All CI tests pass before any deployment
- ✅ QA environment (divij-qa.tech) automatically deploys on push to main
- ✅ Production deployment (divij.tech) requires manual approval via GitHub Environment
- ✅ QA environment uses QA Supabase database
- ✅ Production environment uses Production Supabase database
- ✅ Frontend and backend correctly connected in each environment
- ✅ Both environments accessible via custom domains
- ✅ All functionality working within free tiers (~$15/year for QA domain only)

### Technical Validation ✅
- ✅ Two separate Vercel projects created (portfolio-v2-qa and portfolio-v2)
- ✅ Two separate Supabase projects configured (QA and Production)
- ✅ Environment variables correctly configured in both Vercel projects
- ✅ GitHub Environment "production" requires manual approval
- ✅ divij-qa.tech domain correctly pointed to QA Vercel project
- ✅ divij.tech domain correctly pointed to Production Vercel project
- ✅ Branch protection prevents direct pushes to main (optional but recommended)
- ✅ Rollback works (tested Vercel instant rollback method)
- ✅ Environment detection works (`lib/config/environment.ts`)
- ✅ Database connectivity working in both environments

### Documentation ✅
- ✅ ENVIRONMENTS.md documents full QA and Production strategy
- ✅ DEPLOYMENT.md updated with two-project workflow
- ✅ Clear instructions for testing on QA before approving production
- ✅ Rollback procedure documented and tested
- ✅ Troubleshooting guide for common issues
