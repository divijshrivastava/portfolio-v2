# Production → QA Sync Setup Guide

## 🎯 Goal

Sync everything from production to QA so you can test schema changes safely before applying to production.

---

## 📋 Step-by-Step Setup

### Step 1: Set Up Supabase Project References

You need to add your Supabase project references to `.env.local`.

**Run the setup helper:**
```bash
./scripts/setup-supabase-refs.sh
```

This will guide you through:
1. Getting QA Project Reference ID from Supabase Dashboard
2. Getting Production Project Reference ID
3. Adding them to `.env.local`

**Manually (alternative):**

1. Get QA Project Reference:
   - Go to QA Supabase Dashboard → Settings → General
   - Copy "Reference ID"

2. Get Production Project Reference:
   - Go to Production Supabase Dashboard → Settings → General
   - Copy "Reference ID"

3. Add to `.env.local`:
   ```bash
   SUPABASE_QA_PROJECT_REF=your_qa_ref_here
   SUPABASE_PROD_PROJECT_REF=your_prod_ref_here
   ```

---

### Step 2: Set Up Supabase Credentials (for Data Sync)

Add full credentials for both QA and Production to `.env.local`:

**For QA:**
```bash
# Get from QA Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL_QA=https://your-qa-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_QA=your_qa_anon_key
SUPABASE_SERVICE_ROLE_KEY_QA=your_qa_service_role_key
```

**For Production:**
```bash
# Get from Production Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL_PROD=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD=your_prod_anon_key
SUPABASE_SERVICE_ROLE_KEY_PROD=your_prod_service_role_key
```

Your complete `.env.local` should look like:
```bash
# Local dev Supabase (usually points to QA)
NEXT_PUBLIC_SUPABASE_URL=https://your-qa-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_qa_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_qa_service_role_key

# Project References
SUPABASE_QA_PROJECT_REF=xxxxxxxxxxxxx
SUPABASE_PROD_PROJECT_REF=yyyyyyyyyyy

# QA Environment
NEXT_PUBLIC_SUPABASE_URL_QA=https://your-qa-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_QA=your_qa_anon_key
SUPABASE_SERVICE_ROLE_KEY_QA=your_qa_service_role_key

# Production Environment
NEXT_PUBLIC_SUPABASE_URL_PROD=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD=your_prod_anon_key
SUPABASE_SERVICE_ROLE_KEY_PROD=your_prod_service_role_key

# ... rest of your env vars ...
```

---

### Step 3: Run the Complete Sync

Now sync everything from production to QA:

```bash
./scripts/sync-prod-to-qa.sh
```

This script will:
1. ✅ Capture production schema
2. ✅ Apply schema to QA
3. ✅ Sync all data (projects, blogs, messages, profiles)
4. ✅ Verify sync completed

**What it does:**
- Links to production and generates migration from current schema
- Applies all migrations to QA database
- Uses Node.js script to sync data table by table
- Verifies everything worked

**Expected output:**
```
🔄 Complete Production → QA Sync
====================================

This script will:
  1. Sync database schema (using Supabase migrations)
  2. Sync all data (using automated Node.js script)

⚠️  WARNING: This will COMPLETELY REPLACE QA with production data!

Are you sure you want to continue? (yes/no): yes

📋 Checking prerequisites...
✅ Prerequisites OK

📊 STEP 1: Syncing Schema
====================================

Linking to production...
Capturing production schema...
✅ Schema already in sync

Linking to QA...
Applying schema to QA...
✅ Schema synced successfully

📦 STEP 2: Syncing Data
====================================

Proceed with data sync? (yes/no): yes

Running automated data sync...

📦 Syncing table: profiles
==================================================
  📤 Fetching from production...
  ✅ Fetched 5 rows from production
  🗑️  Clearing QA table...
  📥 Inserting 5 rows into QA...
  ✅ Successfully synced 5 rows

📦 Syncing table: projects
==================================================
  📤 Fetching from production...
  ✅ Fetched 12 rows from production
  🗑️  Clearing QA table...
  📥 Inserting 12 rows into QA...
  ✅ Successfully synced 12 rows

... (blogs, messages)

✅ SYNC COMPLETE!

Next steps:
  1. Visit https://divij-qa.tech
  2. Verify data is correct
  3. Test schema changes on QA
  4. Push to production when ready
```

---

### Step 4: Verify Sync

1. Visit https://divij-qa.tech
2. Check that all data matches production:
   - Projects list
   - Blog posts
   - Contact messages
   - Admin login works

---

## 🔄 Future Syncs

After initial setup, you can run the sync anytime:

```bash
./scripts/sync-prod-to-qa.sh
```

**When to sync:**
- Before testing major schema changes
- Weekly (to keep QA fresh)
- After adding significant production data
- When QA gets out of sync

---

## 🧪 Testing Schema Changes on QA

After sync is complete, you can safely test schema changes:

### Example: Add a new column

```bash
# 1. Make change in QA Supabase SQL Editor
# ALTER TABLE blogs ADD COLUMN category TEXT;

# 2. Generate migration from QA
./scripts/db-link-qa.sh
supabase db diff -f add_blog_category

# 3. Review generated migration
cat supabase/migrations/*_add_blog_category.sql

# 4. Test on https://divij-qa.tech

# 5. Commit to git
git add supabase/migrations/
git commit -m "Add blog category column"
git push

# 6. Apply to production
./scripts/db-link-prod.sh
supabase db push
```

---

## 🆘 Troubleshooting

### "Project not linked" error
```bash
./scripts/db-link-qa.sh
```

### "SUPABASE_QA_PROJECT_REF not set"
```bash
./scripts/setup-supabase-refs.sh
```

### "Missing NEXT_PUBLIC_SUPABASE_URL_PROD"
Add all Supabase credentials to `.env.local` (see Step 2)

### Data sync fails with "Unauthorized"
Check that your service role keys are correct in `.env.local`

### Schema sync fails
Manually apply migrations in Supabase SQL Editor, then try again

---

## 📁 Scripts Reference

| Script | Purpose |
|--------|---------|
| `setup-supabase-refs.sh` | Set up project references |
| `sync-prod-to-qa.sh` | **Main sync script** (schema + data) |
| `sync-data.mjs` | Data sync only (Node.js) |
| `db-link-qa.sh` | Link to QA database |
| `db-link-prod.sh` | Link to Production database |

---

## 🎯 Quick Reference

**Initial Setup:**
```bash
# 1. Setup refs
./scripts/setup-supabase-refs.sh

# 2. Add credentials to .env.local (see Step 2)

# 3. Run sync
./scripts/sync-prod-to-qa.sh
```

**Test Schema Changes:**
```bash
# 1. Make changes in QA Dashboard
# 2. Generate migration
./scripts/db-link-qa.sh
supabase db diff -f change_description

# 3. Test on divij-qa.tech

# 4. Apply to production
./scripts/db-link-prod.sh
supabase db push
```

**Re-sync Later:**
```bash
./scripts/sync-prod-to-qa.sh
```

---

## ✅ Checklist

Initial Setup:
- [ ] Run `./scripts/setup-supabase-refs.sh`
- [ ] Add QA and Production credentials to `.env.local`
- [ ] Run `./scripts/sync-prod-to-qa.sh`
- [ ] Verify data on https://divij-qa.tech
- [ ] Test admin login on QA

Ready to Use:
- [ ] QA matches production completely
- [ ] Can make schema changes on QA
- [ ] Can test changes on divij-qa.tech
- [ ] Can push to production when ready

---

You're all set! QA and Production are now in sync. 🎉
