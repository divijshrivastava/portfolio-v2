#!/bin/bash

#########################################################
# Export Blogs from MySQL to JSON (Ubuntu Server)
#
# Usage:
#   1. Upload this script to your Ubuntu server
#   2. Make it executable: chmod +x export-blogs-mysql.sh
#   3. Run: ./export-blogs-mysql.sh
#
# Or run directly with credentials:
#   ./export-blogs-mysql.sh username password database
#########################################################

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "  MySQL Blog Export to JSON"
echo "=========================================="
echo ""

# Get MySQL credentials
if [ $# -eq 3 ]; then
    # Credentials provided as arguments
    MYSQL_USER="$1"
    MYSQL_PASSWORD="$2"
    MYSQL_DATABASE="$3"
else
    # Ask for credentials
    echo -n "MySQL Username [root]: "
    read MYSQL_USER
    MYSQL_USER=${MYSQL_USER:-root}

    echo -n "MySQL Password: "
    read -s MYSQL_PASSWORD
    echo ""

    echo -n "MySQL Database Name: "
    read MYSQL_DATABASE
    echo ""
fi

# Test MySQL connection
echo -n "Testing MySQL connection... "
if mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "USE $MYSQL_DATABASE" 2>/dev/null; then
    echo -e "${GREEN}✓ Connected${NC}"
else
    echo -e "${RED}✗ Connection failed${NC}"
    echo "Please check your MySQL credentials and try again."
    exit 1
fi

# Create output directory
OUTPUT_DIR="./blog-export"
mkdir -p "$OUTPUT_DIR"

# Export blogs to JSON
echo -n "Exporting blogs to JSON... "

mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" \
    -e "SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', id,
                'title', title,
                'slug', slug,
                'content', content,
                'summary', summary,
                'description', description,
                'cover_image', cover_image,
                'cover_image_url', cover_image_url,
                'image_url', image_url,
                'thumbnail', thumbnail,
                'thumbnail_url', thumbnail_url,
                'status', status,
                'approved', approved,
                'read_time', read_time,
                'views', views,
                'created_at', created_at,
                'updated_at', updated_at,
                'published_at', published_at
            )
        ) as json
        FROM blogs
        ORDER BY created_at DESC" \
    --skip-column-names \
    --raw > "$OUTPUT_DIR/blogs.json"

# Get count
BLOG_COUNT=$(mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" \
    -se "SELECT COUNT(*) FROM blogs")

echo -e "${GREEN}✓ Done${NC}"
echo ""

# Show results
echo "=========================================="
echo -e "${GREEN}✓ Export completed successfully!${NC}"
echo "=========================================="
echo ""
echo "Exported: $BLOG_COUNT blogs"
echo "File: $OUTPUT_DIR/blogs.json"
echo "Size: $(du -h "$OUTPUT_DIR/blogs.json" | cut -f1)"
echo ""

# Show preview
echo "Preview (first blog):"
echo "---"
mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" \
    -e "SELECT title, status, created_at FROM blogs ORDER BY created_at DESC LIMIT 1"
echo "---"
echo ""

echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Download this file to your local machine:"
echo "     scp user@server:$OUTPUT_DIR/blogs.json ./exports/"
echo ""
echo "  2. Then import to Supabase:"
echo "     node scripts/import-blogs-only.js"
echo ""
