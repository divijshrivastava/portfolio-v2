# Database Migrations

## How to Run Migrations in Supabase

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (in the left sidebar)
3. Click **New Query**
4. Copy and paste the SQL from the migration file
5. Click **Run** or press `Cmd/Ctrl + Enter`
6. Verify the column was added successfully

### Option 2: Using Supabase CLI (if you have it set up)

```bash
supabase db push
```

## Migration Files

### `add_slug_to_projects.sql`

**Purpose:** Adds a `slug` column to the projects table for SEO-friendly URLs

**What it does:**
- Adds `slug` column (TEXT type)
- Adds unique constraint to prevent duplicate slugs
- Creates an index for faster lookups
- Adds documentation comment

**When to run:** Before deploying the project detail page feature

**After running:** Use the "Add Slugs" button in the admin panel to populate slugs for existing projects
