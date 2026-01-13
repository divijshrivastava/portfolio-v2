import Link from 'next/link';
import { unsubscribeFromNewsletter } from '@/app/actions/newsletter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Unsubscribe | Divij Shrivastava',
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = await unsubscribeFromNewsletter({ token: token || '' });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Unsubscribe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.success ? (
              <p className="text-sm text-emerald-600">{result.message}</p>
            ) : (
              <p className="text-sm text-destructive">{result.error}</p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link href="/newsletter">Newsletter page</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/">Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


