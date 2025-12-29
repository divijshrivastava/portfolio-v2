/**
 * Backfill Script: Generate OG Images for Existing Content
 * 
 * This script generates optimized Open Graph images (1200x630 WebP) for all
 * existing published blogs and projects that don't have an og_image_url yet.
 * 
 * Run with: npm run backfill:og-images
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { optimizeImageForOG, downloadImage } from '../lib/utils/image-optimization';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Project {
  id: string;
  title: string;
  image_url: string | null;
  og_image_url: string | null;
}

interface Blog {
  id: string;
  title: string;
  cover_image_url: string | null;
  og_image_url: string | null;
}

async function generateOGImage(
  imageUrl: string,
  bucket: string,
  filename: string
): Promise<string | null> {
  try {
    console.log(`   📥 Downloading: ${imageUrl}`);
    const imageBuffer = await downloadImage(imageUrl);
    
    console.log(`   🔧 Optimizing to 1200x630 WebP...`);
    const optimizedBuffer = await optimizeImageForOG(imageBuffer);
    
    console.log(`   📤 Uploading: ${filename}`);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, optimizedBuffer, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (uploadError) {
      console.error(`   ❌ Upload failed:`, uploadError.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(uploadData.path);

    console.log(`   ✅ Generated: ${publicUrlData.publicUrl}`);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error(`   ❌ Error:`, error instanceof Error ? error.message : error);
    return null;
  }
}

async function backfillProjects() {
  console.log('\n📦 Backfilling Projects...\n');
  
  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, title, image_url, og_image_url')
    .eq('status', 'published')
    .is('og_image_url', null)
    .not('image_url', 'is', null);

  if (error) {
    console.error('❌ Failed to fetch projects:', error.message);
    return;
  }

  if (!projects || projects.length === 0) {
    console.log('✅ No projects need OG image generation\n');
    return;
  }

  console.log(`Found ${projects.length} project(s) to process:\n`);

  let successCount = 0;
  let failCount = 0;

  for (const project of projects as Project[]) {
    console.log(`🔨 Processing: "${project.title}" (ID: ${project.id})`);
    
    if (!project.image_url?.trim()) {
      console.log(`   ⏭️  Skipping: No image URL\n`);
      continue;
    }

    const ogImageFilename = `${project.id}-og.webp`;
    const ogImageUrl = await generateOGImage(
      project.image_url,
      'project-images',
      ogImageFilename
    );

    if (ogImageUrl) {
      const { error: updateError } = await supabase
        .from('projects')
        .update({ og_image_url: ogImageUrl })
        .eq('id', project.id);

      if (updateError) {
        console.error(`   ❌ Failed to update database:`, updateError.message);
        failCount++;
      } else {
        console.log(`   💾 Database updated\n`);
        successCount++;
      }
    } else {
      failCount++;
    }
  }

  console.log(`\n📊 Projects Summary: ${successCount} succeeded, ${failCount} failed\n`);
}

async function backfillBlogs() {
  console.log('\n📝 Backfilling Blogs...\n');
  
  const { data: blogs, error } = await supabase
    .from('blogs')
    .select('id, title, cover_image_url, og_image_url')
    .eq('status', 'published')
    .is('og_image_url', null)
    .not('cover_image_url', 'is', null);

  if (error) {
    console.error('❌ Failed to fetch blogs:', error.message);
    return;
  }

  if (!blogs || blogs.length === 0) {
    console.log('✅ No blogs need OG image generation\n');
    return;
  }

  console.log(`Found ${blogs.length} blog(s) to process:\n`);

  let successCount = 0;
  let failCount = 0;

  for (const blog of blogs as Blog[]) {
    console.log(`📄 Processing: "${blog.title}" (ID: ${blog.id})`);
    
    if (!blog.cover_image_url?.trim()) {
      console.log(`   ⏭️  Skipping: No cover image\n`);
      continue;
    }

    const ogImageFilename = `${blog.id}-og.webp`;
    const ogImageUrl = await generateOGImage(
      blog.cover_image_url,
      'blog-images',
      ogImageFilename
    );

    if (ogImageUrl) {
      const { error: updateError } = await supabase
        .from('blogs')
        .update({ og_image_url: ogImageUrl })
        .eq('id', blog.id);

      if (updateError) {
        console.error(`   ❌ Failed to update database:`, updateError.message);
        failCount++;
      } else {
        console.log(`   💾 Database updated\n`);
        successCount++;
      }
    } else {
      failCount++;
    }
  }

  console.log(`\n📊 Blogs Summary: ${successCount} succeeded, ${failCount} failed\n`);
}

async function main() {
  console.log('🚀 Starting OG Image Backfill Process...');
  console.log('=====================================');
  
  await backfillProjects();
  await backfillBlogs();
  
  console.log('✨ Backfill complete!\n');
}

main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});

