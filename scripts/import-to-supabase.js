/**
 * Import data from JSON files to Supabase
 *
 * Usage:
 * 1. Make sure you've run export-from-mysql.js first
 * 2. Set up your Supabase project and run the schema SQL
 * 3. Create a .env.local file with:
 *    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
 *    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
 *
 * 4. Run: node scripts/import-to-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function importToSupabase() {
  try {
    console.log('Connecting to Supabase...');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const exportDir = path.join(__dirname, '../exports');

    // Helper function to generate slug from title
    function generateSlug(title) {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    // Import blogs
    console.log('\nImporting blogs...');
    const blogsData = JSON.parse(
      await fs.readFile(path.join(exportDir, 'blogs.json'), 'utf8')
    );

    for (const blog of blogsData) {
      const { error } = await supabase.from('blogs').insert({
        title: blog.title,
        slug: blog.slug || generateSlug(blog.title),
        summary: blog.summary || blog.description,
        content: blog.content,
        cover_image_url: blog.cover_image || blog.image_url,
        thumbnail_url: blog.thumbnail || blog.thumbnail_url,
        status: blog.status || (blog.approved ? 'published' : 'draft'),
        read_time: blog.read_time || Math.ceil((blog.content?.length || 0) / 1000),
        created_at: blog.created_at,
        updated_at: blog.updated_at,
        published_at: blog.published_at || blog.created_at,
      });

      if (error) {
        console.error(`Error importing blog "${blog.title}":`, error.message);
      } else {
        console.log(`✓ Imported: ${blog.title}`);
      }
    }

    // Import projects
    console.log('\nImporting projects...');
    const projectsData = JSON.parse(
      await fs.readFile(path.join(exportDir, 'projects.json'), 'utf8')
    );

    for (const project of projectsData) {
      const { error } = await supabase.from('projects').insert({
        title: project.title,
        description: project.description,
        image_url: project.image || project.image_url,
        project_url: project.url || project.project_url,
        youtube_url: project.youtube_url,
        github_url: project.github_url,
        project_type: project.type || project.project_type || 'other',
        status: project.status || (project.approved ? 'published' : 'draft'),
        tags: project.tags ? (Array.isArray(project.tags) ? project.tags : JSON.parse(project.tags)) : [],
        created_at: project.created_at,
        updated_at: project.updated_at,
        published_at: project.published_at || project.created_at,
      });

      if (error) {
        console.error(`Error importing project "${project.title}":`, error.message);
      } else {
        console.log(`✓ Imported: ${project.title}`);
      }
    }

    // Import messages
    console.log('\nImporting messages...');
    const messagesData = JSON.parse(
      await fs.readFile(path.join(exportDir, 'messages.json'), 'utf8')
    );

    for (const message of messagesData) {
      const { error } = await supabase.from('messages').insert({
        name: message.name,
        email: message.email,
        message: message.message,
        is_read: message.is_read || message.read || false,
        created_at: message.created_at,
      });

      if (error) {
        console.error(`Error importing message from ${message.name}:`, error.message);
      }
    }
    console.log(`✓ Imported ${messagesData.length} messages`);

    // Import user activity
    console.log('\nImporting user activity...');
    const activityData = JSON.parse(
      await fs.readFile(path.join(exportDir, 'user_activity.json'), 'utf8')
    );

    // Import in batches of 100
    const batchSize = 100;
    for (let i = 0; i < activityData.length; i += batchSize) {
      const batch = activityData.slice(i, i + batchSize);
      const records = batch.map(activity => ({
        ip_address: activity.ip_address || activity.ip,
        user_agent: activity.user_agent,
        page_visited: activity.page_visited || activity.page || activity.url,
        referrer: activity.referrer,
        country: activity.country,
        city: activity.city,
        created_at: activity.created_at || activity.timestamp,
      }));

      const { error } = await supabase.from('user_activity').insert(records);

      if (error) {
        console.error(`Error importing activity batch ${i}:`, error.message);
      } else {
        console.log(`✓ Imported batch ${i / batchSize + 1} (${records.length} records)`);
      }
    }

    console.log('\n✓ Import completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Verify data in Supabase Dashboard');
    console.log('2. Run: node scripts/migrate-images.js to upload images');
    console.log('3. Update image URLs in database if needed');

  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
}

importToSupabase();
