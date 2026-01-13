import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  // Check what newsletters exist and their public status
  const { data: allNewsletters, error: allError } = await supabase
    .from('newsletters')
    .select('id, subject, status, is_public, published_at')
    .order('created_at', { ascending: false })
    .limit(10);

  // Check what the public query would return
  const { data: publicNewsletters, error: publicError } = await supabase
    .from('newsletters')
    .select('id, subject, preview_text, published_at')
    .eq('is_public', true)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  return NextResponse.json({
    allNewsletters: allError ? { error: allError.message } : allNewsletters,
    publicNewsletters: publicError ? { error: publicError.message } : publicNewsletters,
    note: 'All newsletters show all (with is_public status), public newsletters show what appears on /newsletters page',
  });
}

