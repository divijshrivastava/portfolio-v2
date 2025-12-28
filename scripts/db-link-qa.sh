#!/bin/bash
# Link to QA Supabase project for database operations

set -e

echo "🔗 Linking to QA Supabase project..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ Error: .env.local file not found"
  echo "Please create .env.local and add:"
  echo "  SUPABASE_QA_PROJECT_REF=your_qa_project_ref"
  exit 1
fi

# Source environment variables
source .env.local

# Check if QA project ref is set
if [ -z "$SUPABASE_QA_PROJECT_REF" ]; then
  echo "❌ Error: SUPABASE_QA_PROJECT_REF not set in .env.local"
  echo ""
  echo "To get your QA project reference:"
  echo "1. Go to QA Supabase Dashboard"
  echo "2. Settings → General → Reference ID"
  echo "3. Add to .env.local:"
  echo "   SUPABASE_QA_PROJECT_REF=xxxxxxxxxxxxx"
  exit 1
fi

# Link to QA project
supabase link --project-ref "$SUPABASE_QA_PROJECT_REF"

echo "✅ Successfully linked to QA project"
echo ""
echo "You can now:"
echo "  - Generate migrations: supabase db diff -f migration_name"
echo "  - Apply migrations: supabase db push"
echo "  - Check status: supabase db remote list"
