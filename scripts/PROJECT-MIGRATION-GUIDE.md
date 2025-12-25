# Project Migration Guide

Migrate projects from MySQL (Hostinger) to Supabase in 3 easy steps.

## Prerequisites

- SSH access to your Hostinger server
- MySQL credentials for divij_tech_db
- Supabase credentials in .env.local

## Step 1: Export from MySQL (On Hostinger Server)

1. **Upload the export script to your server:**
   ```bash
   scp scripts/export-projects.sh divij@your_hostinger_server:~/
   ```

2. **SSH into your Hostinger server:**
   ```bash
   ssh divij@your_hostinger_server
   ```

3. **Make the script executable:**
   ```bash
   chmod +x export-projects.sh
   ```

4. **Run the export script:**
   ```bash
   ./export-projects.sh
   ```

   It will ask for:
   - MySQL Username (default: divij)
   - MySQL Password
   - MySQL Database (default: divij_tech_db)

5. **Script will create:** `project-export/projects.json`

## Step 2: Download to Local Machine

1. **Download the exported JSON file:**
   ```bash
   scp divij@your_hostinger_server:~/project-export/projects.json ./exports/
   ```

2. **Verify the file:**
   ```bash
   ls -lh exports/projects.json
   cat exports/projects.json | head -100
   ```

## Step 3: Import to Supabase (On Local Machine)

1. **Make sure .env.local has Supabase credentials:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. **Run the import script:**
   ```bash
   node scripts/import-projects.js
   ```

3. **The script will:**
   - Connect to Supabase
   - Read exports/projects.json
   - Check for duplicate projects (by title)
   - Generate unique slugs
   - Import all new projects
   - Show a summary of results

## Troubleshooting

### "MySQL connection failed"
- Check your MySQL credentials
- Make sure you're on the Hostinger server
- Try connecting manually: `mysql -u divij -p`

### "projects table not found"
- Make sure you're using the correct database
- Check table name: `SHOW TABLES;`

### "Failed to import"
- Check Supabase RLS policies
- Make sure service role key is correct
- Verify the projects table exists in Supabase

## What Gets Migrated

From MySQL `projects` table:
- id
- title
- slug (generated if missing)
- description
- image_url
- project_url
- github_url
- youtube_url
- status (published/draft)
- created_at
- updated_at

To Supabase `projects` table:
- Same fields with automatic slug generation
- Duplicate check by title
- Unique slug handling
