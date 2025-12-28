#!/bin/bash
# Helper script to set up Supabase project references

set -e

echo "🔧 Supabase Project Reference Setup"
echo "===================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ Error: .env.local not found"
  echo "Please copy .env.local.example to .env.local first"
  exit 1
fi

echo "📋 You need to get project references from Supabase Dashboard"
echo ""
echo "For QA Project:"
echo "1. Go to: https://supabase.com/dashboard"
echo "2. Select your QA project (portfolio-v2-qa)"
echo "3. Settings → General → Reference ID"
echo "4. Copy the reference ID"
echo ""
read -p "Enter QA Project Reference ID: " qa_ref

echo ""
echo "For Production Project:"
echo "1. Go to: https://supabase.com/dashboard"
echo "2. Select your Production project (portfolio-v2)"
echo "3. Settings → General → Reference ID"
echo "4. Copy the reference ID"
echo ""
read -p "Enter Production Project Reference ID: " prod_ref

# Check if refs are already in .env.local
if grep -q "SUPABASE_QA_PROJECT_REF" .env.local; then
  echo ""
  echo "⚠️  Project references already exist in .env.local"
  read -p "Do you want to update them? (yes/no): " update_refs
  if [ "$update_refs" != "yes" ]; then
    echo "❌ Cancelled"
    exit 0
  fi
  # Update existing refs
  sed -i.bak "s/SUPABASE_QA_PROJECT_REF=.*/SUPABASE_QA_PROJECT_REF=$qa_ref/" .env.local
  sed -i.bak "s/SUPABASE_PROD_PROJECT_REF=.*/SUPABASE_PROD_PROJECT_REF=$prod_ref/" .env.local
  rm .env.local.bak
else
  # Add new refs
  echo "" >> .env.local
  echo "# Supabase Project References (for migrations)" >> .env.local
  echo "SUPABASE_QA_PROJECT_REF=$qa_ref" >> .env.local
  echo "SUPABASE_PROD_PROJECT_REF=$prod_ref" >> .env.local
fi

echo ""
echo "✅ Project references added to .env.local"
echo ""
echo "🧪 Testing connection to QA..."
export SUPABASE_QA_PROJECT_REF=$qa_ref
if supabase link --project-ref "$qa_ref" 2>/dev/null; then
  echo "✅ Successfully connected to QA project"
else
  echo "⚠️  Could not connect to QA project"
  echo "Please verify the project ref is correct"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "You can now use:"
echo "  ./scripts/db-link-qa.sh     # Link to QA"
echo "  ./scripts/db-link-prod.sh   # Link to Production"
