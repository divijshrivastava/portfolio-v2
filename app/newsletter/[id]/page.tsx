import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calendar, Mail, ArrowLeft, Link as LinkIcon } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface NewsletterPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: NewsletterPageProps): Promise<Metadata> {
  const supabase = await createClient();
  
  const { data: newsletter } = await supabase
    .from('newsletters')
    .select('subject, preview_text')
    .eq('id', params.id)
    .eq('is_public', true)
    .eq('status', 'published')
    .single();

  if (!newsletter) {
    return {
      title: 'Newsletter Not Found',
    };
  }

  return {
    title: `${newsletter.subject} | Newsletter`,
    description: newsletter.preview_text || 'Read this newsletter from Divij Shrivastava',
    openGraph: {
      title: newsletter.subject,
      description: newsletter.preview_text || 'Read this newsletter from Divij Shrivastava',
      type: 'article',
    },
  };
}

export default async function NewsletterPage({ params }: NewsletterPageProps) {
  const supabase = await createClient();

  const { data: newsletter, error } = await supabase
    .from('newsletters')
    .select('*')
    .eq('id', params.id)
    .eq('is_public', true)
    .eq('status', 'published')
    .single();

  if (error || !newsletter) {
    notFound();
  }

  const attachments = Array.isArray(newsletter.attachments) ? newsletter.attachments : [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <article className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Link href="/newsletters">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Archive
            </Button>
          </Link>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            {newsletter.subject}
          </h1>

          {newsletter.preview_text && (
            <p className="text-xl text-muted-foreground">
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

        <hr className="border-border" />

        {/* Content */}
        <div 
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: newsletter.body_html }}
        />

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="space-y-4 pt-8 border-t">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Featured Links
            </h3>
            <div className="grid gap-3">
              {attachments.map((attachment: any, index: number) => {
                let href = '';
                let label = attachment.title || 'Link';
                
                if (attachment.type === 'blog' && attachment.slug) {
                  href = `/blog/${attachment.slug}`;
                  label = `📝 ${attachment.title}`;
                } else if (attachment.type === 'project' && attachment.slug) {
                  href = `/projects/${attachment.slug}`;
                  label = `💼 ${attachment.title}`;
                } else if (attachment.type === 'link' && attachment.url) {
                  href = attachment.url;
                  label = `🔗 ${attachment.title}`;
                }

                if (!href) return null;

                return (
                  <Link
                    key={index}
                    href={href}
                    target={attachment.type === 'link' ? '_blank' : undefined}
                    rel={attachment.type === 'link' ? 'noopener noreferrer' : undefined}
                    className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <span className="font-medium">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Subscribe CTA */}
        <div className="pt-8 border-t space-y-4 text-center">
          <h3 className="text-2xl font-bold">Enjoyed this newsletter?</h3>
          <p className="text-muted-foreground">
            Subscribe to get new newsletters delivered to your inbox.
          </p>
          <Link href="/newsletter">
            <Button size="lg" className="gap-2">
              <Mail className="h-5 w-5" />
              Subscribe to Newsletter
            </Button>
          </Link>
        </div>
      </article>
    </div>
  );
}

