#!/bin/bash

#########################################################
# Export Projects from divij_tech_db to JSON
#
# Usage:
#   1. Upload to server: scp scripts/export-projects.sh user@server:~/
#   2. Make executable: chmod +x export-projects.sh
#   3. Run: ./export-projects.sh
#########################################################

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================================="
echo "  Export Projects from divij_tech_db"
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

# Check if PROJECT table exists
echo -n "Checking PROJECT table... "
if mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -e "DESCRIBE PROJECT" 2>/dev/null >/dev/null; then
    PROJECT_COUNT=$(mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -se "SELECT COUNT(*) FROM PROJECT")
    echo -e "${GREEN}✓ Found $PROJECT_COUNT projects${NC}"
else
    echo -e "${RED}✗ PROJECT table not found${NC}"
    exit 1
fi

# Create output directory
OUTPUT_DIR="./project-export"
mkdir -p "$OUTPUT_DIR"

# Export projects to JSON
echo -n "Exporting projects to JSON... "

mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" <<'EOF' --skip-column-names --raw > "$OUTPUT_DIR/projects.json"
SELECT JSON_ARRAYAGG(
    JSON_OBJECT(
        'ID', ID,
        'PROJECT_TYPE', PROJECT_TYPE,
        'INSERT_TIMESTAMP', INSERT_TIMESTAMP,
        'INSERTED_BY', INSERTED_BY,
        'STATUS', STATUS,
        'IS_ACTIVE', IS_ACTIVE,
        'PUBLISH_TIMESTAMP', PUBLISH_TIMESTAMP,
        'HEADING', HEADING,
        'description', description
    )
) as json
FROM PROJECT
ORDER BY PUBLISH_TIMESTAMP DESC;
EOF

echo -e "${GREEN}✓ Done${NC}"
echo ""

# Show results
echo "=========================================="
echo -e "${GREEN}✓ Export completed successfully!${NC}"
echo "=========================================="
echo ""
echo "Exported: $PROJECT_COUNT projects"
echo "File: $OUTPUT_DIR/projects.json"
echo "Size: $(du -h "$OUTPUT_DIR/projects.json" | cut -f1)"
echo ""

# Show preview
echo "Preview (latest project):"
echo "---"
mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" \
    -e "SELECT HEADING, STATUS, PUBLISH_TIMESTAMP FROM PROJECT ORDER BY PUBLISH_TIMESTAMP DESC LIMIT 1"
echo "---"
echo ""

echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Download this file to your local machine:"
echo "     ${GREEN}scp user@your_server:$OUTPUT_DIR/projects.json ./exports/${NC}"
echo ""
echo "  2. Then import to Supabase:"
echo "     ${GREEN}node scripts/import-projects.js${NC}"
echo ""
