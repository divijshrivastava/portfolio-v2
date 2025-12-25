/**
 * Import projects from MySQL export to Supabase
 *
 * Usage:
 * 1. Make sure projects.json exists in exports/
 * 2. Make sure .env.local has Supabase credentials
 * 3. Run: node scripts/import-projects.js
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

async function importProjects() {
  try {
    console.log('========================================');
    console.log('  Import Projects to Supabase');
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

    // Read projects data
    console.log('Reading projects.json...');
    const dataPath = path.join(__dirname, '../exports/projects.json');
    const rawData = await fs.readFile(dataPath, 'utf8');
    const projects = JSON.parse(rawData);
    console.log(`✓ Found ${projects.length} projects\n`);

    if (projects.length === 0) {
      console.log('No projects to import.');
      return;
    }

    // Get existing projects to check for duplicates
    console.log('Checking for existing projects...');
    const { data: existingProjects, error: fetchError } = await supabase
      .from('projects')
      .select('title, slug');

    if (fetchError) {
      throw new Error(`Failed to fetch existing projects: ${fetchError.message}`);
    }

    const existingTitles = new Set(existingProjects?.map(p => p.title) || []);
    const existingSlugs = new Set(existingProjects?.map(p => p.slug) || []);
    console.log(`✓ Found ${existingProjects?.length || 0} existing projects\n`);

    // Import projects
    console.log('Starting import...\n');
    let imported = 0;
    let skipped = 0;
    let failed = 0;

    for (const project of projects) {
      // Map MySQL PROJECT table to Supabase projects table
      const title = project.HEADING || 'Untitled Project';

      // Skip if already exists
      if (existingTitles.has(title)) {
        console.log(`⊗ Skipped (exists): ${title}`);
        skipped++;
        continue;
      }

      // Generate unique slug from HEADING
      let slug = generateSlug(title);
      let slugCounter = 1;
      while (existingSlugs.has(slug)) {
        slug = `${generateSlug(title)}-${slugCounter}`;
        slugCounter++;
      }
      existingSlugs.add(slug);

      // Map STATUS: LIVE -> published, anything else -> draft
      const status = (project.STATUS === 'LIVE') ? 'published' : 'draft';

      // Prepare data for Supabase
      const supabaseProject = {
        title: title,
        slug: slug,
        description: project.description || '',
        image_url: null, // Not available in MySQL PROJECT table
        project_url: null, // Not available in MySQL PROJECT table
        github_url: null, // Not available in MySQL PROJECT table
        youtube_url: null, // Not available in MySQL PROJECT table
        status: status,
        created_at: project.PUBLISH_TIMESTAMP || project.INSERT_TIMESTAMP || new Date().toISOString(),
      };

      // Insert into Supabase
      const { error } = await supabase
        .from('projects')
        .insert(supabaseProject);

      if (error) {
        console.log(`✗ Failed: ${project.title} - ${error.message}`);
        failed++;
      } else {
        console.log(`✓ Imported: ${project.title}`);
        imported++;
      }
    }

    // Summary
    console.log('\n========================================');
    console.log('  Import Summary');
    console.log('========================================');
    console.log(`Total projects:     ${projects.length}`);
    console.log(`Successfully imported: ${imported}`);
    console.log(`Skipped (duplicates):  ${skipped}`);
    console.log(`Failed:                ${failed}`);
    console.log('========================================\n');

    if (imported > 0) {
      console.log('✓ Import completed successfully!\n');
    }

  } catch (error) {
    console.error('\n✗ Import failed:', error.message);
    process.exit(1);
  }
}

importProjects();
