import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Pencil, Send } from 'lucide-react';

export default async function NewsletterListPage() {
  const supabase = createAdminClient();

  const { data: newsletters, error } = await supabase
    .from('newsletters')
    .select('id, subject, status, created_at, published_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Newsletters</h1>
        <p className="text-destructive">Failed to load newsletters: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Newsletters</h1>
          <p className="text-muted-foreground mt-2">Drafts and published newsletter content.</p>
        </div>
        <Link href="/admin/newsletter/new">
          <Button>New Newsletter</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All newsletters
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!newsletters || newsletters.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No newsletters yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Subject</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Updated</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {newsletters.map((n) => (
                    <tr key={n.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-2">
                        <div className="font-medium">{n.subject}</div>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-sm text-muted-foreground">{n.status}</span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(n.updated_at ?? n.created_at).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="inline-flex gap-2">
                          <Link href={`/admin/newsletter/${n.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </Link>
                          <Link href={`/admin/newsletter/${n.id}/send`}>
                            <Button size="sm">
                              <Send className="h-4 w-4 mr-2" />
                              Send
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


