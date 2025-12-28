#!/bin/bash
# Sync Production Database to QA
# This script copies production data to QA environment
#
# WARNING: This will OVERWRITE all data in QA!
# Only run this on QA, never the reverse!

set -e  # Exit on error

echo "🔄 Production to QA Database Sync"
echo "=================================="
echo ""
echo "⚠️  WARNING: This will OVERWRITE all QA data with production data!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Sync cancelled"
    exit 0
fi

echo ""
echo "📋 What will be synced:"
echo "  - All blogs"
echo "  - All projects"
echo "  - All messages (contact form submissions)"
echo "  - Profile data (including admin users)"
echo ""
echo "📋 What will NOT be synced:"
echo "  - Auth users (passwords) - for security"
echo "  - Storage files (images)"
echo ""
read -p "Continue? (yes/no): " confirm2

if [ "$confirm2" != "yes" ]; then
    echo "❌ Sync cancelled"
    exit 0
fi

echo ""
echo "🔧 Prerequisites:"
echo "  1. You need Supabase CLI installed: npm install -g supabase"
echo "  2. You need both production and QA database connection strings"
echo "  3. Make sure you're logged into Supabase CLI"
echo ""
echo "📚 For detailed instructions, see SYNC-DATABASES.md"
echo ""
echo "💡 For now, use the manual SQL approach in the SYNC-DATABASES.md file"
