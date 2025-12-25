import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createClient();

    console.log('Testing blog detail fetch for slug:', slug);

    const { data: blog, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
        slug,
      }, { status: 500 });
    }

    if (!blog) {
      return NextResponse.json({
        success: false,
        error: 'Blog not found',
        slug,
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      blog: {
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        created_at: blog.created_at,
        hasContent: !!blog.content,
        contentLength: blog.content?.length || 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
