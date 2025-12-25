#!/bin/bash

#########################################################
# Export Blogs from divij_tech_db BLOG table to JSON
# Uses exact column names from BLOG table
#
# Usage:
#   1. Upload to server: scp scripts/export-blogs-divij.sh user@server:~/
#   2. Make executable: chmod +x export-blogs-divij.sh
#   3. Run: ./export-blogs-divij.sh
#########################################################

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================================="
echo "  Export Blogs from divij_tech_db"
echo "=========================================="
echo ""

# Get MySQL credentials
echo -n "MySQL Username [divij]: "
read MYSQL_USER
MYSQL_USER=${MYSQL_USER:-divij}

echo -n "MySQL Password: "
read -s MYSQL_PASSWORD
echo ""

echo -n "MySQL Database [divij_tech_db]: "
read MYSQL_DATABASE
MYSQL_DATABASE=${MYSQL_DATABASE:-divij_tech_db}

echo ""

# Test MySQL connection
echo -n "Testing MySQL connection... "
if mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "USE $MYSQL_DATABASE" 2>/dev/null; then
    echo -e "${GREEN}✓ Connected${NC}"
else
    echo -e "${RED}✗ Connection failed${NC}"
    echo "Please check your MySQL credentials and try again."
    exit 1
fi

# Check if BLOG table exists
echo -n "Checking BLOG table... "
if mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -e "DESCRIBE BLOG" 2>/dev/null >/dev/null; then
    BLOG_COUNT=$(mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -se "SELECT COUNT(*) FROM BLOG")
    echo -e "${GREEN}✓ Found $BLOG_COUNT blogs${NC}"
else
    echo -e "${RED}✗ BLOG table not found${NC}"
    exit 1
fi

# Create output directory
OUTPUT_DIR="./blog-export"
mkdir -p "$OUTPUT_DIR"

# Export blogs to JSON with exact column names
echo -n "Exporting blogs to JSON... "

mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" <<'EOF' --skip-column-names --raw > "$OUTPUT_DIR/blogs.json"
SELECT JSON_ARRAYAGG(
    JSON_OBJECT(
        'BLOG_ID', BLOG_ID,
        'PUBLISH_TIMESTAMP', PUBLISH_TIMESTAMP,
        'HEADING', HEADING,
        'MINUTES_TO_READ', MINUTES_TO_READ,
        'COVER_PHOTO_ID', COVER_PHOTO_ID,
        'CONTENT', CONTENT,
        'UPVOTES', UPVOTES,
        'VIEWS', VIEWS,
        'AUTHOR_ID', AUTHOR_ID,
        'COVER_PHOTO_ID_DESCRIPTION', COVER_PHOTO_ID_DESCRIPTION,
        'BLOG_SUMMARY_IMAGE_ID', BLOG_SUMMARY_IMAGE_ID,
        'STATUS', STATUS,
        'BLOG_SUMMARY', BLOG_SUMMARY,
        'BLOG_TITLE_LINK', BLOG_TITLE_LINK
    )
) as json
FROM BLOG
ORDER BY PUBLISH_TIMESTAMP DESC;
EOF

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
echo "Preview (latest blog):"
echo "---"
mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" \
    -e "SELECT HEADING, STATUS, PUBLISH_TIMESTAMP FROM BLOG ORDER BY PUBLISH_TIMESTAMP DESC LIMIT 1"
echo "---"
echo ""

echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Download this file to your local machine:"
echo "     ${GREEN}scp divij@your_server:$OUTPUT_DIR/blogs.json ./exports/${NC}"
echo ""
echo "  2. Then import to Supabase:"
echo "     ${GREEN}node scripts/import-blogs-divij.js${NC}"
echo ""
