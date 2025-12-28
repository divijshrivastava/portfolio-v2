# Supabase Migrations Quick Start

Your Supabase migration system is now initialized and ready to use!

## 🚀 Initial Setup (One-Time)

### 1. Add Project References to .env.local

Get your project references from Supabase Dashboard:
- QA: Settings → General → Reference ID
- Production: Settings → General → Reference ID

Add to `.env.local`:
```bash
# Supabase Project References
SUPABASE_QA_PROJECT_REF=xxxxxxxxxxxxx
SUPABASE_PROD_PROJECT_REF=yyyyyyyyyyy
```

### 2. Verify Setup

```bash
# Link to QA
./scripts/db-link-qa.sh

# Check migrations status
supabase migration list
```

---

## 📝 Common Workflows

### Create a New Migration

**Method 1: Auto-generate from QA changes (Recommended)**

```bash
# 1. Make changes in QA Supabase Dashboard (SQL Editor)
# For example: ALTER TABLE blogs ADD COLUMN category TEXT;

# 2. Link to QA and generate migration
./scripts/db-link-qa.sh
supabase db diff -f add_blog_category

# 3. Review the generated file
cat supabase/migrations/*_add_blog_category.sql

# 4. Test on QA (visit https://divij-qa.tech)

# 5. Commit
git add supabase/migrations/
git commit -m "Add blog category column"
git push
```

**Method 2: Create manual migration**

```bash
# 1. Create new migration file
supabase migration new add_feature_name

# 2. Edit the generated file in supabase/migrations/
# Add your SQL

# 3. Apply to QA
./scripts/db-link-qa.sh
supabase db push

# 4. Test on https://divij-qa.tech
```

---

### Apply Migration to Production

```bash
# After testing on QA:

# 1. Link to Production
./scripts/db-link-prod.sh

# 2. Apply migrations
supabase db push

# 3. Verify on https://divij.tech

# 4. Switch back to QA
./scripts/db-link-qa.sh
```

---

### Check Migration Status

```bash
# Link to environment
./scripts/db-link-qa.sh
# or
./scripts/db-link-prod.sh

# List local migrations
supabase migration list

# List applied migrations on database
supabase db remote list

# Check for differences
supabase db diff
```

---

## 🔄 Complete Workflow Example

**Scenario: Add tags to blog posts**

```bash
# 1. Make changes in QA Supabase SQL Editor
# CREATE TABLE blog_tags (...);
# CREATE TABLE blog_tag_relations (...);

# 2. Generate migration from QA
./scripts/db-link-qa.sh
supabase db diff -f add_blog_tags

# 3. Review generated migration
cat supabase/migrations/*_add_blog_tags.sql

# 4. Test on QA
# Visit https://divij-qa.tech
# Test creating tags, assigning to blogs, etc.

# 5. Commit to git
git add supabase/migrations/
git commit -m "Add blog tags feature"
git push

# This triggers CI/CD:
# → Tests run
# → QA auto-deploys
# → Manual approval gate
# → Production deploys

# 6. Apply migration to Production database
./scripts/db-link-prod.sh
supabase db push

# 7. Verify on https://divij.tech
```

---

## 🆘 Troubleshooting

### "Project not linked" error

```bash
# Link to QA
./scripts/db-link-qa.sh

# Or Production
./scripts/db-link-prod.sh
```

### "SUPABASE_QA_PROJECT_REF not set" error

Add project references to `.env.local`:
```bash
SUPABASE_QA_PROJECT_REF=your_qa_ref
SUPABASE_PROD_PROJECT_REF=your_prod_ref
```

### Check which project you're linked to

```bash
cat .supabase/config.toml | grep project_ref
```

### Rollback a migration

```bash
# Option 1: Create reverse migration
supabase migration new rollback_feature_name
# Edit file to reverse changes
supabase db push

# Option 2: Manual SQL in Supabase Dashboard
# Run DROP/ALTER statements to reverse changes

# Option 3: Restore from backup (last resort)
# Supabase Dashboard → Database → Backups
```

---

## 📁 File Structure

```
portfolio-v2/
├── supabase/
│   ├── config.toml                    # Supabase configuration
│   ├── migrations/                     # All migrations
│   │   ├── 20251225191500_add_slug_to_projects.sql
│   │   ├── 20251226160400_add_professional_project_fields.sql
│   │   ├── 20251226163500_add_featured_column.sql
│   │   └── README.md                  # Migration documentation
│   └── .gitignore
├── scripts/
│   ├── db-link-qa.sh                  # Link to QA database
│   └── db-link-prod.sh                # Link to Production database
├── .env.local                         # Contains project refs (gitignored)
└── .env.local.example                 # Template with instructions
```

---

## 🎯 Best Practices

1. ✅ **Always test on QA first**
   - Make changes in QA
   - Generate migration
   - Test thoroughly
   - Then apply to Production

2. ✅ **Use descriptive migration names**
   ```bash
   # Good
   supabase db diff -f add_blog_categories
   supabase db diff -f add_user_preferences

   # Bad
   supabase db diff -f changes
   supabase db diff -f update
   ```

3. ✅ **Make migrations idempotent**
   ```sql
   -- Use IF NOT EXISTS
   ALTER TABLE blogs ADD COLUMN IF NOT EXISTS category TEXT;

   -- Use IF EXISTS for drops
   DROP TABLE IF EXISTS old_table;
   ```

4. ✅ **Commit immediately**
   ```bash
   git add supabase/migrations/
   git commit -m "Add: descriptive message"
   git push
   ```

5. ✅ **Document complex migrations**
   ```sql
   -- Migration: Add blog categories
   -- Purpose: Allow blog posts to be organized by category
   -- Dependencies: Requires existing blogs table
   -- Rollback: Drop blog_categories table and category_id column

   CREATE TABLE blog_categories (...);
   ```

---

## 📚 Documentation

- **[supabase/migrations/README.md](./supabase/migrations/README.md)** - Detailed migration guide
- **[SUPABASE-MIGRATIONS.md](./SUPABASE-MIGRATIONS.md)** - Complete Supabase CLI guide
- **[MIGRATIONS.md](./MIGRATIONS.md)** - Manual migration workflow
- **[MIGRATION-TOOLS-COMPARISON.md](./MIGRATION-TOOLS-COMPARISON.md)** - Tool comparison

---

## 🎉 You're Ready!

Your migration system is now set up with:
- ✅ Supabase CLI initialized
- ✅ Existing migrations renamed to proper format
- ✅ Helper scripts for QA and Production
- ✅ Documentation and guides
- ✅ Git-based version control

Start creating migrations with:
```bash
./scripts/db-link-qa.sh
supabase migration new your_feature_name
```

Happy migrating! 🚀
