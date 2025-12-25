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

  // Get all projects without slugs
  const { data: projects, error: fetchError } = await supabase
    .from('projects')
    .select('id, title, slug')
    .or('slug.is.null,slug.eq.');

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!projects || projects.length === 0) {
    return NextResponse.json({
      message: 'No projects need migration',
      updated: 0
    });
  }

  const updates = [];
  const slugMap = new Map<string, number>(); // Track slug usage to handle duplicates

  for (const project of projects) {
    let slug = generateSlug(project.title);

    // Handle duplicate slugs by appending a number
    const count = slugMap.get(slug) || 0;
    if (count > 0) {
      slug = `${slug}-${count}`;
    }
    slugMap.set(slug, count + 1);

    updates.push(
      supabase
        .from('projects')
        .update({ slug })
        .eq('id', project.id)
    );
  }

  // Execute all updates
  const results = await Promise.all(updates);
  const errors = results.filter(r => r.error);

  if (errors.length > 0) {
    return NextResponse.json({
      error: 'Some updates failed',
      details: errors.map(e => e.error?.message),
      updated: results.length - errors.length,
      failed: errors.length
    }, { status: 500 });
  }

  return NextResponse.json({
    message: 'Projects migrated successfully',
    updated: results.length
  });
}
