# GitHub Secrets Setup for Automated Migrations

## 🎯 Goal

Set up GitHub secrets so that migrations automatically apply to QA and Production databases when you push to GitHub.

---

## 📋 Required GitHub Secrets

You need to add 5 secrets to your GitHub repository:

### 1. SUPABASE_ACCESS_TOKEN
**What it is:** Personal access token for Supabase CLI

**How to get it:**
1. Go to https://supabase.com/dashboard/account/tokens
2. Click "Generate New Token"
3. Name it: `github-actions-migrations`
4. Copy the token (you'll only see it once!)

**Value:** `sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

### 2. SUPABASE_QA_PROJECT_REF
**What it is:** Reference ID for your QA Supabase project

**How to get it:**
1. Go to QA Supabase Dashboard
2. Settings → General
3. Copy "Reference ID"

**Value:** `mjprqxxkvvoqkjumqdmd`

---

### 3. SUPABASE_PROD_PROJECT_REF
**What it is:** Reference ID for your Production Supabase project

**How to get it:**
1. Go to Production Supabase Dashboard
2. Settings → General
3. Copy "Reference ID"

**Value:** `tksgzjaqlrkqqzecwrxk`

---

### 4. SUPABASE_QA_DB_PASSWORD
**What it is:** Database password for QA Supabase

**How to get it:**
1. Go to QA Supabase Dashboard
2. Settings → Database
3. Under "Connection string", click "Show password"
4. Copy the database password

**Value:** `your_qa_database_password`

---

### 5. SUPABASE_PROD_DB_PASSWORD
**What it is:** Database password for Production Supabase

**How to get it:**
1. Go to Production Supabase Dashboard
2. Settings → Database
3. Under "Connection string", click "Show password"
4. Copy the database password

**Value:** `your_prod_database_password`

---

## 🔧 How to Add Secrets to GitHub

1. Go to your GitHub repository: https://github.com/divijshrivastava/portfolio-v2
2. Click **Settings** (top menu)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret**
5. Add each of the 5 secrets above:
   - Name: `SUPABASE_ACCESS_TOKEN`
   - Secret: `sbp_xxxxx...`
   - Click **Add secret**
6. Repeat for all 5 secrets

---

## ✅ Verification Checklist

After adding secrets, verify you have:

- [ ] SUPABASE_ACCESS_TOKEN
- [ ] SUPABASE_QA_PROJECT_REF
- [ ] SUPABASE_PROD_PROJECT_REF
- [ ] SUPABASE_QA_DB_PASSWORD
- [ ] SUPABASE_PROD_DB_PASSWORD

---

## 🧪 Test the Workflow

Once secrets are added, test the workflow:

### Option 1: Create a test migration

```bash
# Create a test migration file
cat > supabase/migrations/$(date +%Y%m%d%H%M%S)_test_automation.sql <<'EOF'
-- Test migration for automated workflow
-- This adds a test column that we can remove later

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS test_column TEXT;

-- Verify
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'projects'
      AND column_name = 'test_column'
  ) THEN
    RAISE NOTICE 'SUCCESS: test_column exists';
  ELSE
    RAISE EXCEPTION 'FAILED: test_column not found';
  END IF;
END $$;
EOF

# Commit and push
git add supabase/migrations/
git commit -m "Test automated migration workflow"
git push
```

### Option 2: Manually trigger workflow

1. Go to GitHub → Actions
2. Click "Database Migrations" workflow
3. Click "Run workflow" → "Run workflow"

---

## 📊 Expected Workflow

After pushing migrations to GitHub:

```
1. Push migration files to GitHub
   ↓
2. GitHub Actions triggers
   ↓
3. Migrations auto-apply to QA ✅
   ↓
4. Verify on https://divij-qa.tech
   ↓
5. Go to GitHub Actions → Click "Review deployments"
   ↓
6. Approve production deployment ✅
   ↓
7. Migrations auto-apply to Production ✅
   ↓
8. Verify on https://divij.tech
```

**Total time:** ~2-3 minutes (most is waiting for approval)

---

## 🆘 Troubleshooting

### "SUPABASE_ACCESS_TOKEN not found"
- Make sure you added the secret in GitHub Settings → Secrets
- Check the name is exactly: `SUPABASE_ACCESS_TOKEN`
- Regenerate token if needed: https://supabase.com/dashboard/account/tokens

### "Invalid project ref"
- Verify project refs are exactly 20 characters
- QA: `mjprqxxkvvoqkjumqdmd`
- Prod: `tksgzjaqlrkqqzecwrxk`

### "Authentication failed"
- Check database passwords are correct
- Go to Supabase Dashboard → Settings → Database → Show password

### "Migration already applied"
- This is normal if you manually applied it before
- The workflow will skip already-applied migrations

---

## 🎉 Once Setup is Complete

Your workflow will be:

```bash
# 1. Create migration file
# supabase/migrations/YYYYMMDDHHMMSS_description.sql

# 2. Commit and push
git add supabase/migrations/
git commit -m "Add feature X schema"
git push

# 3. Wait for QA auto-deploy (~1 minute)
# 4. Test on divij-qa.tech
# 5. Approve in GitHub Actions
# 6. Wait for Production auto-deploy (~1 minute)
# 7. Verify on divij.tech
```

**That's it! No manual SQL needed.** 🚀

---

## 📚 Related Documentation

- [SUPABASE-MIGRATIONS.md](./SUPABASE-MIGRATIONS.md) - Migration guide
- [ENVIRONMENTS.md](./ENVIRONMENTS.md) - QA and Production workflow
- [CICD-STRATEGY.md](./CICD-STRATEGY.md) - Complete CI/CD pipeline
