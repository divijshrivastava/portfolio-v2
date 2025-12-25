#!/bin/bash

#########################################################
# Upload Blog Images to Supabase Storage
#
# Uploads all images from downloaded images directory
# to Supabase Storage bucket 'blog-images'
#
# Prerequisites:
#   1. Download images from server first (see IMAGE-MIGRATION.md)
#   2. npm install -g supabase
#   3. supabase login
#
# Usage:
#   chmod +x scripts/upload-blog-images.sh
#   ./scripts/upload-blog-images.sh [images_directory]
#
# Examples:
#   ./scripts/upload-blog-images.sh ~/blog-images
#   ./scripts/upload-blog-images.sh
#########################################################

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Use provided directory or default to ~/blog-images
IMAGES_DIR="${1:-$HOME/blog-images}"
BUCKET_NAME="blog-images"

echo "=========================================="
echo "  Upload Blog Images to Supabase"
echo "=========================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}Supabase CLI not found. Installing...${NC}"
    npm install -g supabase
fi

# Check if images directory exists
if [ ! -d "$IMAGES_DIR" ]; then
    echo -e "${YELLOW}Error: Images directory not found at $IMAGES_DIR${NC}"
    echo ""
    echo "Please download images from your server first:"
    echo "  mkdir -p ~/blog-images"
    echo "  scp -r divij@your_server:/home/divij/divij_tech_volume/images_volume/* ~/blog-images/"
    echo ""
    echo "See IMAGE-MIGRATION.md for detailed instructions."
    exit 1
fi

# Count images
IMAGE_COUNT=$(ls "$IMAGES_DIR"/*.{jpg,jpeg,png} 2>/dev/null | wc -l | tr -d ' ')
echo "Found $IMAGE_COUNT images to upload"
echo ""

# Confirm upload
echo -n "Upload all images to Supabase Storage bucket '$BUCKET_NAME'? (yes/no): "
read CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "Uploading images..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$IMAGES_DIR"

# Upload all images
for file in *.{jpg,jpeg,png}; do
    if [ -f "$file" ]; then
        echo "Uploading: $file"
        supabase storage upload "$BUCKET_NAME" "$file" --experimental 2>&1 | grep -v "Warning" || true
    fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✓ Upload complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Run: node scripts/update-blog-images.js"
echo "  2. Verify images appear on your blog posts"
echo ""
