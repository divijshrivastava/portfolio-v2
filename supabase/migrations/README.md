# Database Migrations

This directory contains all database schema migrations tracked by Supabase CLI.

## Migration Naming Convention

Migrations follow the format: `YYYYMMDDHHMMSS_description.sql`

Example: `20251228120000_add_blog_categories.sql`

The timestamp ensures migrations are applied in the correct order.

---

## How to Create a New Migration

### Method 1: Auto-generate from Database Changes (Recommended)

1. Make changes in QA Supabase Dashboard (SQL Editor)
2. Generate migration from the changes:
   ```bash
   ./scripts/db-link-qa.sh
   supabase db diff -f describe_your_change
   ```
3. Review the generated migration in `supabase/migrations/`
4. Test and commit

### Method 2: Create Manual Migration

```bash
supabase migration new add_feature_name
```

This creates a new timestamped migration file that you can edit.

---

## How to Apply Migrations

### To QA Environment

```bash
# Link to QA
./scripts/db-link-qa.sh

# Apply all pending migrations
supabase db push
```

### To Production Environment

```bash
# Link to Production
./scripts/db-link-prod.sh

# Apply all pending migrations (requires confirmation)
supabase db push
```

---

## Check Migration Status

```bash
# List local migrations
supabase migration list

# List applied migrations on linked database
supabase db remote list

# Check what would be applied
supabase db diff
```

---

## Existing Migrations

### `20251225191500_add_slug_to_projects.sql`
**Purpose:** Adds SEO-friendly slug column to projects table
- Adds `slug` column (TEXT, unique)
- Creates index for faster lookups
- Applied: ✅ QA and Production

### `20251226160400_add_professional_project_fields.sql`
**Purpose:** Adds professional work experience fields to projects
- Adds `project_type` (professional/side)
- Adds `company`, `start_date`, `end_date`
- Adds `tech_stack`, `detailed_content`
- Applied: ✅ QA and Production

### `20251226163500_add_featured_column.sql`
**Purpose:** Adds featured project support for homepage
- Adds `featured` boolean flag
- Adds `featured_description` for homepage display
- Applied: ✅ QA and Production

---

## Workflow Example

```bash
# 1. Make schema changes in QA Supabase Dashboard
# ... (add column, create table, etc.) ...

# 2. Generate migration from QA changes
./scripts/db-link-qa.sh
supabase db diff -f add_blog_categories

# 3. Review generated migration
cat supabase/migrations/*_add_blog_categories.sql

# 4. Test on QA (already applied since we diffed from QA)
# Visit https://divij-qa.tech and test thoroughly

# 5. Commit to git
git add supabase/migrations/
git commit -m "Add blog categories migration"
git push

# 6. Apply to Production
./scripts/db-link-prod.sh
supabase db push

# 7. Verify on production
# Visit https://divij.tech
```

---

## Rollback

Supabase CLI doesn't have automatic rollback. To rollback:

### Option 1: Create Reverse Migration
```bash
supabase migration new rollback_feature_name
# Edit the file to reverse the changes
supabase db push
```

### Option 2: Manual SQL
Run reverse SQL in Supabase Dashboard SQL Editor

### Option 3: Restore from Backup
Use Supabase Dashboard → Database → Backups (last resort)

---

## Best Practices

1. ✅ **Always test on QA first** before applying to production
2. ✅ **Use `IF NOT EXISTS`** for tables/columns to make migrations idempotent
3. ✅ **Use `IF EXISTS`** for DROP statements
4. ✅ **Commit migrations to git** immediately after creating them
5. ✅ **Never edit applied migrations** - create new ones instead
6. ✅ **Test rollback strategy** for critical migrations
7. ✅ **Document what each migration does** in comments

---

## Related Documentation

- [SUPABASE-MIGRATIONS.md](../../SUPABASE-MIGRATIONS.md) - Complete Supabase migration guide
- [MIGRATIONS.md](../../MIGRATIONS.md) - Manual migration workflow
- [MIGRATION-TOOLS-COMPARISON.md](../../MIGRATION-TOOLS-COMPARISON.md) - Tool comparison
- [SYNC-DATABASES.md](../../SYNC-DATABASES.md) - Database sync guide
