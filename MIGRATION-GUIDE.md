# Migrate Blogs from Hostinger MySQL to Supabase

Quick guide to migrate your blogs from Hostinger to Supabase.

## Prerequisites

- Node.js installed
- Access to Hostinger MySQL database
- Supabase project set up

## Step 1: Enable Remote MySQL Access on Hostinger

1. Log in to **Hostinger hPanel**
2. Go to **Databases** → **Remote MySQL**
3. Click **Add IP Address**
4. Add your current IP (find it at https://whatismyipaddress.com)
   - Or add `%` to allow all IPs (less secure but easier)
5. Note your MySQL hostname (usually `mysqlXX.hostinger.com`)

## Step 2: Configure Environment Variables

Create/update `.env` in project root:

```env
# Hostinger MySQL (for export)
MYSQL_HOST=mysql47.hostinger.com
MYSQL_USER=u123456789_youruser
MYSQL_PASSWORD=YourPassword123
MYSQL_DATABASE=u123456789_yourdb
```

Your `.env.local` should already have:

```env
# Supabase (for import)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

## Step 3: Install Dependencies

```bash
npm install mysql2 @supabase/supabase-js
```

## Step 4: Export Blogs from MySQL

```bash
node scripts/export-blogs-only.js
```

**Expected output:**
```
Connecting to Hostinger MySQL...
Host: mysql47.hostinger.com
Database: u123456789_yourdb
User: u123456789_youruser
✓ Connected successfully!

Exporting blogs...
✓ Exported 15 blogs

File saved to: exports/blogs.json
```

This creates `exports/blogs.json` with all your blog data.

## Step 5: Import Blogs to Supabase

```bash
node scripts/import-blogs-only.js
```

**Expected output:**
```
Connecting to Supabase...
✓ Connected to Supabase

Reading blogs.json...
✓ Found 15 blogs to import

Importing blogs...
[1/15] ✓ My First Blog Post
[2/15] ✓ Another Great Article
...
[15/15] ✓ Latest Blog Post

✓ Import completed!

Results:
  Success: 15 blogs
  Errors:  0 blogs
```

## Step 6: Verify Import

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Table Editor** → **blogs**
4. You should see all your blogs!

## Troubleshooting

### Can't Connect to MySQL

**Error:** `ECONNREFUSED` or `Connection refused`

**Solutions:**
1. Make sure you added your IP in Hostinger Remote MySQL
2. Use the remote hostname (e.g., `mysql47.hostinger.com`), NOT `localhost`
3. Check if your firewall is blocking port 3306

### Access Denied

**Error:** `ER_ACCESS_DENIED_ERROR`

**Solutions:**
1. Double-check username and password in `.env`
2. Username might have a prefix (e.g., `u123456789_username`)
3. Try resetting the password in Hostinger hPanel

### Database Not Found

**Error:** `ER_BAD_DB_ERROR`

**Solutions:**
1. Database name might have a prefix in Hostinger
2. Check the exact name in hPanel → Databases

### Import Errors (Duplicate Slugs)

**Error:** `duplicate key value violates unique constraint "blogs_slug_unique"`

**Solutions:**
1. One of your MySQL blogs might have duplicate or missing slugs
2. Edit `exports/blogs.json` manually to fix duplicate titles
3. Or delete existing blogs in Supabase and re-import

## Alternative: Manual Export (If Remote Access Doesn't Work)

If you can't enable remote MySQL access:

1. Go to **Hostinger hPanel** → **phpMyAdmin**
2. Select your database
3. Click on **blogs** table
4. Click **Export** → **Format: JSON**
5. Save as `exports/blogs.json`
6. Run: `node scripts/import-blogs-only.js`

## What Gets Migrated?

The script migrates:
- ✅ Title
- ✅ Content
- ✅ Summary/Description
- ✅ Cover images (URLs)
- ✅ Status (published/draft)
- ✅ Slugs (auto-generated if missing)
- ✅ Created/Updated dates
- ✅ View counts

## Need Help?

If you encounter any issues:
1. Check the error message carefully
2. Verify all credentials in `.env` and `.env.local`
3. Make sure the `blogs` table exists in Supabase
4. Try the manual export method via phpMyAdmin
