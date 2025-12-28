# Automated Migrations Quick Start

## 🎯 What This Does

Migrations automatically apply to QA and Production when you push to GitHub. No manual SQL needed!

---

## ⚡ Quick Workflow

```bash
# 1. Create migration file
cat > supabase/migrations/$(date +%Y%m%d%H%M%S)_add_feature.sql <<'EOF'
ALTER TABLE public.blogs
ADD COLUMN category TEXT DEFAULT 'general';
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

**That's it! 🎉**

---

## 🔧 One-Time Setup (5 minutes)

### Step 1: Get Supabase Access Token

1. Go to https://supabase.com/dashboard/account/tokens
2. Click "Generate New Token"
3. Name: `github-actions-migrations`
4. Copy the token

### Step 2: Add GitHub Secrets

Go to GitHub → Settings → Secrets → Actions → New repository secret

Add these 5 secrets:

| Secret Name | Where to Find It | Example |
|-------------|------------------|---------|
| `SUPABASE_ACCESS_TOKEN` | Supabase Account → Tokens | `sbp_xxx...` |
| `SUPABASE_QA_PROJECT_REF` | QA Supabase → Settings → General | `mjprqxxkvvoqkjumqdmd` |
| `SUPABASE_PROD_PROJECT_REF` | Prod Supabase → Settings → General | `tksgzjaqlrkqqzecwrxk` |
| `SUPABASE_QA_DB_PASSWORD` | QA Supabase → Settings → Database | (password) |
| `SUPABASE_PROD_DB_PASSWORD` | Prod Supabase → Settings → Database | (password) |

**Detailed guide:** [GITHUB-SECRETS-SETUP.md](./GITHUB-SECRETS-SETUP.md)

---

## 📊 How It Works

```
You push migrations → GitHub Actions
                           ↓
                    Apply to QA (auto)
                           ↓
                    Test on divij-qa.tech
                           ↓
                    Manual Approval Gate
                           ↓
                    Apply to Production (auto)
                           ↓
                    Verify on divij.tech
```

---

## 🧪 Test It

Create a test migration:

```bash
cat > supabase/migrations/$(date +%Y%m%d%H%M%S)_test.sql <<'EOF'
-- Test automated migrations
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS test_automation_works BOOLEAN DEFAULT true;
EOF

git add supabase/migrations/
git commit -m "Test: automated migrations"
git push
```

Then:
1. Go to GitHub → Actions
2. Watch "Database Migrations" workflow run
3. See it apply to QA automatically
4. Click "Review deployments" to approve production
5. Watch it apply to production automatically

---

## 🎯 Real-World Example

**Goal:** Add tags to blog posts

```bash
# 1. Create migration
cat > supabase/migrations/$(date +%Y%m%d%H%M%S)_add_blog_tags.sql <<'EOF'
-- Create tags table
CREATE TABLE IF NOT EXISTS public.blog_tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create junction table
CREATE TABLE IF NOT EXISTS public.blog_tag_relations (
  blog_id UUID REFERENCES public.blogs(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (blog_id, tag_id)
);

-- Enable RLS
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tag_relations ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Tags viewable by everyone"
  ON public.blog_tags FOR SELECT
  USING (true);

CREATE POLICY "Admins manage tags"
  ON public.blog_tags FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));
EOF

# 2. Commit and push
git add supabase/migrations/
git commit -m "Add blog tagging system"
git push

# 3. Wait ~1 minute, check divij-qa.tech
# 4. Approve in GitHub Actions
# 5. Wait ~1 minute, check divij.tech
# 6. Done! ✅
```

---

## 🔍 Monitoring

**View workflow runs:**
- Go to: https://github.com/divijshrivastava/portfolio-v2/actions
- Click: "Database Migrations" workflow
- See: All migration runs and their status

**Approve production deployments:**
1. Go to Actions → Database Migrations → Latest run
2. Click "Review deployments" button
3. Check "production"
4. Click "Approve and deploy"

---

## 💡 Pro Tips

### Tip 1: Migration File Naming
Use descriptive names:
```bash
# Good
20251228120000_add_blog_categories.sql
20251228120100_add_user_preferences.sql

# Bad
20251228120000_migration.sql
20251228120100_changes.sql
```

### Tip 2: Use IF NOT EXISTS
Always make migrations idempotent:
```sql
-- Good (can run multiple times safely)
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS category TEXT;

-- Bad (fails if run twice)
ALTER TABLE blogs ADD COLUMN category TEXT;
```

### Tip 3: Test Locally First
Test migrations on QA before pushing:
```bash
# Link to QA
./scripts/db-link-qa.sh

# Run migration locally
supabase db push

# If it works, commit and push to GitHub
```

### Tip 4: Rollback Plan
Always create rollback migrations:
```bash
# Create rollback migration
cat > supabase/migrations/$(date +%Y%m%d%H%M%S)_rollback_tags.sql <<'EOF'
DROP TABLE IF EXISTS public.blog_tag_relations CASCADE;
DROP TABLE IF EXISTS public.blog_tags CASCADE;
EOF
```

---

## 🆘 Troubleshooting

### Workflow not running?
- Check: GitHub → Actions → "Database Migrations"
- Verify: You pushed files to `supabase/migrations/` folder
- Try: Manually trigger via "Run workflow" button

### "Secret not found" error?
- Check: GitHub → Settings → Secrets → Actions
- Verify: All 5 secrets are added correctly
- Guide: [GITHUB-SECRETS-SETUP.md](./GITHUB-SECRETS-SETUP.md)

### Migration failed?
- Check: GitHub Actions logs for error details
- Fix: The migration SQL
- Retry: Push the fixed migration

### Need to skip approval?
You can't skip it (by design for safety), but you can:
- Remove required reviewers temporarily
- Or manually apply: `./scripts/push-to-prod.sh`

---

## 📚 Documentation

- **Setup:** [GITHUB-SECRETS-SETUP.md](./GITHUB-SECRETS-SETUP.md)
- **Migrations:** [SUPABASE-MIGRATIONS.md](./SUPABASE-MIGRATIONS.md)
- **Workflow:** [.github/workflows/migrate-databases.yml](.github/workflows/migrate-databases.yml)
- **Strategy:** [CICD-STRATEGY.md](./CICD-STRATEGY.md)

---

## ✅ Success Checklist

Setup Complete:
- [ ] Added all 5 GitHub secrets
- [ ] Tested workflow with a test migration
- [ ] Saw QA auto-deploy work
- [ ] Successfully approved production
- [ ] Saw production auto-deploy work

Ready to Use:
- [ ] Can create migration files
- [ ] Can push to GitHub
- [ ] Migrations auto-apply to QA
- [ ] Can approve production
- [ ] Migrations auto-apply to production

---

**You're all set! Future schema changes are just: create file → commit → push → approve** 🚀
