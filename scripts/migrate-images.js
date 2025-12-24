/**
 * Migrate images from local directory to Supabase Storage
 *
 * Usage:
 * 1. Download all images from your old server to ./images directory
 * 2. Organize them:
 *    - ./images/blogs/ (blog images)
 *    - ./images/projects/ (project images)
 *    - ./images/resume/ (resume files)
 * 3. Run: node scripts/migrate-images.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function migrateImages() {
  try {
    console.log('Connecting to Supabase...');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const imagesDir = path.join(__dirname, '../images');

    // Helper function to upload file
    async function uploadFile(filePath, bucket, fileName) {
      try {
        const file = await fs.readFile(filePath);
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            contentType: getContentType(fileName),
            upsert: true
          });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        return publicUrl;
      } catch (error) {
        console.error(`Error uploading ${fileName}:`, error.message);
        return null;
      }
    }

    // Helper function to get content type
    function getContentType(fileName) {
      const ext = path.extname(fileName).toLowerCase();
      const types = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.pdf': 'application/pdf',
      };
      return types[ext] || 'application/octet-stream';
    }

    // Upload blog images
    console.log('\nUploading blog images...');
    const blogImagesDir = path.join(imagesDir, 'blogs');
    try {
      const files = await fs.readdir(blogImagesDir);
      for (const file of files) {
        const filePath = path.join(blogImagesDir, file);
        const stat = await fs.stat(filePath);

        if (stat.isFile()) {
          const url = await uploadFile(filePath, 'blog-images', file);
          if (url) {
            console.log(`✓ Uploaded: ${file} -> ${url}`);
          }
        }
      }
    } catch (error) {
      console.log('No blog images found or error:', error.message);
    }

    // Upload project images
    console.log('\nUploading project images...');
    const projectImagesDir = path.join(imagesDir, 'projects');
    try {
      const files = await fs.readdir(projectImagesDir);
      for (const file of files) {
        const filePath = path.join(projectImagesDir, file);
        const stat = await fs.stat(filePath);

        if (stat.isFile()) {
          const url = await uploadFile(filePath, 'project-images', file);
          if (url) {
            console.log(`✓ Uploaded: ${file} -> ${url}`);
          }
        }
      }
    } catch (error) {
      console.log('No project images found or error:', error.message);
    }

    // Upload resume files
    console.log('\nUploading resume files...');
    const resumeDir = path.join(imagesDir, 'resume');
    try {
      const files = await fs.readdir(resumeDir);
      for (const file of files) {
        const filePath = path.join(resumeDir, file);
        const stat = await fs.stat(filePath);

        if (stat.isFile()) {
          const url = await uploadFile(filePath, 'resume-files', file);
          if (url) {
            console.log(`✓ Uploaded: ${file} -> ${url}`);

            // Insert into resume table
            const fileStats = await fs.stat(filePath);
            await supabase.from('resume').insert({
              file_url: url,
              file_name: file,
              file_size: fileStats.size,
              is_current: true,
            });
          }
        }
      }
    } catch (error) {
      console.log('No resume files found or error:', error.message);
    }

    console.log('\n✓ Image migration completed!');
    console.log('\nNext steps:');
    console.log('1. Verify images in Supabase Storage Dashboard');
    console.log('2. Update any hardcoded image URLs in your database');
    console.log('3. Test image loading in your application');

  } catch (error) {
    console.error('Error migrating images:', error);
    process.exit(1);
  }
}

migrateImages();
