import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

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

  try {
    const body = await request.json();
    const { projects } = body;

    if (!projects || !Array.isArray(projects)) {
      return NextResponse.json({
        error: 'Invalid request body. Expected { projects: [...] }'
      }, { status: 400 });
    }

    if (projects.length === 0) {
      return NextResponse.json({
        message: 'No projects to migrate',
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

    for (const project of projects) {
      // Skip if already exists
      if (existingTitles.has(project.title)) {
        skipped++;
        continue;
      }

      // Generate unique slug
      let slug = generateSlug(project.title);
      let slugCounter = 1;
      while (existingSlugs.has(slug)) {
        slug = `${generateSlug(project.title)}-${slugCounter}`;
        slugCounter++;
      }
      existingSlugs.add(slug);

      // Prepare data for Supabase
      const supabaseProject = {
        title: project.title,
        slug: slug,
        description: project.description || '',
        image_url: project.image_url || null,
        project_url: project.project_url || null,
        github_url: project.github_url || null,
        youtube_url: project.youtube_url || null,
        status: project.status === 'published' ? 'published' : 'draft',
        created_at: project.created_at || new Date().toISOString(),
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
      total: projects.length,
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
  }
}
