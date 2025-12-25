/**
 * Export ONLY blogs from MySQL database to JSON file
 *
 * Usage:
 * 1. Add MySQL credentials to .env:
 *    MYSQL_HOST=mysql47.hostinger.com (or your Hostinger MySQL host)
 *    MYSQL_USER=your_username
 *    MYSQL_PASSWORD=your_password
 *    MYSQL_DATABASE=your_database_name
 *
 * 2. Run: node scripts/export-blogs-only.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function exportBlogsOnly() {
  let connection;

  try {
    console.log('Connecting to Hostinger MySQL...');
    console.log(`Host: ${process.env.MYSQL_HOST}`);
    console.log(`Database: ${process.env.MYSQL_DATABASE}`);
    console.log(`User: ${process.env.MYSQL_USER}`);

    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    console.log('✓ Connected successfully!\n');

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
    console.log(`\nFile saved to: exports/blogs.json`);

    // Show preview of first blog
    if (blogs.length > 0) {
      console.log('\nPreview of first blog:');
      console.log('─'.repeat(50));
      console.log(`Title: ${blogs[0].title}`);
      console.log(`Status: ${blogs[0].status || 'N/A'}`);
      console.log(`Created: ${blogs[0].created_at}`);
      console.log('─'.repeat(50));
    }

    console.log('\n✓ Export completed successfully!');
    console.log('\nNext step:');
    console.log('  Run: node scripts/import-blogs-only.js');

  } catch (error) {
    console.error('\n✗ Error exporting blogs:');

    if (error.code === 'ENOTFOUND') {
      console.error('Cannot find MySQL host. Check MYSQL_HOST in .env');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Access denied. Check username/password in .env');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('Database not found. Check MYSQL_DATABASE in .env');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused. Make sure:');
      console.error('  1. Your IP is added in Hostinger Remote MySQL settings');
      console.error('  2. You are using the remote hostname (not localhost)');
    } else {
      console.error(error.message);
    }

    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nMySQL connection closed.');
    }
  }
}

exportBlogsOnly();
