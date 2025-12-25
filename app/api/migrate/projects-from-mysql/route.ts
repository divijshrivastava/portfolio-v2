import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(request: Request) {
  const supabase = await createClient();

  // Verify user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let mysqlConnection;

  try {
    // Connect to MySQL
    mysqlConnection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    // Fetch all projects from MySQL PROJECT table
    const [rows] = await mysqlConnection.execute(
      'SELECT * FROM PROJECT ORDER BY PUBLISH_TIMESTAMP DESC'
    );

    const mysqlProjects = rows as any[];

    if (!mysqlProjects || mysqlProjects.length === 0) {
      return NextResponse.json({
        message: 'No projects found in MySQL',
        migrated: 0
      });
    }

    // Get existing projects from Supabase to check for duplicates
    const { data: existingProjects } = await supabase
      .from('projects')
      .select('title, slug');

    const existingTitles = new Set(existingProjects?.map(p => p.title) || []);
    const existingSlugs = new Set(existingProjects?.map(p => p.slug) || []);

    let migrated = 0;
    let skipped = 0;
    const errors = [];

    for (const project of mysqlProjects) {
      // Map MySQL PROJECT table to Supabase projects table
      const title = project.HEADING || 'Untitled Project';

      // Skip if already exists
      if (existingTitles.has(title)) {
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
        errors.push({
          title: project.title,
          error: error.message
        });
      } else {
        migrated++;
      }
    }

    return NextResponse.json({
      message: 'Migration completed',
      total: mysqlProjects.length,
      migrated,
      skipped,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({
      error: 'Migration failed',
      details: error.message
    }, { status: 500 });
  } finally {
    if (mysqlConnection) {
      await mysqlConnection.end();
    }
  }
}
