# Database Sync Guide: Production → QA

This guide shows you how to mirror your production database to QA for proper testing.

## ⚠️ Important Safety Rules

1. **NEVER** sync from QA to Production (data loss!)
2. **ALWAYS** sync Production → QA (safe)
3. **BACKUP** production before major changes
4. **TEST** on QA before deploying to production

---

## 🎯 What Gets Synced

### ✅ Data to Sync:
- ✅ Projects (all published and draft projects)
- ✅ Blogs (all blog posts)
- ✅ Messages (contact form submissions)
- ✅ Profiles (user profiles and admin flags)

### ❌ Data NOT Synced (for security):
- ❌ Auth users (passwords) - these stay separate
- ❌ Storage files (images) - too large, not needed for testing
- ❌ Realtime subscriptions
- ❌ Edge functions

---

## 📋 Method 1: Manual SQL Sync (Easiest - 10 minutes)

### Step 1: Export from Production

1. Go to **Production Supabase Dashboard**
2. Open **SQL Editor**
3. Run this export query:

```sql
-- ============================================
-- EXPORT PRODUCTION DATA
-- Copy the results and save them
-- ============================================

-- Export Projects
SELECT json_agg(row_to_json(projects.*)) as projects_data
FROM public.projects;

-- Export Blogs
SELECT json_agg(row_to_json(blogs.*)) as blogs_data
FROM public.blogs;

-- Export Messages
SELECT json_agg(row_to_json(messages.*)) as messages_data
FROM public.messages;

-- Export Profiles (admin users)
SELECT json_agg(row_to_json(profiles.*)) as profiles_data
FROM public.profiles;
```

4. **Copy each result** and save to text files:
   - `projects.json`
   - `blogs.json`
   - `messages.json`
   - `profiles.json`

### Step 2: Import to QA

1. Go to **QA Supabase Dashboard**
2. Open **SQL Editor**
3. Run this import script:

```sql
-- ============================================
-- IMPORT TO QA - CLEAR AND IMPORT
-- WARNING: This deletes all QA data first!
-- ============================================

-- Disable RLS temporarily for bulk import
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Clear existing QA data
TRUNCATE public.projects CASCADE;
TRUNCATE public.blogs CASCADE;
TRUNCATE public.messages CASCADE;
-- Don't truncate profiles - we'll upsert to keep admin users

-- Import Projects
-- Replace 'YOUR_PROJECTS_JSON_HERE' with the actual JSON from step 1
INSERT INTO public.projects
SELECT * FROM json_populate_recordset(NULL::public.projects,
  'YOUR_PROJECTS_JSON_HERE'::json
);

-- Import Blogs
-- Replace 'YOUR_BLOGS_JSON_HERE' with the actual JSON from step 1
INSERT INTO public.blogs
SELECT * FROM json_populate_recordset(NULL::public.blogs,
  'YOUR_BLOGS_JSON_HERE'::json
);

-- Import Messages
-- Replace 'YOUR_MESSAGES_JSON_HERE' with the actual JSON from step 1
INSERT INTO public.messages
SELECT * FROM json_populate_recordset(NULL::public.messages,
  'YOUR_MESSAGES_JSON_HERE'::json
);

-- Import Profiles (upsert to keep QA admin users)
-- Replace 'YOUR_PROFILES_JSON_HERE' with the actual JSON from step 1
INSERT INTO public.profiles
SELECT * FROM json_populate_recordset(NULL::public.profiles,
  'YOUR_PROFILES_JSON_HERE'::json
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  is_admin = EXCLUDED.is_admin,
  updated_at = NOW();

-- Re-enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Verify counts
SELECT 'Projects' as table_name, COUNT(*) as count FROM public.projects
UNION ALL
SELECT 'Blogs', COUNT(*) FROM public.blogs
UNION ALL
SELECT 'Messages', COUNT(*) FROM public.messages
UNION ALL
SELECT 'Profiles', COUNT(*) FROM public.profiles;
```

---

## 📋 Method 2: Quick Sync Script (Faster - 5 minutes)

I've created a ready-to-use SQL script for you:

### Step 1: Get Production Connection String

1. Go to **Production Supabase** → **Settings** → **Database**
2. Copy the **Connection string** (Postgres)
3. Replace `[YOUR-PASSWORD]` with your actual database password
4. **Save this securely** - you'll need it

### Step 2: Get QA Connection String

1. Go to **QA Supabase** → **Settings** → **Database**
2. Copy the **Connection string** (Postgres)
3. Replace `[YOUR-PASSWORD]` with your actual database password
4. **Save this securely**

### Step 3: Use pgAdmin or psql

**Option A: Using psql command line:**

```bash
# Export from production
pg_dump "YOUR_PROD_CONNECTION_STRING" \
  --table=public.projects \
  --table=public.blogs \
  --table=public.messages \
  --table=public.profiles \
  --data-only \
  --column-inserts \
  > prod_data.sql

# Import to QA
psql "YOUR_QA_CONNECTION_STRING" < prod_data.sql
```

**Option B: Using pgAdmin (GUI):**

1. Download and install [pgAdmin](https://www.pgadmin.org/download/)
2. Connect to Production database
3. Right-click database → **Backup**
   - Format: Plain
   - Data only: Yes
   - Tables: Select projects, blogs, messages, profiles
4. Connect to QA database
5. Right-click database → **Restore**
   - Select the backup file
6. Done!

---

## 📋 Method 3: Automated Sync (Advanced - One-time setup)

Create a GitHub Actions workflow that syncs on demand:

### Create `.github/workflows/sync-db.yml`:

```yaml
name: Sync Production to QA Database

on:
  workflow_dispatch:  # Manual trigger only

jobs:
  sync-database:
    name: Sync Prod → QA
    runs-on: ubuntu-latest

    steps:
      - name: Confirm sync direction
        run: |
          echo "⚠️  This will sync Production → QA"
          echo "⚠️  All QA data will be replaced with production data"

      - name: Install PostgreSQL client
        run: |
          sudo apt-get update
          sudo apt-get install -y postgresql-client

      - name: Export from Production
        run: |
          pg_dump "${{ secrets.PROD_DATABASE_URL }}" \
            --table=public.projects \
            --table=public.blogs \
            --table=public.messages \
            --table=public.profiles \
            --data-only \
            --column-inserts \
            > prod_data.sql

      - name: Clear QA data
        run: |
          psql "${{ secrets.QA_DATABASE_URL }}" <<EOF
          TRUNCATE public.projects CASCADE;
          TRUNCATE public.blogs CASCADE;
          TRUNCATE public.messages CASCADE;
          EOF

      - name: Import to QA
        run: |
          psql "${{ secrets.QA_DATABASE_URL }}" < prod_data.sql

      - name: Verify sync
        run: |
          psql "${{ secrets.QA_DATABASE_URL }}" <<EOF
          SELECT 'Projects' as table_name, COUNT(*) as count FROM public.projects
          UNION ALL
          SELECT 'Blogs', COUNT(*) FROM public.blogs
          UNION ALL
          SELECT 'Messages', COUNT(*) FROM public.messages;
          EOF
```

**Setup Required:**

1. Go to GitHub → Settings → Secrets → Actions
2. Add these secrets:
   - `PROD_DATABASE_URL`: Production Postgres connection string
   - `QA_DATABASE_URL`: QA Postgres connection string

3. To run: Go to Actions → "Sync Production to QA Database" → Run workflow

---

## 🔒 Security Best Practices

### Anonymize Sensitive Data in QA

If you have sensitive user data in production, anonymize it in QA:

```sql
-- After syncing, run this in QA to anonymize data
UPDATE public.messages
SET
  name = 'Test User ' || id::text,
  email = 'test' || id::text || '@example.com',
  message = 'Test message content'
WHERE true;

-- Keep one real admin for testing
UPDATE public.profiles
SET
  email = 'qa-user-' || id::text || '@example.com',
  full_name = 'QA Test User'
WHERE email != 'divij.shrivastava@gmail.com';  -- Keep your admin
```

---

## 📊 Quick Sync Checklist

Before syncing:
- [ ] Production database is backed up
- [ ] QA environment is accessible
- [ ] You have admin access to both databases
- [ ] You understand all QA data will be replaced

After syncing:
- [ ] Verify row counts match
- [ ] Test QA admin login still works
- [ ] Browse QA site to verify data
- [ ] Test creating new content on QA

---

## 🆘 Troubleshooting

### "Permission denied" error
- Make sure you're using the correct database passwords
- Check that your IP is whitelisted in Supabase

### "Relation does not exist" error
- Run the schema setup first on QA
- Ensure both databases have the same schema

### "Foreign key violation" error
- Sync tables in correct order: profiles → blogs → projects
- Or temporarily disable foreign key constraints

### Row counts don't match
- Check for failed inserts in the output
- Verify RLS policies aren't blocking inserts
- Temporarily disable RLS during import

---

## 🔄 Recommended Sync Schedule

- **Before major releases:** Sync production to QA
- **Weekly:** Good practice for active development
- **After data changes:** When production data structure changes
- **Never automatically:** Always manual trigger for safety

---

## 📚 Additional Resources

- [Supabase Database Backups](https://supabase.com/docs/guides/platform/backups)
- [PostgreSQL pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html)
- [Database Migration Best Practices](https://supabase.com/docs/guides/database/migrations)
