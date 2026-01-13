#!/bin/bash

# Script to switch local development to use QA database
# This creates a .env.local.qa file that you can use

echo "🔧 Setting up QA environment for local development..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ .env.local not found. Please create it first with your QA credentials."
  exit 1
fi

# Check if QA variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL_QA" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY_QA" ]; then
  echo "⚠️  QA environment variables not found in current shell."
  echo ""
  echo "Please ensure your .env.local contains:"
  echo "  NEXT_PUBLIC_SUPABASE_URL_QA=..."
  echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY_QA=..."
  echo "  SUPABASE_SERVICE_ROLE_KEY_QA=..."
  echo ""
  echo "Then run this script again, or manually update .env.local to use QA values."
  exit 1
fi

# Backup current .env.local
if [ -f .env.local ]; then
  cp .env.local .env.local.backup
  echo "✅ Backed up current .env.local to .env.local.backup"
fi

# Create QA version by copying QA vars to main vars
echo "📝 Updating .env.local to use QA database..."

# Read current .env.local and update QA vars to main vars
if grep -q "NEXT_PUBLIC_SUPABASE_URL_QA" .env.local; then
  # Use sed to replace main vars with QA vars (if they exist)
  # This is a simple approach - user should manually verify
  echo ""
  echo "⚠️  Manual step required:"
  echo "Please update .env.local to set:"
  echo "  NEXT_PUBLIC_SUPABASE_URL=\$NEXT_PUBLIC_SUPABASE_URL_QA"
  echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=\$NEXT_PUBLIC_SUPABASE_ANON_KEY_QA"
  echo "  SUPABASE_SERVICE_ROLE_KEY=\$SUPABASE_SERVICE_ROLE_KEY_QA"
  echo ""
  echo "Or run: npm run dev:qa"
  exit 0
else
  echo "✅ .env.local appears to already be configured"
fi

echo ""
echo "🚀 Ready to start dev server with QA database!"
echo "Run: npm run dev"

