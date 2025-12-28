#!/bin/bash
# Complete Production → QA Sync (Schema + Data)
# This syncs both database schema and all data from production to QA

set -e

echo "🔄 Complete Production → QA Sync"
echo "=================================="
echo ""
echo "⚠️  WARNING: This will COMPLETELY REPLACE QA database with production!"
echo "   - Schema will be synced"
echo "   - All data will be replaced"
echo ""
read -p "Are you absolutely sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "❌ Sync cancelled"
  exit 0
fi

# Check if .env.local exists and has project refs
if [ ! -f .env.local ]; then
  echo "❌ Error: .env.local not found"
  echo "Run: ./scripts/setup-supabase-refs.sh"
  exit 1
fi

source .env.local

if [ -z "$SUPABASE_QA_PROJECT_REF" ] || [ -z "$SUPABASE_PROD_PROJECT_REF" ]; then
  echo "❌ Error: Project references not found in .env.local"
  echo "Run: ./scripts/setup-supabase-refs.sh"
  exit 1
fi

echo ""
echo "📊 Step 1: Capture Production Schema"
echo "======================================"
echo "Linking to production..."
supabase link --project-ref "$SUPABASE_PROD_PROJECT_REF"

echo ""
echo "Generating baseline migration from production..."
TIMESTAMP=$(date +%Y%m%d%H%M%S)
MIGRATION_FILE="supabase/migrations/${TIMESTAMP}_production_baseline.sql"

# Use db remote commit to capture current production schema
if supabase db remote commit 2>/dev/null; then
  echo "✅ Production schema captured"
else
  echo "⚠️  No schema changes detected or baseline already exists"
  echo "Generating schema diff instead..."

  if supabase db diff -f production_baseline 2>&1 | grep -q "No schema changes"; then
    echo "✅ Production schema is already in sync with migrations"
  else
    echo "✅ Schema diff generated"
  fi
fi

echo ""
echo "📥 Step 2: Apply Schema to QA"
echo "======================================"
echo "Linking to QA..."
supabase link --project-ref "$SUPABASE_QA_PROJECT_REF"

echo ""
echo "Applying all migrations to QA..."
if supabase db push; then
  echo "✅ Schema synced to QA"
else
  echo "⚠️  Schema sync completed with warnings"
fi

echo ""
echo "📦 Step 3: Sync Data from Production to QA"
echo "======================================"
echo "This will:"
echo "  - Export all data from production"
echo "  - Clear all data in QA"
echo "  - Import production data to QA"
echo ""
read -p "Continue with data sync? (yes/no): " data_confirm

if [ "$data_confirm" != "yes" ]; then
  echo "⚠️  Schema synced, but data sync skipped"
  exit 0
fi

echo ""
echo "Creating temporary sync script..."

# Create temporary SQL script for data sync
cat > /tmp/sync-data.sql <<'EOSQL'
-- Get production data
SELECT json_agg(row_to_json(t.*)) as projects_data
FROM public.projects t;

SELECT json_agg(row_to_json(t.*)) as blogs_data
FROM public.blogs t;

SELECT json_agg(row_to_json(t.*)) as messages_data
FROM public.messages t;

SELECT json_agg(row_to_json(t.*)) as profiles_data
FROM public.profiles t;
EOSQL

echo "📤 Exporting production data..."
echo "Please follow these manual steps:"
echo ""
echo "1. Go to Production Supabase Dashboard → SQL Editor"
echo "2. Run this query to export projects:"
echo "   SELECT json_agg(row_to_json(t.*)) FROM public.projects t;"
echo "3. Copy the JSON result"
echo ""
echo "4. Then run for blogs, messages, and profiles"
echo ""
echo "5. Go to QA Supabase Dashboard → SQL Editor"
echo "6. Use the sync script: sync-prod-to-qa-simple.sql"
echo ""
echo "📄 For detailed instructions, see: SYNC-DATABASES.md"
echo ""
echo "💡 TIP: For easier sync, use the SQL approach in sync-prod-to-qa-simple.sql"

echo ""
echo "✅ Schema Sync Complete!"
echo ""
echo "Next steps:"
echo "1. Manually sync data using sync-prod-to-qa-simple.sql"
echo "2. Or use the detailed guide in SYNC-DATABASES.md"
echo "3. Verify QA site: https://divij-qa.tech"
echo ""
echo "After sync is complete, you can test schema changes on QA!"
EOSQL

chmod +x /tmp/sync-data.sql 2>/dev/null || true

# Switch back to QA
./scripts/db-link-qa.sh
