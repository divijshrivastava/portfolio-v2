# Database Migrations Guide

## 🎯 Goal: Test Schema Changes on QA, Then Apply to Production

This guide shows you how to manage DDL (Data Definition Language) changes safely:
- ✅ Test schema changes on QA first
- ✅ Verify application works with new schema
- ✅ Apply same changes to production
- ✅ Version control all schema changes
- ✅ Rollback capability if needed

---

## 📋 Migration Workflow

```
1. Create Migration File (SQL)
   ↓
2. Apply to QA Database
   ↓
3. Test on QA (divij-qa.tech)
   ↓
4. Commit Migration to Git
   ↓
5. Deploy Code to QA (CI/CD)
   ↓
6. Verify Everything Works
   ↓
7. Apply to Production Database
   ↓
8. Deploy Code to Production (CI/CD)
   ↓
9. Verify Production
```

---

## 🗂️ Migration File Structure

All migration files live in `migrations/` folder:

```
migrations/
├── 001_initial_schema.sql          # Your current schema
├── 002_add_blog_tags.sql            # Example: Add tags to blogs
├── 003_add_project_metrics.sql      # Example: Add view counts
├── README.md                        # Migration log
└── rollback/
    ├── 002_rollback.sql             # Rollback for migration 002
    └── 003_rollback.sql             # Rollback for migration 003
```

---

## 📝 Creating a Migration

### Step 1: Create Migration File

Create a new file: `migrations/XXX_description.sql`

**Naming convention:**
- `001`, `002`, `003` - Sequential number
- `_description` - What it does
- Example: `004_add_blog_categories.sql`

**Template:**

```sql
-- Migration: 004_add_blog_categories.sql
-- Description: Add category support to blogs
-- Author: Divij Shrivastava
-- Date: 2025-12-28
-- Dependencies: 001_initial_schema.sql

-- ============================================
-- UP Migration (apply changes)
-- ============================================

-- Add categories table
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add category_id to blogs
ALTER TABLE public.blogs
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.blog_categories(id);

-- Create index
CREATE INDEX IF NOT EXISTS blogs_category_id_idx ON public.blogs(category_id);

-- Enable RLS
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Blog categories are viewable by everyone"
  ON public.blog_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.blog_categories FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

-- Insert default categories
INSERT INTO public.blog_categories (name, slug, description)
VALUES
  ('Technology', 'technology', 'Tech articles and tutorials'),
  ('Personal', 'personal', 'Personal thoughts and experiences'),
  ('Career', 'career', 'Career advice and insights')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- Verification
-- ============================================

-- Verify table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'blog_categories'
) as blog_categories_exists;

-- Verify column exists
SELECT EXISTS (
  SELECT FROM information_schema.columns
  WHERE table_schema = 'public'
  AND table_name = 'blogs'
  AND column_name = 'category_id'
) as category_id_column_exists;

-- Show categories
SELECT * FROM public.blog_categories;
```

---

### Step 2: Create Rollback Migration

Create: `migrations/rollback/004_rollback.sql`

```sql
-- Rollback: 004_add_blog_categories.sql
-- Description: Remove blog categories feature
-- Date: 2025-12-28

-- ============================================
-- DOWN Migration (rollback changes)
-- ============================================

-- Remove category_id from blogs
ALTER TABLE public.blogs
DROP COLUMN IF EXISTS category_id;

-- Drop blog_categories table
DROP TABLE IF EXISTS public.blog_categories CASCADE;

-- Verification
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'blog_categories'
) as blog_categories_still_exists;  -- Should be false
```

---

## 🧪 Testing Migration on QA

### Step 1: Apply Migration to QA

1. **Go to QA Supabase** → **SQL Editor**
2. **New query**
3. **Copy entire migration file** (`004_add_blog_categories.sql`)
4. **Run**
5. **Check verification output** - should show `true`

### Step 2: Test Application on QA

1. **Deploy code to QA** (if you have UI changes)
2. **Visit https://divij-qa.tech**
3. **Test the feature:**
   - Create new blog with category
   - Edit existing blog
   - View blogs by category
   - Verify everything works

### Step 3: Test Rollback (Optional)

1. **In QA SQL Editor**
2. **Run rollback migration** (`004_rollback.sql`)
3. **Verify rollback worked**
4. **Re-apply forward migration** to continue testing

---

## 🚀 Applying to Production

### Only After QA Testing is Complete!

1. **Go to Production Supabase** → **SQL Editor**
2. **New query**
3. **Copy EXACT SAME migration file** used in QA
4. **Run**
5. **Verify output**
6. **Test production site:** https://divij.tech

---

## 📦 Common Migration Examples

### Example 1: Add Column

```sql
-- Add view_count to projects
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Verify
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'projects' AND column_name = 'view_count';
```

### Example 2: Modify Column

```sql
-- Make blog summary longer
ALTER TABLE public.blogs
ALTER COLUMN summary TYPE TEXT;

-- Add constraint
ALTER TABLE public.blogs
ADD CONSTRAINT summary_length CHECK (length(summary) <= 500);
```

### Example 3: Add Index

```sql
-- Add index for faster searches
CREATE INDEX IF NOT EXISTS blogs_title_search_idx
ON public.blogs USING GIN (to_tsvector('english', title));

-- Verify
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'blogs' AND indexname = 'blogs_title_search_idx';
```

### Example 4: Add New Table with Relations

```sql
-- Create blog_comments table
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  blog_id UUID REFERENCES public.blogs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS blog_comments_blog_id_idx ON public.blog_comments(blog_id);
CREATE INDEX IF NOT EXISTS blog_comments_user_id_idx ON public.blog_comments(user_id);

-- Enable RLS
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Approved comments are viewable by everyone"
  ON public.blog_comments FOR SELECT
  USING (status = 'approved' OR user_id = auth.uid());

CREATE POLICY "Users can create comments"
  ON public.blog_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Example 5: Modify Enum/Check Constraint

```sql
-- Add new status to blogs
ALTER TABLE public.blogs
DROP CONSTRAINT IF EXISTS blogs_status_check;

ALTER TABLE public.blogs
ADD CONSTRAINT blogs_status_check
CHECK (status IN ('draft', 'published', 'archived', 'scheduled'));
```

---

## 🔄 Migration Checklist

### Before Creating Migration:
- [ ] Understand what schema change is needed
- [ ] Check existing schema in production
- [ ] Plan backward compatibility if needed
- [ ] Write migration SQL
- [ ] Write rollback SQL
- [ ] Test locally if possible

### Testing on QA:
- [ ] Apply migration to QA database
- [ ] Verify migration ran successfully
- [ ] Test application features on QA
- [ ] Test edge cases
- [ ] Verify data integrity
- [ ] Test rollback (optional)
- [ ] Re-apply migration after rollback

### Applying to Production:
- [ ] Migration tested thoroughly on QA
- [ ] Code changes deployed and tested on QA
- [ ] Backup production database (Supabase auto-backups)
- [ ] Apply migration to production
- [ ] Verify migration output
- [ ] Test production site immediately
- [ ] Monitor logs for errors
- [ ] Have rollback ready if needed

---

## 🆘 Rollback Strategy

### If Migration Fails on Production:

**Option 1: Rollback via SQL**
```sql
-- Run the rollback migration
-- Example: migrations/rollback/004_rollback.sql
```

**Option 2: Supabase Point-in-Time Recovery**
1. Go to Production Supabase → Database → Backups
2. Restore to time before migration
3. Re-plan the migration

**Option 3: Manual Rollback**
```sql
-- Manually undo changes
ALTER TABLE public.blogs DROP COLUMN category_id;
DROP TABLE public.blog_categories;
```

---

## 🔒 Safe Migration Practices

### ✅ DO:
- ✅ Always test on QA first
- ✅ Use `IF NOT EXISTS` / `IF EXISTS`
- ✅ Use transactions for complex migrations
- ✅ Add constraints with `NOT VALID` first, validate later
- ✅ Create indexes `CONCURRENTLY`
- ✅ Version control all migrations
- ✅ Document dependencies between migrations

### ❌ DON'T:
- ❌ Never test directly on production
- ❌ Don't drop columns with data without backup
- ❌ Don't change column types without testing
- ❌ Don't remove constraints without understanding impact
- ❌ Don't run long-running migrations during peak hours

---

## 📊 Migration Log

Keep a log in `migrations/README.md`:

```markdown
# Migration History

## 001_initial_schema.sql
- Date: 2025-01-01
- Status: ✅ Applied to QA and Production
- Description: Initial database schema

## 002_add_blog_tags.sql
- Date: 2025-01-15
- Status: ✅ Applied to QA and Production
- Description: Add tagging system for blogs

## 003_add_project_metrics.sql
- Date: 2025-02-01
- Status: ✅ Applied to QA, ⏳ Pending Production
- Description: Add view counts and metrics to projects

## 004_add_blog_categories.sql
- Date: 2025-02-15
- Status: 🧪 Testing on QA
- Description: Add category support for blog organization
```

---

## 🤖 Automated Migration Tracking (Advanced)

Create a migrations tracking table:

```sql
-- Create migrations table
CREATE TABLE IF NOT EXISTS public.schema_migrations (
  id SERIAL PRIMARY KEY,
  migration_name TEXT UNIQUE NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  applied_by TEXT,
  checksum TEXT,
  notes TEXT
);

-- Track migration
INSERT INTO public.schema_migrations (migration_name, applied_by, notes)
VALUES ('004_add_blog_categories.sql', 'divij', 'Added category support');

-- View migration history
SELECT * FROM public.schema_migrations ORDER BY applied_at DESC;
```

---

## 🎯 Quick Reference

### Test Migration on QA:
```bash
1. Write migration SQL in migrations/XXX_description.sql
2. Apply to QA Supabase (SQL Editor)
3. Test on https://divij-qa.tech
4. Commit to Git
```

### Apply to Production:
```bash
1. Migration tested on QA ✅
2. Code deployed to QA ✅
3. Apply same SQL to Production Supabase
4. Verify on https://divij.tech
```

### Rollback:
```bash
1. Run migrations/rollback/XXX_rollback.sql
2. Or restore from Supabase backup
```

---

## 📚 Related Guides

- [SYNC-DATABASES.md](./SYNC-DATABASES.md) - Sync production data to QA
- [ENVIRONMENTS.md](./ENVIRONMENTS.md) - QA and Production workflow
- [CICD-STRATEGY.md](./CICD-STRATEGY.md) - Complete CI/CD pipeline
