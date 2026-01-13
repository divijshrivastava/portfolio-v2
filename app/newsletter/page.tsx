import Link from 'next/link';
import { NewsletterCTA } from '@/components/newsletter/newsletter-cta';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Newsletter | Divij Shrivastava',
  description: 'Subscribe for occasional engineering write-ups: system design, performance, and real production lessons.',
};

export default function NewsletterPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Newsletter</h1>
          <p className="text-lg text-muted-foreground">
            Occasional emails on system design, performance, and lessons from building production systems.
          </p>
        </div>

        <NewsletterCTA
          source="newsletter_page"
          title="Subscribe"
          description="No spam. Unsubscribe anytime."
          className="max-w-2xl"
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">What you’ll get</CardTitle>
            <CardDescription>Short, useful notes — not marketing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <ul className="list-disc pl-5 space-y-2">
              <li>Deep dives into real engineering problems and trade-offs</li>
              <li>System design breakdowns and performance tuning lessons</li>
              <li>Links to new blog posts and projects</li>
            </ul>
            <div className="pt-2">
              <Button asChild variant="outline">
                <Link href="/blog">Read the blog</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          By subscribing you agree to receive emails from me. You can unsubscribe at any time.
        </p>
      </div>
    </div>
  );
}


