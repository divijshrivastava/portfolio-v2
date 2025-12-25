#!/bin/bash

#########################################################
# Inspect MySQL Table Structure
#
# Usage:
#   1. Upload to server: scp scripts/inspect-tables.sh user@server:~/
#   2. Make executable: chmod +x inspect-tables.sh
#   3. Run: ./inspect-tables.sh
#########################################################

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================================="
echo "  MySQL Table Inspector"
echo "=========================================="
echo ""

# Get credentials
echo -n "MySQL Username [root]: "
read MYSQL_USER
MYSQL_USER=${MYSQL_USER:-root}

echo -n "MySQL Password: "
read -s MYSQL_PASSWORD
echo ""

echo -n "MySQL Database [divij_tech_db]: "
read MYSQL_DATABASE
MYSQL_DATABASE=${MYSQL_DATABASE:-divij_tech_db}

echo ""
echo "Inspecting BLOG table..."
echo "=========================================="

# Check if BLOG table exists
if mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -e "DESCRIBE BLOG" 2>/dev/null; then
    echo -e "${GREEN}✓ BLOG table found${NC}"
    echo ""

    # Show structure
    echo "Table Structure:"
    mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -e "DESCRIBE BLOG"
    echo ""

    # Count records
    BLOG_COUNT=$(mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -se "SELECT COUNT(*) FROM BLOG")
    echo -e "${GREEN}Total Blogs: $BLOG_COUNT${NC}"
    echo ""

    # Show sample data
    echo "Sample Blog (first record):"
    echo "---"
    mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" \
        -e "SELECT * FROM BLOG LIMIT 1\G"
    echo "---"
else
    echo "✗ BLOG table not found"
fi

echo ""
echo "Inspecting PROJECT tables..."
echo "=========================================="

# Check PROJECT table
for table in PROJECT CODE_PROJECT VIDEO_PROJECT WEBSITE_PROJECT ANONYMOUS_PROJECT; do
    COUNT=$(mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -se "SELECT COUNT(*) FROM $table" 2>/dev/null || echo "0")
    if [ "$COUNT" != "0" ]; then
        echo -e "${GREEN}✓ $table: $COUNT records${NC}"
    fi
done

echo ""
echo "Inspecting USER_CONTACT table..."
echo "=========================================="

CONTACT_COUNT=$(mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -se "SELECT COUNT(*) FROM USER_CONTACT" 2>/dev/null || echo "0")
echo -e "${GREEN}✓ USER_CONTACT: $CONTACT_COUNT records${NC}"

echo ""
