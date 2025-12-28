# Supabase Migration System (Recommended)

## 🎯 Why Use Supabase Migrations

Supabase has **built-in migration tracking** that:
- ✅ Automatically tracks which migrations have been applied
- ✅ Stores migrations in version control (`supabase/migrations/` folder)
- ✅ Generates migrations from schema changes automatically
- ✅ Works seamlessly with QA → Production workflow
- ✅ No additional dependencies (just Supabase CLI)
- ✅ Native PostgreSQL support

---

## 📦 Setup

### 1. Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Or via npm (cross-platform)
npm install -g supabase
```

### 2. Initialize Supabase in Your Project

```bash
# Run from project root
supabase init

# This creates:
# supabase/
# ├── config.toml
# └── migrations/
```

### 3. Link to Your Supabase Projects

```bash
# Link to QA project
supabase link --project-ref YOUR_QA_PROJECT_REF

# Get project ref from: QA Supabase Dashboard → Settings → General → Reference ID
```

---

## 🔄 Migration Workflow

### Scenario 1: Create Migration from Schema Changes

**Step 1: Make changes in QA Supabase (SQL Editor)**
```sql
-- Make your changes in QA Supabase Dashboard
ALTER TABLE public.blogs
ADD COLUMN category TEXT DEFAULT 'general';

CREATE INDEX blogs_category_idx ON public.blogs(category);
```

**Step 2: Generate migration file from QA database**
```bash
# This compares your QA database with local migrations and generates a new migration
supabase db diff -f add_blog_category --linked

# Creates: supabase/migrations/20251228123456_add_blog_category.sql
```

**Step 3: Review generated migration**
```bash
# Check the generated SQL
cat supabase/migrations/*_add_blog_category.sql
```

**Step 4: Commit to git**
```bash
git add supabase/migrations/
git commit -m "Add blog category column and index"
git push
```

**Step 5: Apply to Production**
```bash
# Link to production project
supabase link --project-ref YOUR_PROD_PROJECT_REF

# Push migration to production
supabase db push --linked

# Confirms: "Do you want to push these migrations to production?"
# Answer: yes
```

**Step 6: Verify**
```bash
# Check migration history on production
supabase db remote list
```

---

### Scenario 2: Create Migration Manually

**Step 1: Create new migration file**
```bash
supabase migration new add_blog_tags
# Creates: supabase/migrations/20251228123456_add_blog_tags.sql
```

**Step 2: Write your SQL**
```sql
-- supabase/migrations/20251228123456_add_blog_tags.sql

-- Create tags table
CREATE TABLE IF NOT EXISTS public.blog_tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create junction table for many-to-many
CREATE TABLE IF NOT EXISTS public.blog_tag_relations (
  blog_id UUID REFERENCES public.blogs(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (blog_id, tag_id)
);

-- Add indexes
CREATE INDEX blog_tag_relations_blog_id_idx ON public.blog_tag_relations(blog_id);
CREATE INDEX blog_tag_relations_tag_id_idx ON public.blog_tag_relations(tag_id);

-- Enable RLS
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tag_relations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Tags are viewable by everyone"
  ON public.blog_tags FOR SELECT
  USING (true);

CREATE POLICY "Tag relations are viewable by everyone"
  ON public.blog_tag_relations FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage tags"
  ON public.blog_tags FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));
```

**Step 3: Test on QA first**
```bash
# Link to QA
supabase link --project-ref YOUR_QA_PROJECT_REF

# Apply to QA
supabase db push --linked
```

**Step 4: Test on divij-qa.tech**
- Verify tables exist
- Test creating tags
- Test tag relations
- Test RLS policies

**Step 5: Apply to Production (after QA validation)**
```bash
# Link to production
supabase link --project-ref YOUR_PROD_PROJECT_REF

# Apply to production
supabase db push --linked
```

**Step 6: Commit**
```bash
git add supabase/migrations/
git commit -m "Add blog tags system"
git push
```

---

## 📋 Common Commands

### Check Migration Status
```bash
# List local migrations
supabase migration list

# List applied migrations on linked database
supabase db remote list

# Compare local vs remote
supabase db diff
```

### Generate Migration from Changes
```bash
# Generate migration from current database state
supabase db diff -f migration_name --linked

# This compares your linked database with your local migrations
# and generates SQL for the differences
```

### Apply Migrations
```bash
# Apply all pending migrations to linked database
supabase db push --linked

# Apply specific migration
supabase db push --linked --file supabase/migrations/20251228123456_migration.sql
```

### Reset Database (QA only!)
```bash
# ⚠️ WARNING: Only for QA, never production!
supabase db reset --linked

# This drops and recreates database, applying all migrations from scratch
```

---

## 🔄 QA → Production Workflow

### Full Workflow Example

```bash
# 1. Make changes in QA Supabase Dashboard (or create migration manually)
# ... make your DDL changes in QA SQL Editor ...

# 2. Generate migration from QA database
supabase link --project-ref QA_PROJECT_REF
supabase db diff -f describe_your_change --linked

# 3. Review generated migration
cat supabase/migrations/*_describe_your_change.sql

# 4. Test on QA (it's already applied since we generated from QA)
# Visit https://divij-qa.tech and test thoroughly

# 5. Commit to git
git add supabase/migrations/
git commit -m "Add: describe your change"
git push

# 6. Apply to Production
supabase link --project-ref PROD_PROJECT_REF
supabase db push --linked

# 7. Verify on production
# Visit https://divij.tech and verify
```

---

## 📊 How It Tracks Changes

Supabase creates a table called `supabase_migrations.schema_migrations`:

```sql
-- Check applied migrations
SELECT * FROM supabase_migrations.schema_migrations
ORDER BY version;
```

Each migration has:
- `version`: Timestamp from filename (20251228123456)
- `name`: Migration name
- `statements`: Array of SQL statements executed

This is similar to Liquibase's DATABASECHANGELOG but simpler.

---

## 🔙 Rollback Strategy

Supabase migrations don't have automatic rollback, but you can:

### Option 1: Create Rollback Migration
```bash
# Create new migration that undoes changes
supabase migration new rollback_add_blog_category

# Edit the file to reverse changes:
ALTER TABLE public.blogs DROP COLUMN category;
DROP INDEX blogs_category_idx;

# Apply rollback
supabase db push --linked
```

### Option 2: Manual Rollback (Production Emergency)
```sql
-- Run in Production SQL Editor
ALTER TABLE public.blogs DROP COLUMN category;
DROP INDEX blogs_category_idx;

-- Then generate migration to keep in sync
supabase db diff -f rollback_blog_category --linked
git add supabase/migrations/
git commit -m "Rollback: remove blog category"
```

### Option 3: Point-in-Time Recovery (Last Resort)
```bash
# Use Supabase Dashboard → Database → Backups
# Restore to time before migration
```

---

## 🔐 Storing Project References Securely

**Don't commit project refs to git!** Store them as environment variables:

```bash
# .env.local (gitignored)
SUPABASE_QA_PROJECT_REF=xxxxxxxxxxxxx
SUPABASE_PROD_PROJECT_REF=yyyyyyyyyyy
```

**Create helper scripts:**

```bash
# scripts/db-link-qa.sh
#!/bin/bash
source .env.local
supabase link --project-ref $SUPABASE_QA_PROJECT_REF

# scripts/db-link-prod.sh
#!/bin/bash
source .env.local
supabase link --project-ref $SUPABASE_PROD_PROJECT_REF
```

Then use:
```bash
./scripts/db-link-qa.sh
supabase db push --linked
```

---

## 🆚 Comparison: Supabase CLI vs Liquibase

| Feature | Supabase CLI | Liquibase |
|---------|-------------|-----------|
| **Setup** | `brew install supabase` | Requires Java + Liquibase |
| **Tracking** | `schema_migrations` table | `DATABASECHANGELOG` table |
| **Format** | SQL only | XML/YAML/JSON/SQL |
| **Auto-generation** | ✅ `supabase db diff` | ✅ Schema snapshots |
| **Rollback** | Manual (create reverse migration) | ✅ Built-in |
| **Version Control** | ✅ Git-based | ✅ Git-based |
| **Learning Curve** | Low (just SQL) | Medium (XML/YAML + concepts) |
| **Best For** | Supabase projects | Enterprise/multi-DB |
| **Cost** | Free | Free (open source) |

---

## ✅ Recommended Approach for Your Project

**Use Supabase CLI** because:
1. ✅ You're already using Supabase
2. ✅ Simpler than Liquibase for solo project
3. ✅ No additional dependencies (just CLI)
4. ✅ Native integration with your QA and Prod databases
5. ✅ Automatic tracking of applied migrations
6. ✅ Git-based version control
7. ✅ Can generate migrations from schema changes

**Reserve Liquibase for:**
- Large teams needing complex change management
- Multi-database support (MySQL, Oracle, etc.)
- Enterprise compliance requirements
- Advanced features like preconditions, contexts, labels

---

## 🚀 Getting Started

```bash
# 1. Install Supabase CLI
brew install supabase/tap/supabase

# 2. Initialize in your project
cd /Users/divij/code/ai/divij-tech/portfolio-v2
supabase init

# 3. Link to QA
supabase link --project-ref YOUR_QA_PROJECT_REF

# 4. Generate migration from current QA schema (one-time)
supabase db diff -f initial_schema --linked

# 5. Commit
git add supabase/
git commit -m "Add Supabase migration tracking"

# 6. You're ready! Next time you make changes:
# - Change in QA → supabase db diff → commit → push to prod
```

---

## 📚 Resources

- [Supabase Migrations Docs](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli/introduction)
- [Migration Best Practices](https://supabase.com/docs/guides/database/migrations)
