'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console
    console.error('Blog page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto">
        <Button asChild variant="ghost" className="mb-8">
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>

        <Card>
          <CardContent className="p-12 text-center space-y-4">
            <h2 className="text-2xl font-bold text-destructive">
              Something went wrong!
            </h2>
            <p className="text-muted-foreground">
              {error.message || 'An error occurred while loading this blog post.'}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
            <div className="flex gap-4 justify-center pt-4">
              <Button onClick={reset}>Try again</Button>
              <Button asChild variant="outline">
                <Link href="/blog">View all blogs</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
