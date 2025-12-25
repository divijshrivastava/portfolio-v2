/**
 * Import ONLY blogs from JSON file to Supabase
 *
 * Usage:
 * 1. Make sure you've run export-blogs-only.js first
 * 2. Make sure .env.local has:
 *    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
 *    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
 *
 * 3. Run: node scripts/import-blogs-only.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Helper function to generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function importBlogsOnly() {
  try {
    console.log('Connecting to Supabase...');

    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL not found in .env.local');
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
    }

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

    console.log('✓ Connected to Supabase\n');

    // Read blogs data
    const exportDir = path.join(__dirname, '../exports');
    const blogsPath = path.join(exportDir, 'blogs.json');

    console.log('Reading blogs.json...');
    const blogsData = JSON.parse(await fs.readFile(blogsPath, 'utf8'));
    console.log(`✓ Found ${blogsData.length} blogs to import\n`);

    // Import blogs
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    console.log('Importing blogs...');
    console.log('─'.repeat(70));

    for (let i = 0; i < blogsData.length; i++) {
      const blog = blogsData[i];
      const blogNum = i + 1;

      // Map MySQL fields to Supabase schema
      const blogData = {
        title: blog.title,
        slug: blog.slug || generateSlug(blog.title),
        summary: blog.summary || blog.description || null,
        content: blog.content || '',
        cover_image_url: blog.cover_image || blog.cover_image_url || blog.image_url || null,
        thumbnail_url: blog.thumbnail || blog.thumbnail_url || blog.cover_image || null,
        status: blog.status || (blog.approved ? 'published' : 'draft'),
        read_time: blog.read_time || Math.ceil((blog.content?.length || 0) / 1000),
        views: blog.views || 0,
        created_at: blog.created_at,
        updated_at: blog.updated_at || blog.created_at,
        published_at: blog.published_at || (blog.status === 'published' ? blog.created_at : null),
      };

      const { error } = await supabase.from('blogs').insert(blogData);

      if (error) {
        errorCount++;
        const errorMsg = `[${blogNum}/${blogsData.length}] ✗ Error: ${blog.title} - ${error.message}`;
        console.log(errorMsg);
        errors.push({ blog: blog.title, error: error.message });
      } else {
        successCount++;
        console.log(`[${blogNum}/${blogsData.length}] ✓ ${blog.title}`);
      }
    }

    console.log('─'.repeat(70));
    console.log('\n✓ Import completed!');
    console.log(`\nResults:`);
    console.log(`  Success: ${successCount} blogs`);
    console.log(`  Errors:  ${errorCount} blogs`);

    if (errors.length > 0) {
      console.log('\nErrors details:');
      errors.forEach(({ blog, error }) => {
        console.log(`  - ${blog}: ${error}`);
      });
    }

    console.log('\nNext steps:');
    console.log('  1. Go to Supabase Dashboard → Table Editor → blogs');
    console.log('  2. Verify your blogs are imported correctly');
    console.log('  3. Visit your website to see the blogs!');

  } catch (error) {
    console.error('\n✗ Error importing blogs:');

    if (error.code === 'ENOENT') {
      console.error('exports/blogs.json not found!');
      console.error('Run: node scripts/export-blogs-only.js first');
    } else {
      console.error(error.message);
    }

    process.exit(1);
  }
}

importBlogsOnly();
