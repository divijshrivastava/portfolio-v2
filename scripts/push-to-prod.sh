#!/bin/bash
# Push migrations to production database
# Usage: ./scripts/push-to-prod.sh

set -e

echo "🚀 Pushing migrations to PRODUCTION"
echo "===================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ Error: .env.local not found"
  exit 1
fi

source .env.local

# Link to production
echo "🔗 Linking to production..."
supabase link --project-ref "$SUPABASE_PROD_PROJECT_REF"

echo ""
echo "📋 Migrations to apply:"
supabase migration list | tail -n +2 | grep -v "README" | awk '$2 == "" {print "  •", $1}'

echo ""
read -p "Apply these migrations to PRODUCTION? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "❌ Cancelled"
  exit 0
fi

echo ""
echo "🔄 Applying migrations..."
echo "y" | supabase db push

echo ""
echo "✅ Migrations applied to production!"
echo ""
echo "📊 Migration status:"
supabase migration list

echo ""
echo "🌐 Verify on: https://divij.tech"
