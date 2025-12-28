# Automated Migration Workflow - Setup Status

**Date:** 2025-12-28
**Status:** 95% Complete - One Token Needed

---

## ✅ What's Done

### 1. GitHub Actions Workflow Created
- **File:** `.github/workflows/migrate-databases.yml`
- **Features:**
  - Auto-applies migrations to QA on push to main
  - Manual approval gate for production
  - Auto-applies migrations to production after approval
- **Status:** ✅ Deployed and tested

### 2. GitHub Secrets Configured (4/5)
- ✅ `SUPABASE_QA_PROJECT_REF` = `mjprqxxkvvoqkjumqdmd`
- ✅ `SUPABASE_PROD_PROJECT_REF` = `tksgzjaqlrkqqzecwrxk`
- ✅ `SUPABASE_QA_DB_PASSWORD` = Configured
- ✅ `SUPABASE_PROD_DB_PASSWORD` = Configured
- ❌ `SUPABASE_ACCESS_TOKEN` = **MISSING** (see below)

### 3. Test Migration Created
- **File:** `supabase/migrations/20251228073842_test_automated_workflow.sql`
- **Purpose:** Adds `github_actions_test` column to verify workflow
- **Status:** ✅ Committed and pushed

### 4. Documentation Created
- ✅ `AUTOMATED-MIGRATIONS-QUICKSTART.md` - Quick reference guide
- ✅ `GITHUB-SECRETS-SETUP.md` - Detailed setup instructions
- ✅ `SETUP-ACCESS-TOKEN.md` - Token setup guide

### 5. Workflow Triggered
- **Run ID:** 20547385988
- **Result:** ❌ Failed (expected)
- **Error:** "Access token not provided"
- **Logs:** https://github.com/divijshrivastava/portfolio-v2/actions/runs/20547385988

---

## ❌ What's Missing (1 Step)

### SUPABASE_ACCESS_TOKEN

**Why it's needed:** GitHub Actions uses this token to authenticate with Supabase CLI and apply migrations.

**How to add it (2 minutes):**

#### Option 1: Quick CLI Method

1. Go to: https://supabase.com/dashboard/account/tokens
2. Click "Generate New Token"
3. Name: `github-actions-migrations`
4. Copy the token (starts with `sbp_`)
5. Run this command:

```bash
gh secret set SUPABASE_ACCESS_TOKEN --body "sbp_YOUR_TOKEN_HERE"
```

#### Option 2: GitHub Web UI

1. Go to: https://supabase.com/dashboard/account/tokens
2. Generate token (name: `github-actions-migrations`)
3. Go to: https://github.com/divijshrivastava/portfolio-v2/settings/secrets/actions
4. Click "New repository secret"
5. Name: `SUPABASE_ACCESS_TOKEN`
6. Paste token value
7. Click "Add secret"

---

## 🚀 What Happens Next

### After Adding the Token

1. **Re-run the failed workflow:**
   ```bash
   gh run rerun 20547385988
   ```

   Or go to: https://github.com/divijshrivastava/portfolio-v2/actions/runs/20547385988
   Click "Re-run failed jobs"

2. **Watch it succeed:**
   - QA migration applies automatically (~1 minute)
   - Workflow pauses for your approval
   - You approve production in GitHub UI
   - Production migration applies automatically (~1 minute)

3. **Verify on databases:**
   - Check QA Supabase: `github_actions_test` column exists in `projects` table
   - Check Production Supabase: Same column exists after approval

---

## 📊 Complete Workflow Example

Once token is added, every future migration works like this:

```bash
# 1. Create migration file
cat > supabase/migrations/$(date +%Y%m%d%H%M%S)_add_feature.sql <<'EOF'
ALTER TABLE public.blogs
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
EOF

# 2. Commit and push
git add supabase/migrations/
git commit -m "Add category to blogs"
git push

# 3. GitHub Actions automatically:
#    ✅ Applies to QA (~1 min)
#    ⏸️  Waits for your approval
#    ✅ Applies to Production (~1 min)
```

**That's it! No manual SQL needed.** 🎉

---

## 🔍 Verification Checklist

After adding the access token and re-running:

- [ ] GitHub Actions workflow completes successfully
- [ ] QA database has `github_actions_test` column in `projects` table
- [ ] Workflow shows approval gate for production
- [ ] After approving, production database has the column
- [ ] No errors in workflow logs

---

## 📚 Quick Reference

| Resource | Link |
|----------|------|
| Workflow File | `.github/workflows/migrate-databases.yml` |
| Quick Start Guide | `AUTOMATED-MIGRATIONS-QUICKSTART.md` |
| Setup Instructions | `GITHUB-SECRETS-SETUP.md` |
| Token Setup | `SETUP-ACCESS-TOKEN.md` |
| Latest Workflow Run | https://github.com/divijshrivastava/portfolio-v2/actions |
| Generate Token | https://supabase.com/dashboard/account/tokens |

---

## ⏭️ Next Steps

1. **Now:** Add `SUPABASE_ACCESS_TOKEN` (2 minutes)
2. **Then:** Re-run the workflow to test
3. **Future:** Just create migration files and push - everything is automated!

---

**Questions?** Check the documentation files or GitHub Actions logs for details.
