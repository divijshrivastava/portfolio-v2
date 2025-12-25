# Migration Guide for divij_tech_db

Your database structure:
- Database: `divij_tech_db`
- Blog table: `BLOG` (uppercase)
- Projects: Multiple tables (`PROJECT`, `CODE_PROJECT`, `VIDEO_PROJECT`, etc.)

## Quick Migration (3 Steps)

### Step 1: Inspect Your Database Structure (Optional but Recommended)

Upload and run the inspector script to see your exact column names:

```bash
# On local machine
scp scripts/inspect-tables.sh user@your_server:~/

# On server
ssh user@your_server
chmod +x inspect-tables.sh
./inspect-tables.sh
```

This shows you:
- BLOG table structure
- Column names
- Sample data
- Record counts

### Step 2: Export Blogs from MySQL

```bash
# Upload export script
scp scripts/export-blogs-divij.sh user@your_server:~/

# On server
chmod +x export-blogs-divij.sh
./export-blogs-divij.sh
```

**Enter credentials:**
- Username: `root` (or your MySQL user)
- Password: (your MySQL password)
- Database: `divij_tech_db` (default)

**Expected output:**
```
==========================================
  Export Blogs from divij_tech_db
==========================================

MySQL Username [root]: root
MySQL Password: ****
MySQL Database [divij_tech_db]:

Testing MySQL connection... ✓ Connected
Checking BLOG table... ✓ Found 15 blogs
Exporting blogs to JSON... ✓ Done

==========================================
✓ Export completed successfully!
==========================================

Exported: 15 blogs
File: ./blog-export/blogs.json
Size: 245K
```

### Step 3: Download and Import to Supabase

```bash
# Download to local machine
scp user@your_server:~/blog-export/blogs.json ./exports/

# Import to Supabase
node scripts/import-blogs-flexible.js
```

**Expected output:**
```
========================================
  Import Blogs to Supabase
========================================

Connecting to Supabase...
✓ Connected to Supabase

Reading blogs.json...
✓ Found 15 blogs to import

Sample blog structure (first blog):
──────────────────────────────────────
MySQL columns found: id, title, content, created_at, status, ...
──────────────────────────────────────

Importing blogs...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[1/15] ✓ My First Blog Post
[2/15] ✓ Another Article
...
[15/15] ✓ Latest Post
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Import completed!

Results:
  Success: 15 blogs
  Errors:  0 blogs
```

Done! ✅

---

## What's Different About These Scripts?

### 1. `inspect-tables.sh`
- Shows your exact table structure
- Displays column names
- Helps you understand your data before exporting

### 2. `export-blogs-divij.sh`
- Uses `BLOG` table (uppercase) instead of `blogs`
- Defaults to `divij_tech_db` database
- Exports **ALL columns** automatically
- Works with any column structure

### 3. `import-blogs-flexible.js`
- Handles different column name variations
- Maps common MySQL column names to Supabase schema
- Auto-generates slugs if missing
- Shows you which columns it found

---

## Column Name Mapping

The import script automatically handles these variations:

| Supabase Field | MySQL Column (any of these) |
|----------------|----------------------------|
| title | `title`, `TITLE`, `blog_title` |
| content | `content`, `CONTENT`, `body`, `BODY` |
| summary | `summary`, `SUMMARY`, `description`, `excerpt` |
| slug | `slug`, `SLUG`, `url_slug` (or auto-generated) |
| cover_image_url | `cover_image_url`, `image_url`, `COVER_IMAGE` |
| status | `status`, `STATUS` |
| created_at | `created_at`, `CREATED_AT`, `date_created` |

---

## Troubleshooting

### "BLOG table not found"

Your table might have a different name. Check with:
```bash
mysql -u root -p -e "SHOW TABLES FROM divij_tech_db"
```

### "Missing required fields: title or content"

One of your blogs is missing title or content. Check the JSON file:
```bash
cat blog-export/blogs.json | jq '.[] | select(.title == null or .content == null)'
```

### Import shows many errors

The column names might be different. Check the sample output to see what columns were found, then you can manually adjust the `mapBlogFields` function in `import-blogs-flexible.js`.

---

## Advanced: Export Other Tables

### Export Projects

Modify `export-blogs-divij.sh` and change `BLOG` to one of:
- `PROJECT`
- `CODE_PROJECT`
- `VIDEO_PROJECT`
- `WEBSITE_PROJECT`
- `ANONYMOUS_PROJECT`

### Export Contacts

Change `BLOG` to `USER_CONTACT` in the script.

---

## File Locations

After running scripts:

**On Server:**
```
~/
├── inspect-tables.sh
├── export-blogs-divij.sh
└── blog-export/
    └── blogs.json          # Download this!
```

**On Local Machine:**
```
portfolio-v2/
├── exports/
│   └── blogs.json          # After downloading
└── scripts/
    ├── inspect-tables.sh
    ├── export-blogs-divij.sh
    └── import-blogs-flexible.js
```

---

## Complete Example

```bash
# 1. Inspect database (optional)
scp scripts/inspect-tables.sh user@server:~/
ssh user@server
./inspect-tables.sh
exit

# 2. Export blogs
scp scripts/export-blogs-divij.sh user@server:~/
ssh user@server
./export-blogs-divij.sh
exit

# 3. Download and import
scp user@server:~/blog-export/blogs.json ./exports/
node scripts/import-blogs-flexible.js

# 4. Verify in Supabase Dashboard
```

---

Need help? The scripts provide detailed error messages to guide you!
