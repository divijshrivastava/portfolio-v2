#!/bin/bash
# Link to Production Supabase project for database operations

set -e

echo "🔗 Linking to PRODUCTION Supabase project..."
echo "⚠️  WARNING: You are about to link to PRODUCTION database"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ Error: .env.local file not found"
  echo "Please create .env.local and add:"
  echo "  SUPABASE_PROD_PROJECT_REF=your_prod_project_ref"
  exit 1
fi

# Source environment variables
source .env.local

# Check if Production project ref is set
if [ -z "$SUPABASE_PROD_PROJECT_REF" ]; then
  echo "❌ Error: SUPABASE_PROD_PROJECT_REF not set in .env.local"
  echo ""
  echo "To get your Production project reference:"
  echo "1. Go to Production Supabase Dashboard"
  echo "2. Settings → General → Reference ID"
  echo "3. Add to .env.local:"
  echo "   SUPABASE_PROD_PROJECT_REF=xxxxxxxxxxxxx"
  exit 1
fi

# Confirmation prompt
read -p "Are you sure you want to link to PRODUCTION? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "❌ Cancelled"
  exit 0
fi

# Link to Production project
supabase link --project-ref "$SUPABASE_PROD_PROJECT_REF"

echo "✅ Successfully linked to PRODUCTION project"
echo ""
echo "⚠️  CAUTION: You are now linked to PRODUCTION"
echo ""
echo "You can now:"
echo "  - Apply migrations: supabase db push (⚠️ affects production!)"
echo "  - Check status: supabase db remote list"
echo ""
echo "💡 After applying migrations, switch back to QA with:"
echo "   ./scripts/db-link-qa.sh"
