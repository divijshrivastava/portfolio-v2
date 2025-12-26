import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Creating blog with data:', { ...body, content: '...(truncated)' });

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('blogs')
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating blog:', error);
      return NextResponse.json({
        error: error.message || 'Failed to create blog',
        details: error
      }, { status: 400 });
    }

    console.log('Blog created successfully:', data?.id);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('Exception in create blog API:', error);
    return NextResponse.json({
      error: error.message || 'Internal server error',
      details: error.toString()
    }, { status: 500 });
  }
}
