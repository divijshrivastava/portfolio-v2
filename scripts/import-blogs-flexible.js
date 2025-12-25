/**
 * Import blogs from divij_tech_db JSON to Supabase
 * Handles different column name variations
 *
 * Usage:
 * 1. Make sure blogs.json exists in exports/
 * 2. Make sure .env.local has Supabase credentials
 * 3. Run: node scripts/import-blogs-flexible.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Helper function to generate slug from title
function generateSlug(title) {
  if (!title) return 'untitled-' + Date.now();
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper function to map MySQL blog fields to Supabase schema
function mapBlogFields(mysqlBlog) {
  // Handle different possible column name variations
  const getField = (blog, ...possibleNames) => {
    for (const name of possibleNames) {
      if (blog[name] !== null && blog[name] !== undefined) {
        return blog[name];
      }
    }
    return null;
  };

  return {
    title: getField(mysqlBlog, 'title', 'TITLE', 'blog_title'),
    slug: getField(mysqlBlog, 'slug', 'SLUG', 'url_slug') || generateSlug(mysqlBlog.title || mysqlBlog.TITLE),
    summary: getField(mysqlBlog, 'summary', 'SUMMARY', 'description', 'DESCRIPTION', 'excerpt', 'EXCERPT'),
    content: getField(mysqlBlog, 'content', 'CONTENT', 'body', 'BODY', 'blog_content'),
    cover_image_url: getField(mysqlBlog, 'cover_image_url', 'coverImageUrl', 'image_url', 'imageUrl', 'cover_image', 'COVER_IMAGE', 'IMAGE_URL'),
    thumbnail_url: getField(mysqlBlog, 'thumbnail_url', 'thumbnailUrl', 'thumbnail', 'THUMBNAIL', 'cover_image_url'),
    status: (getField(mysqlBlog, 'status', 'STATUS') || 'draft').toLowerCase(),
    read_time: getField(mysqlBlog, 'read_time', 'readTime', 'READ_TIME') || Math.ceil(((mysqlBlog.content || mysqlBlog.CONTENT || '').length) / 1000),
    views: getField(mysqlBlog, 'views', 'VIEWS', 'view_count', 'VIEW_COUNT') || 0,
    created_at: getField(mysqlBlog, 'created_at', 'createdAt', 'CREATED_AT', 'date_created', 'DATE_CREATED'),
    updated_at: getField(mysqlBlog, 'updated_at', 'updatedAt', 'UPDATED_AT', 'date_updated', 'DATE_UPDATED'),
    published_at: getField(mysqlBlog, 'published_at', 'publishedAt', 'PUBLISHED_AT', 'date_published', 'DATE_PUBLISHED', 'created_at', 'CREATED_AT'),
  };
}

async function importBlogsFlexible() {
  try {
    console.log('========================================');
    console.log('  Import Blogs to Supabase');
    console.log('========================================\n');

    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL not found in .env.local');
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
    }

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
    console.log('✓ Connected to Supabase\n');

    // Read blogs data
    const exportDir = path.join(__dirname, '../exports');
    const blogsPath = path.join(exportDir, 'blogs.json');

    console.log('Reading blogs.json...');
    const blogsData = JSON.parse(await fs.readFile(blogsPath, 'utf8'));
    console.log(`✓ Found ${blogsData.length} blogs to import\n`);

    // Show sample of first blog structure
    if (blogsData.length > 0) {
      console.log('Sample blog structure (first blog):');
      console.log('──────────────────────────────────────');
      console.log('MySQL columns found:', Object.keys(blogsData[0]).join(', '));
      console.log('──────────────────────────────────────\n');
    }

    // Import blogs
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    console.log('Importing blogs...');
    console.log('━'.repeat(70));

    for (let i = 0; i < blogsData.length; i++) {
      const mysqlBlog = blogsData[i];
      const blogNum = i + 1;

      try {
        // Map fields
        const blogData = mapBlogFields(mysqlBlog);

        // Validate required fields
        if (!blogData.title || !blogData.content) {
          throw new Error('Missing required fields: title or content');
        }

        const { error } = await supabase.from('blogs').insert(blogData);

        if (error) {
          throw error;
        }

        successCount++;
        console.log(`[${blogNum}/${blogsData.length}] ✓ ${blogData.title}`);

      } catch (error) {
        errorCount++;
        const errorMsg = `[${blogNum}/${blogsData.length}] ✗ ${mysqlBlog.title || mysqlBlog.TITLE || 'Unknown'} - ${error.message}`;
        console.log(errorMsg);
        errors.push({
          blog: mysqlBlog.title || mysqlBlog.TITLE || 'Unknown',
          error: error.message
        });
      }
    }

    console.log('━'.repeat(70));
    console.log('\n✓ Import completed!');
    console.log('\nResults:');
    console.log(`  Success: ${successCount} blogs`);
    console.log(`  Errors:  ${errorCount} blogs`);

    if (errors.length > 0) {
      console.log('\n⚠ Errors details:');
      errors.forEach(({ blog, error }) => {
        console.log(`  - ${blog}: ${error}`);
      });
      console.log('\nTip: Check exports/blogs.json to see the actual column names');
    }

    console.log('\nNext steps:');
    console.log('  1. Go to Supabase Dashboard → Table Editor → blogs');
    console.log('  2. Verify your blogs are imported correctly');
    console.log('  3. Visit your website to see the blogs!');
    console.log('');

  } catch (error) {
    console.error('\n✗ Error importing blogs:');

    if (error.code === 'ENOENT') {
      console.error('exports/blogs.json not found!');
      console.error('Run: ./export-blogs-divij.sh on your server first');
    } else {
      console.error(error.message);
    }

    process.exit(1);
  }
}

importBlogsFlexible();
