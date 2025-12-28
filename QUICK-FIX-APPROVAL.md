# Quick Fix: Enable Approval Gate (2 Minutes)

## The Problem

Database migrations (and deployments) skip the approval step because **admin bypass is enabled** on the "Production" environment.

## The Solution (One Setting Change)

### Step 1: Open Production Environment Settings

Go to: https://github.com/divijshrivastava/portfolio-v2/settings/environments

Click on **"Production"**

### Step 2: Disable Admin Bypass

Scroll down to **"Deployment protection rules"**

Find: ☑️ **"Allow administrators to bypass configured protection rules"**

**UNCHECK** this box ❌

Click **"Save protection rules"**

### Step 3: Done! ✅

That's it. Now the workflow will work exactly like Vercel deployments:

```
Push migration
    ↓
QA applies automatically (~30s)
    ↓
GitHub Actions shows "Review deployments" button ⏸️
    ↓
You click "Review deployments" → Approve
    ↓
Production applies automatically (~30s)
```

---

## What This Changes

### Before (Admin Bypass Enabled)
- Push → QA applies → Production applies (automatic, no approval)

### After (Admin Bypass Disabled)
- Push → QA applies → **WAIT for approval** → Production applies

---

## Important Notes

✅ **You're the only reviewer** - You'll approve your own changes (perfectly fine for solo projects)

✅ **Same as Vercel workflow** - Exact same "Review deployments" button

✅ **Works for BOTH:**
- Database migrations (migrate-databases.yml)
- Vercel deployments (deploy-qa-prod.yml)

✅ **No second reviewer needed** - GitHub allows self-approval when admin bypass is disabled

---

## Testing the New Flow

After disabling admin bypass, create a test migration:

```bash
cat > supabase/migrations/$(date +%Y%m%d%H%M%S)_test_approval.sql <<'EOF'
-- Test approval gate
ALTER TABLE public.blogs
ADD COLUMN IF NOT EXISTS approval_test BOOLEAN DEFAULT true;
EOF

git add supabase/migrations/
git commit -m "Test: approval gate"
git push
```

Then:
1. QA will apply automatically
2. Go to: https://github.com/divijshrivastava/portfolio-v2/actions
3. You'll see "Review deployments" button
4. Click it → Check "production" → Click "Approve and deploy"
5. Production applies

---

## Screenshot Guide

When you open the Production environment settings, you'll see:

```
Deployment protection rules
---------------------------
☑️ Required reviewers: divijshrivastava

☑️ Allow administrators to bypass configured protection rules  ← UNCHECK THIS
```

Just uncheck that box and save!

---

**That's the only change needed!** Everything else is already set up correctly.
