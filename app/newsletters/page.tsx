import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calendar, Mail, ArrowRight } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Newsletter Archive | Divij Shrivastava',
  description: 'Browse past newsletters on tech, development, and insights.',
  openGraph: {
    title: 'Newsletter Archive | Divij Shrivastava',
    description: 'Browse past newsletters on tech, development, and insights.',
  },
};

export default async function NewslettersArchivePage() {
  const supabase = await createClient();

  // Fetch public newsletters (is_public=true, status='published')
  const { data: newsletters, error } = await supabase
    .from('newsletters')
    .select('id, subject, preview_text, published_at, created_at')
    .eq('is_public', true)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching newsletters:', error);
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Newsletter Archive
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse past newsletters covering tech, development insights, and project updates.
          </p>
          <div className="pt-4">
            <Link href="/newsletter">
              <Button size="lg" className="gap-2">
                <Mail className="h-5 w-5" />
                Subscribe to Newsletter
              </Button>
            </Link>
          </div>
        </div>

        {/* Newsletter List */}
        {!newsletters || newsletters.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No newsletters published yet. Check back soon!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {newsletters.map((newsletter) => (
              <Card key={newsletter.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <CardTitle className="text-2xl">{newsletter.subject}</CardTitle>
                      {newsletter.preview_text && (
                        <p className="text-muted-foreground">
                          {newsletter.preview_text}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <time dateTime={newsletter.published_at || newsletter.created_at}>
                          {new Date(newsletter.published_at || newsletter.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </time>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Link href={`/newsletter/${newsletter.id}`}>
                    <Button variant="outline" className="gap-2">
                      Read Full Newsletter
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Subscribe CTA at bottom */}
        {newsletters && newsletters.length > 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8 text-center space-y-4">
              <h3 className="text-2xl font-bold">Like what you see?</h3>
              <p className="text-muted-foreground">
                Get new newsletters delivered straight to your inbox.
              </p>
              <Link href="/newsletter">
                <Button size="lg" className="gap-2">
                  <Mail className="h-5 w-5" />
                  Subscribe Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

