#!/bin/bash

# Quick script to start dev server with QA database
# This loads QA env vars and starts Next.js dev server

echo "🔧 Starting development server with QA database..."
echo ""

# Load .env.local if it exists
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

# Check if QA variables exist
if [ -z "$NEXT_PUBLIC_SUPABASE_URL_QA" ]; then
  echo "❌ NEXT_PUBLIC_SUPABASE_URL_QA not found in environment"
  echo ""
  echo "Please ensure your .env.local contains QA credentials:"
  echo "  NEXT_PUBLIC_SUPABASE_URL_QA=..."
  echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY_QA=..."
  echo "  SUPABASE_SERVICE_ROLE_KEY_QA=..."
  exit 1
fi

# Export QA vars as main vars for this session
export NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL_QA"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY_QA"
export SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY_QA"

echo "✅ Using QA database: ${NEXT_PUBLIC_SUPABASE_URL:0:40}..."
echo ""
echo "🚀 Starting Next.js dev server..."
echo "   Open http://localhost:3000 in your browser"
echo ""

# Start the dev server
npm run dev

