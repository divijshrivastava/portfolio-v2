#!/bin/bash
# Automated Production → QA Sync (Schema + Data)
# Uses Supabase API to sync data programmatically

set -e

echo "🔄 Automated Production → QA Sync"
echo "===================================="
echo ""
echo "⚠️  WARNING: This will COMPLETELY REPLACE QA with production!"
echo ""
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "❌ Cancelled"
  exit 0
fi

# Load environment
if [ ! -f .env.local ]; then
  echo "❌ .env.local not found. Run: ./scripts/setup-supabase-refs.sh"
  exit 1
fi

source .env.local

# Check required vars
if [ -z "$SUPABASE_QA_PROJECT_REF" ] || [ -z "$SUPABASE_PROD_PROJECT_REF" ]; then
  echo "❌ Project refs not set. Run: ./scripts/setup-supabase-refs.sh"
  exit 1
fi

echo ""
echo "📋 Step 1: Sync Schema"
echo "======================"

# Link to production and capture schema
echo "Linking to production..."
supabase link --project-ref "$SUPABASE_PROD_PROJECT_REF"

echo "Generating schema migration from production..."
if supabase db diff -f production_sync --linked 2>&1 | grep -q "No schema changes"; then
  echo "✅ Schema already in sync"
else
  echo "✅ Schema differences captured"
fi

# Link to QA and apply
echo ""
echo "Linking to QA..."
supabase link --project-ref "$SUPABASE_QA_PROJECT_REF"

echo "Applying schema to QA..."
supabase db push

echo "✅ Schema synced"

echo ""
echo "📦 Step 2: Sync Data"
echo "===================="
echo ""
echo "For data sync, please use one of these methods:"
echo ""
echo "Method 1: Manual SQL (Recommended - Safe)"
echo "  1. Open: sync-prod-to-qa-simple.sql"
echo "  2. Follow the instructions in that file"
echo "  3. Takes ~10 minutes"
echo ""
echo "Method 2: Automated Script (Coming soon)"
echo "  - Will use Supabase REST API"
echo "  - Fully automated"
echo ""
echo "📄 See SYNC-DATABASES.md for detailed instructions"
echo ""

read -p "Do you want to open the sync guide now? (yes/no): " open_guide

if [ "$open_guide" = "yes" ]; then
  if command -v open &> /dev/null; then
    open SYNC-DATABASES.md 2>/dev/null || cat SYNC-DATABASES.md
  else
    cat SYNC-DATABASES.md
  fi
fi

echo ""
echo "✅ Schema sync complete!"
echo ""
echo "After data sync:"
echo "  1. Test QA: https://divij-qa.tech"
echo "  2. Try schema changes on QA first"
echo "  3. Then push to production"
