// Run this script on a machine that has access to MySQL
// Usage: node scripts/export-mysql-projects.js

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function exportProjects() {
  let connection;

  try {
    // Connect to MySQL
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || '191.101.1.53',
      user: process.env.MYSQL_USER || 'divij',
      password: process.env.MYSQL_PASSWORD || 'Lmbz#57xkcd',
      database: process.env.MYSQL_DATABASE || 'divij_tech_db',
    });

    console.log('Connected to MySQL...');

    // Fetch all projects
    const [rows] = await connection.execute(
      'SELECT * FROM projects ORDER BY created_at DESC'
    );

    console.log(`Found ${rows.length} projects`);

    // Save to JSON file
    const outputPath = path.join(__dirname, 'projects-export.json');
    fs.writeFileSync(outputPath, JSON.stringify(rows, null, 2));

    console.log(`Projects exported to: ${outputPath}`);
    console.log(`\nNext step: Run the import API endpoint with this data`);

  } catch (error) {
    console.error('Export failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

exportProjects();
