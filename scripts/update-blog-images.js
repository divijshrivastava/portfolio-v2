/**
 * Update blog image URLs in Supabase
 *
 * After uploading images to Supabase Storage, this script updates
 * the placeholder paths to actual Supabase Storage URLs
 *
 * Usage:
 * 1. Upload all images to Supabase Storage bucket 'blog-images'
 * 2. Update SUPABASE_URL in this script
 * 3. Run: node scripts/update-blog-images.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function updateBlogImages() {
  try {
    console.log('========================================');
    console.log('  Update Blog Image URLs');
    console.log('========================================\n');

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

    // Get all blogs with placeholder image paths
    const { data: blogs, error: fetchError } = await supabase
      .from('blogs')
      .select('id, title, cover_image_url, thumbnail_url')
      .or('cover_image_url.like./images/blog/%,thumbnail_url.like./images/blog/%');

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${blogs.length} blogs with placeholder image paths\n`);

    if (blogs.length === 0) {
      console.log('No blogs need image URL updates!');
      return;
    }

    // Show what will be updated
    console.log('Image references to update:');
    console.log('━'.repeat(70));

    const imageIds = new Set();
    blogs.forEach(blog => {
      if (blog.cover_image_url && blog.cover_image_url.startsWith('/images/blog/')) {
        const match = blog.cover_image_url.match(/\/images\/blog\/(\d+)\.jpg/);
        if (match) imageIds.add(match[1]);
      }
      if (blog.thumbnail_url && blog.thumbnail_url.startsWith('/images/blog/')) {
        const match = blog.thumbnail_url.match(/\/images\/blog\/(\d+)\.jpg/);
        if (match) imageIds.add(match[1]);
      }
    });

    console.log(`Unique image IDs: ${Array.from(imageIds).join(', ')}\n`);

    // Ask for confirmation
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      readline.question('Update these image URLs? (yes/no): ', resolve);
    });
    readline.close();

    if (answer.toLowerCase() !== 'yes') {
      console.log('Cancelled.');
      return;
    }

    console.log('\nUpdating image URLs...');
    console.log('━'.repeat(70));

    let updateCount = 0;
    const storageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/blog-images`;

    for (const blog of blogs) {
      const updates = {};

      // Update cover image URL
      if (blog.cover_image_url && blog.cover_image_url.startsWith('/images/blog/')) {
        const filename = blog.cover_image_url.replace('/images/blog/', '');
        updates.cover_image_url = `${storageUrl}/${filename}`;
      }

      // Update thumbnail URL
      if (blog.thumbnail_url && blog.thumbnail_url.startsWith('/images/blog/')) {
        const filename = blog.thumbnail_url.replace('/images/blog/', '');
        updates.thumbnail_url = `${storageUrl}/${filename}`;
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('blogs')
          .update(updates)
          .eq('id', blog.id);

        if (updateError) {
          console.log(`✗ ${blog.title}: ${updateError.message}`);
        } else {
          updateCount++;
          console.log(`✓ ${blog.title}`);
        }
      }
    }

    console.log('━'.repeat(70));
    console.log(`\n✓ Updated ${updateCount} blogs\n`);

    console.log('Next steps:');
    console.log('  1. Verify images appear on your website');
    console.log('  2. If images are missing, check they exist in Supabase Storage');
    console.log('  3. Go to Storage → blog-images to see uploaded files\n');

  } catch (error) {
    console.error('\n✗ Error:', error.message);
    process.exit(1);
  }
}

updateBlogImages();
