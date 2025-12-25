/**
 * Import blogs from divij_tech_db BLOG table to Supabase
 * Custom mapping for specific column structure
 *
 * Usage:
 * 1. Make sure blogs.json exists in exports/
 * 2. Make sure .env.local has Supabase credentials
 * 3. Run: node scripts/import-blogs-divij.js
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

// Map divij_tech_db BLOG columns to Supabase blogs schema
function mapDivijBlogToSupabase(mysqlBlog) {
  // Map STATUS values: LIVE → published, anything else → draft
  const status = (mysqlBlog.STATUS === 'LIVE') ? 'published' : 'draft';

  return {
    // Required fields
    title: mysqlBlog.HEADING || 'Untitled',
    slug: mysqlBlog.BLOG_TITLE_LINK || generateSlug(mysqlBlog.HEADING),
    content: mysqlBlog.CONTENT || '',

    // Optional fields
    summary: mysqlBlog.BLOG_SUMMARY || null,
    cover_image_url: mysqlBlog.COVER_PHOTO_ID ? `/images/blog/${mysqlBlog.COVER_PHOTO_ID}.jpg` : null,
    thumbnail_url: mysqlBlog.BLOG_SUMMARY_IMAGE_ID ? `/images/blog/${mysqlBlog.BLOG_SUMMARY_IMAGE_ID}.jpg` : null,

    // Metadata
    status: status,
    read_time: mysqlBlog.MINUTES_TO_READ || Math.ceil((mysqlBlog.CONTENT?.length || 0) / 1000),
    views: mysqlBlog.VIEWS || 0,

    // Timestamps
    created_at: mysqlBlog.PUBLISH_TIMESTAMP,
    updated_at: mysqlBlog.PUBLISH_TIMESTAMP,
    published_at: (status === 'published') ? mysqlBlog.PUBLISH_TIMESTAMP : null,
  };
}

async function importDivijBlogs() {
  try {
    console.log('========================================');
    console.log('  Import Blogs from divij_tech_db');
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

    // Show column mapping
    if (blogsData.length > 0) {
      console.log('Column Mapping:');
      console.log('──────────────────────────────────────');
      console.log('HEADING            → title');
      console.log('BLOG_TITLE_LINK    → slug');
      console.log('CONTENT            → content');
      console.log('BLOG_SUMMARY       → summary');
      console.log('STATUS (LIVE)      → published');
      console.log('STATUS (other)     → draft');
      console.log('COVER_PHOTO_ID     → cover_image_url');
      console.log('MINUTES_TO_READ    → read_time');
      console.log('PUBLISH_TIMESTAMP  → created_at, published_at');
      console.log('──────────────────────────────────────\n');

      // Show sample
      const sample = blogsData[0];
      console.log('Sample Blog:');
      console.log(`  Title: ${sample.HEADING}`);
      console.log(`  Slug: ${sample.BLOG_TITLE_LINK}`);
      console.log(`  Status: ${sample.STATUS} → ${sample.STATUS === 'LIVE' ? 'published' : 'draft'}`);
      console.log(`  Date: ${sample.PUBLISH_TIMESTAMP}`);
      console.log('');
    }

    // Import blogs
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    const warnings = [];

    console.log('Importing blogs...');
    console.log('━'.repeat(70));

    for (let i = 0; i < blogsData.length; i++) {
      const mysqlBlog = blogsData[i];
      const blogNum = i + 1;

      try {
        // Map fields
        const blogData = mapDivijBlogToSupabase(mysqlBlog);

        // Validate required fields
        if (!blogData.title || !blogData.content) {
          throw new Error('Missing required fields: title or content');
        }

        // Check for image IDs that need manual upload
        if (mysqlBlog.COVER_PHOTO_ID && !mysqlBlog.COVER_PHOTO_ID.startsWith('http')) {
          warnings.push({
            blog: blogData.title,
            warning: `Cover photo ID: ${mysqlBlog.COVER_PHOTO_ID} - needs manual upload`
          });
        }

        const { error } = await supabase.from('blogs').insert(blogData);

        if (error) {
          throw error;
        }

        successCount++;
        const statusIcon = blogData.status === 'published' ? '✓' : '○';
        console.log(`[${blogNum}/${blogsData.length}] ${statusIcon} ${blogData.title.substring(0, 60)}...`);

      } catch (error) {
        errorCount++;
        const errorMsg = `[${blogNum}/${blogsData.length}] ✗ ${mysqlBlog.HEADING || 'Unknown'} - ${error.message}`;
        console.log(errorMsg);
        errors.push({
          blog: mysqlBlog.HEADING || 'Unknown',
          error: error.message
        });
      }
    }

    console.log('━'.repeat(70));
    console.log('\n✓ Import completed!');
    console.log('\nResults:');
    console.log(`  Success: ${successCount} blogs`);
    console.log(`  Published: ${blogsData.filter(b => b.STATUS === 'LIVE').length} blogs`);
    console.log(`  Drafts: ${blogsData.filter(b => b.STATUS !== 'LIVE').length} blogs`);
    console.log(`  Errors: ${errorCount} blogs`);

    if (warnings.length > 0) {
      console.log(`\n⚠ Image Warnings (${warnings.length}):`);
      console.log('Some blogs reference image IDs instead of URLs.');
      console.log('You\'ll need to:');
      console.log('  1. Download images from your old server');
      console.log('  2. Upload to Supabase Storage (blog-images bucket)');
      console.log('  3. Update cover_image_url in Supabase');
      console.log('');
      console.log('First 5 blogs with image IDs:');
      warnings.slice(0, 5).forEach(({ blog, warning }) => {
        console.log(`  - ${blog}: ${warning}`);
      });
      if (warnings.length > 5) {
        console.log(`  ... and ${warnings.length - 5} more`);
      }
    }

    if (errors.length > 0) {
      console.log('\n⚠ Errors:');
      errors.forEach(({ blog, error }) => {
        console.log(`  - ${blog}: ${error}`);
      });
    }

    console.log('\nNext steps:');
    console.log('  1. Go to Supabase Dashboard → Table Editor → blogs');
    console.log('  2. Verify your blogs are imported correctly');
    console.log('  3. If you have images, upload them to Supabase Storage');
    console.log('  4. Update image URLs in the blogs table');
    console.log('  5. Visit your website to see the blogs!');
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

importDivijBlogs();
