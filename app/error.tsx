'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Home, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <Card>
          <CardContent className="p-12 text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-destructive">
                Application Error
              </h1>
              <p className="text-muted-foreground">
                A server-side exception has occurred while loading this page.
              </p>
            </div>

            {error.message && (
              <div className="bg-muted p-4 rounded-lg text-left">
                <p className="text-sm font-medium mb-1">Error Details:</p>
                <p className="text-sm text-muted-foreground font-mono break-all">
                  {error.message}
                </p>
              </div>
            )}

            {error.digest && (
              <p className="text-xs text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button onClick={reset} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Go Home
                </Link>
              </Button>
            </div>

            <div className="pt-6 border-t text-left">
              <p className="text-sm text-muted-foreground mb-2">
                If this error persists, please check:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Server logs for more detailed error information</li>
                <li>Environment variables are properly configured</li>
                <li>Database connection is working</li>
                <li>All required services are running</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

