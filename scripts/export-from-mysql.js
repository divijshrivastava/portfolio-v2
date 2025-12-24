/**
 * Export data from MySQL database to JSON files
 *
 * Usage:
 * 1. Create a .env file in the root with your MySQL credentials:
 *    MYSQL_HOST=your_host
 *    MYSQL_USER=your_user
 *    MYSQL_PASSWORD=your_password
 *    MYSQL_DATABASE=your_database
 *
 * 2. Run: node scripts/export-from-mysql.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function exportFromMySQL() {
  try {
    console.log('Connecting to MySQL...');

    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    console.log('Connected successfully!');

    // Create export directory
    const exportDir = path.join(__dirname, '../exports');
    await fs.mkdir(exportDir, { recursive: true });

    // Export blogs
    console.log('Exporting blogs...');
    const [blogs] = await connection.execute(`
      SELECT * FROM blogs ORDER BY created_at DESC
    `);
    await fs.writeFile(
      path.join(exportDir, 'blogs.json'),
      JSON.stringify(blogs, null, 2)
    );
    console.log(`✓ Exported ${blogs.length} blogs`);

    // Export projects
    console.log('Exporting projects...');
    const [projects] = await connection.execute(`
      SELECT * FROM projects ORDER BY created_at DESC
    `);
    await fs.writeFile(
      path.join(exportDir, 'projects.json'),
      JSON.stringify(projects, null, 2)
    );
    console.log(`✓ Exported ${projects.length} projects`);

    // Export messages
    console.log('Exporting messages...');
    const [messages] = await connection.execute(`
      SELECT * FROM messages ORDER BY created_at DESC
    `);
    await fs.writeFile(
      path.join(exportDir, 'messages.json'),
      JSON.stringify(messages, null, 2)
    );
    console.log(`✓ Exported ${messages.length} messages`);

    // Export user activity
    console.log('Exporting user activity...');
    const [activity] = await connection.execute(`
      SELECT * FROM user_activity ORDER BY created_at DESC LIMIT 10000
    `);
    await fs.writeFile(
      path.join(exportDir, 'user_activity.json'),
      JSON.stringify(activity, null, 2)
    );
    console.log(`✓ Exported ${activity.length} activity records`);

    await connection.end();

    console.log('\n✓ Export completed successfully!');
    console.log(`Files saved to: ${exportDir}`);
    console.log('\nNext steps:');
    console.log('1. Review the exported JSON files');
    console.log('2. Download images from your server');
    console.log('3. Run: node scripts/import-to-supabase.js');

  } catch (error) {
    console.error('Error exporting data:', error);
    process.exit(1);
  }
}

exportFromMySQL();
