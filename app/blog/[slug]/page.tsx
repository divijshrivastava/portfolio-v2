import { notFound } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const revalidate = 3600;

export async function generateStaticParams() {
  // For build time, return empty array to allow dynamic generation
  // In production, pages will be generated on-demand with ISR
  return [];
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const { slug } = await Promise.resolve(params);
    const supabase = await createClient();

    const { data: blog, error } = await supabase
      .from('blogs')
      .select('title, summary')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !blog) {
      console.error('Metadata fetch error:', error);
      return {
        title: 'Blog Not Found',
      };
    }

    return {
      title: blog.title,
      description: blog.summary || blog.title,
    };
  } catch (error) {
    console.error('Metadata generation error:', error);
    return {
      title: 'Blog',
    };
  }
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  try {
    const { slug } = await Promise.resolve(params);
    const supabase = await createClient();

    const { data: blog, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !blog) {
      console.error('Blog fetch error:', error);
      notFound();
    }

    // Increment view count
    await supabase
      .from('blogs')
      .update({ views: (blog.views || 0) + 1 })
      .eq('id', blog.id);

  return (
    <div className="min-h-screen">
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <Button asChild variant="ghost" className="mb-8">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </Button>

          <h1 className="text-4xl sm:text-5xl font-bold mb-6">{blog.title}</h1>

          <div className="flex flex-wrap gap-4 text-muted-foreground mb-8">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(blog.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            {blog.read_time && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {blog.read_time} min read
              </div>
            )}
          </div>

          {blog.cover_image_url && (
            <div className="relative w-full h-64 sm:h-96 mb-8 rounded-lg overflow-hidden">
              <Image
                src={blog.cover_image_url}
                alt={blog.title}
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
          )}

          <div
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>
      </article>
    </div>
  );
  } catch (error) {
    console.error('Blog page render error:', error);
    notFound();
  }
}
