import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import { NewsletterCTA } from '@/components/newsletter/newsletter-cta';

export const revalidate = 3600; // Revalidate every hour

export default async function BlogPage() {
  const supabase = await createClient();

  const { data: blogs } = await supabase
    .from('blogs')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-primary">Blog</h1>
          <p className="text-xl text-muted-foreground mb-12">
            I write about real engineering problems, architectural trade-offs, and lessons learned from building production
            systems. Expect deep dives into system design, performance optimization, and the practical challenges of
            full-stack development—no fluff, just engineering insights.
          </p>

          {blogs && blogs.length > 0 ? (
            <div className="space-y-8">
              {blogs.map((blog) => (
                <Link key={blog.id} href={`/blog/${blog.slug}`}>
                  <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer group">
                    <div className="grid md:grid-cols-3 gap-6">
                      {blog.thumbnail_url && (
                        <div className="md:col-span-1 relative h-48 md:h-full">
                          <Image
                            src={blog.thumbnail_url}
                            alt={blog.title}
                            fill
                            className="object-cover rounded-l-lg"
                          />
                        </div>
                      )}
                      <div className={blog.thumbnail_url ? 'md:col-span-2' : 'md:col-span-3'}>
                        <CardHeader>
                          <CardTitle className="text-2xl text-primary group-hover:text-secondary transition-colors">
                            {blog.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {blog.summary}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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
                        </CardContent>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No blog posts yet. Check back soon!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <NewsletterCTA
        source="blog_index"
        title="Subscribe for new posts"
        description="Get notified when a new deep-dive drops."
        className="my-12 mx-auto max-w-7xl w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)]"
      />
    </>
  );
}
