import { notFound } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateStaticParams() {
  // For build time, return empty array to allow dynamic generation
  // In production, pages will be generated on-demand with ISR
  return [];
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  try {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: blog, error } = await supabase
      .from('blogs')
      .select('title, summary, cover_image_url, og_image_url')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !blog) {
      console.error('Metadata fetch error:', error);
      return {
        title: 'Blog Not Found',
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://divij.tech';

    // Prefer optimized OG image if available, otherwise use cover image
    let ogImage = `${baseUrl}/og-image.png`; // Default fallback (1200x630)
    
    if (blog.og_image_url && blog.og_image_url.trim()) {
      // Use optimized OG image if available
      ogImage = blog.og_image_url.startsWith('http') 
        ? blog.og_image_url 
        : `${baseUrl}${blog.og_image_url.startsWith('/') ? blog.og_image_url : `/${blog.og_image_url}`}`;
    } else if (blog.cover_image_url) {
      // Fallback to cover image
      ogImage = blog.cover_image_url.startsWith('http') 
        ? blog.cover_image_url 
        : `${baseUrl}${blog.cover_image_url.startsWith('/') ? blog.cover_image_url : `/${blog.cover_image_url}`}`;
    }

    return {
      title: blog.title,
      description: blog.summary || blog.title,
      openGraph: {
        title: blog.title,
        description: blog.summary || blog.title,
        type: 'article',
        url: `${baseUrl}/blog/${slug}`,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: blog.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.title,
        description: blog.summary || blog.title,
        images: [ogImage],
      },
    };
  } catch (error) {
    console.error('Metadata generation error:', error);
    return {
      title: 'Blog',
    };
  }
}

export default async function BlogPost({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  try {
    const { slug } = await params;
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

    // Skip view count for now to isolate issue
    // try {
    //   await supabase
    //     .from('blogs')
    //     .update({ views: (blog.views || 0) + 1 })
    //     .eq('id', blog.id);
    // } catch (viewError) {
    //   console.error('View count update failed:', viewError);
    // }

    return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <Button asChild variant="ghost" className="mb-8">
                <Link href="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Blog
                </Link>
              </Button>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8">
                {blog.title}
              </h1>

              <div className="flex flex-wrap items-center justify-center gap-4 text-muted-foreground mb-8">
                <div className="flex items-center gap-2">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20">
                    <Image
                      src="/divij-avatar.jpg"
                      alt="Divij Shrivastava"
                      fill
                      className="object-cover"
                      style={{ objectPosition: 'center 30%' }}
                    />
                  </div>
                  <span className="font-medium text-foreground">Divij Shrivastava</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(blog.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                {blog.read_time && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {blog.read_time} min read
                    </div>
                  </>
                )}
              </div>

              {blog.summary && (
                <p className="text-lg sm:text-xl text-muted-foreground italic max-w-3xl mx-auto mb-12">
                  {blog.summary}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {blog.cover_image_url && (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12">
            <div className="max-w-5xl mx-auto">
              <div className="relative w-full h-64 sm:h-96 lg:h-[500px] rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src={blog.cover_image_url}
                  alt={blog.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        )}

        {/* Article Content */}
        <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto">
            <div
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>
        </article>
      </div>
    );
  } catch (error: any) {
    console.error('BlogPost error:', error);
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Blog</h1>
          <p className="text-muted-foreground mb-4">{error?.message || 'Unknown error'}</p>
          <Button asChild>
            <Link href="/blog">Back to Blog</Link>
          </Button>
        </div>
      </div>
    );
  }
}
