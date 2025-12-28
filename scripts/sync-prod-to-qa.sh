#!/bin/bash
# Master script: Complete Production → QA Sync (Schema + Data)
# This orchestrates both schema and data sync in one command

set -e

echo "🔄 Complete Production → QA Sync"
echo "===================================="
echo ""
echo "This script will:"
echo "  1. Sync database schema (using Supabase migrations)"
echo "  2. Sync all data (using automated Node.js script)"
echo ""
echo "⚠️  WARNING: This will COMPLETELY REPLACE QA with production data!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "❌ Sync cancelled"
  exit 0
fi

# Check prerequisites
echo ""
echo "📋 Checking prerequisites..."

if [ ! -f .env.local ]; then
  echo "❌ .env.local not found"
  echo "Run: ./scripts/setup-supabase-refs.sh"
  exit 1
fi

source .env.local

if [ -z "$SUPABASE_QA_PROJECT_REF" ] || [ -z "$SUPABASE_PROD_PROJECT_REF" ]; then
  echo "❌ Project references not set in .env.local"
  echo "Run: ./scripts/setup-supabase-refs.sh"
  exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_URL_PROD" ] || [ -z "$NEXT_PUBLIC_SUPABASE_URL_QA" ]; then
  echo "❌ Supabase URLs not set in .env.local"
  echo ""
  echo "Add to .env.local:"
  echo "  NEXT_PUBLIC_SUPABASE_URL_PROD=https://xxx.supabase.co"
  echo "  SUPABASE_SERVICE_ROLE_KEY_PROD=your_prod_service_key"
  echo "  NEXT_PUBLIC_SUPABASE_URL_QA=https://yyy.supabase.co"
  echo "  SUPABASE_SERVICE_ROLE_KEY_QA=your_qa_service_key"
  exit 1
fi

echo "✅ Prerequisites OK"

# Step 1: Sync Schema
echo ""
echo "📊 STEP 1: Syncing Schema"
echo "===================================="
echo ""

echo "Linking to production..."
supabase link --project-ref "$SUPABASE_PROD_PROJECT_REF"

echo ""
echo "Capturing production schema..."
if supabase db diff -f production_sync --linked 2>&1 | grep -q "No schema changes"; then
  echo "✅ Schema already in sync"
else
  echo "✅ Schema differences captured in migrations/"
fi

echo ""
echo "Linking to QA..."
supabase link --project-ref "$SUPABASE_QA_PROJECT_REF"

echo ""
echo "Applying schema to QA..."
if supabase db push; then
  echo "✅ Schema synced successfully"
else
  echo "⚠️  Schema sync completed with warnings"
fi

# Step 2: Sync Data
echo ""
echo "📦 STEP 2: Syncing Data"
echo "===================================="
echo ""
read -p "Proceed with data sync? (yes/no): " data_confirm

if [ "$data_confirm" != "yes" ]; then
  echo "⚠️  Schema synced, but data sync skipped"
  echo ""
  echo "To sync data later, run:"
  echo "  node scripts/sync-data.mjs"
  exit 0
fi

echo ""
echo "Running automated data sync..."
node scripts/sync-data.mjs

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ SYNC COMPLETE!"
  echo ""
  echo "Next steps:"
  echo "  1. Visit https://divij-qa.tech"
  echo "  2. Verify data is correct"
  echo "  3. Test schema changes on QA"
  echo "  4. Push to production when ready"
else
  echo ""
  echo "❌ Data sync failed"
  echo "Please check the errors above"
  exit 1
fi

# Switch back to QA for convenience
./scripts/db-link-qa.sh 2>/dev/null || true
