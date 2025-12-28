# Database Migration Workflow Guide

## Overview

Database migrations now use a **two-step workflow** that gives you full control:

1. **QA migrations** apply automatically when you push
2. **Production migrations** require manual trigger after QA testing

This workflow is perfect for solo developers who want to test before promoting to production.

---

## Your New Workflow

### Step 1: Create and Push Migration

```bash
# 1. Create migration file
cat > supabase/migrations/$(date +%Y%m%d%H%M%S)_add_feature.sql <<'EOF'
ALTER TABLE public.blogs
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
EOF

# 2. Commit and push
git add supabase/migrations/
git commit -m "Add blog categories"
git push
```

### Step 2: QA Auto-Deploys (Automatic)

- ✅ GitHub Actions triggers "Migrate QA Database" workflow
- ✅ Migration applies to QA Supabase automatically (~30 seconds)
- ✅ You receive notification

### Step 3: Test on QA

Visit **https://divij-qa.tech** and verify:
- ✅ Schema changes applied correctly
- ✅ Affected features work
- ✅ No errors in browser console
- ✅ Data integrity maintained
- ✅ Test all edge cases

### Step 4: Promote to Production (Manual)

When QA testing passes:

1. Go to: https://github.com/divijshrivastava/portfolio-v2/actions/workflows/migrate-production.yml
2. Click **"Run workflow"** button (top right)
3. Type `production` in the confirmation field
4. Click **"Run workflow"**
5. Migration applies to production (~30 seconds)

### Step 5: Verify Production

Visit **https://divij.tech** and verify everything works.

---

## Quick Reference

| Action | Trigger | Time |
|--------|---------|------|
| **QA Migration** | Automatic on push | ~30s |
| **QA Testing** | Manual (you decide) | Varies |
| **Production Migration** | Manual workflow trigger | ~30s |

---

## Example: Adding a New Column

```bash
# Create migration
cat > supabase/migrations/$(date +%Y%m%d%H%M%S)_add_blog_tags.sql <<'EOF'
-- Add tags column to blogs
ALTER TABLE public.blogs
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add index for tag searches
CREATE INDEX IF NOT EXISTS blogs_tags_idx
ON public.blogs USING GIN(tags);
EOF

# Commit and push
git add supabase/migrations/
git commit -m "Add tags support to blogs"
git push

# GitHub Actions automatically applies to QA

# Test on https://divij-qa.tech
# - Try adding tags to a blog post
# - Search by tags
# - Verify tags display correctly

# When satisfied, manually trigger production:
# https://github.com/divijshrivastava/portfolio-v2/actions/workflows/migrate-production.yml
```

---

## Workflows

### `migrate-qa.yml` (Automatic)

**Triggers on:**
- Push to main with changes in `supabase/migrations/`
- Manual workflow dispatch

**What it does:**
- Applies migrations to QA Supabase
- Shows success message with QA URL
- Reminds you to test before production

### `migrate-production.yml` (Manual Only)

**Triggers on:**
- Manual workflow dispatch only

**Safety features:**
- Requires typing "production" to confirm
- Shows pending migrations before applying
- Verifies success after applying

---

## Benefits of This Approach

✅ **Full Control**: You decide when to promote to production
✅ **No Second Reviewer Needed**: Works perfectly for solo developers
✅ **QA Testing**: Always test on divij-qa.tech first
✅ **Safety**: Manual confirmation required for production
✅ **Visibility**: See exactly what migrations will apply
✅ **Fast**: QA is automatic, production is one click away

---

## Troubleshooting

### QA Migration Failed

1. Check GitHub Actions logs for error details
2. Fix the migration SQL
3. Push the corrected migration
4. QA will automatically retry

### Want to Skip QA Testing?

If you're confident in your migration:
1. Push the migration (QA applies automatically)
2. Immediately trigger production workflow
3. No waiting required

### Need to Rollback?

1. Create a new rollback migration
2. Push to trigger QA
3. Test rollback on QA
4. Trigger production when ready

---

## Comparison to Old Workflow

### Before (Admin Bypass Issue)
```
Push → QA applies → Production applies (automatic)
Problem: Can't test on QA first
```

### After (New Workflow)
```
Push → QA applies (automatic) → Test on QA → Manually trigger production
Benefit: Full control, proper testing workflow
```

---

## Related Documentation

- **Quick Start**: `AUTOMATED-MIGRATIONS-QUICKSTART.md`
- **GitHub Secrets**: `GITHUB-SECRETS-SETUP.md`
- **Approval Gate Info**: `APPROVAL-GATE-EXPLANATION.md`
- **Enable Full Approval**: `ENABLE-APPROVAL-GATE.md` (if you need second reviewer)

---

## Workflow URLs

**QA Migrations (automatic):**
https://github.com/divijshrivastava/portfolio-v2/actions/workflows/migrate-qa.yml

**Production Migrations (manual trigger):**
https://github.com/divijshrivastava/portfolio-v2/actions/workflows/migrate-production.yml

---

**You now have full control over your production database migrations!** 🎉

Test on QA, promote when ready. No automatic production changes.
