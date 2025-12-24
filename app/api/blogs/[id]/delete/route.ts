import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Verify user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    redirect('/login');
  }

  // Delete the blog
  await supabase
    .from('blogs')
    .delete()
    .eq('id', id);

  redirect('/admin/blogs');
}
