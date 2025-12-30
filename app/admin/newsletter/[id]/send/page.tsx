'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send } from 'lucide-react';

type AudienceType = 'all' | 'source' | 'manual';

export default function SendNewsletterPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const newsletterId = params.id;

  const [isLoading, setIsLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  const [audienceType, setAudienceType] = useState<AudienceType>('all');
  const [source, setSource] = useState('');
  const [manualEmails, setManualEmails] = useState('');
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('newsletters')
        .select('id, subject, status')
        .eq('id', newsletterId)
        .single();

      if (error) {
        console.error('Failed to load newsletter:', error);
        alert(`Failed to load newsletter: ${error.message}`);
        router.push('/admin/newsletter');
        return;
      }

      setSubject(data.subject);
      setStatus(data.status);
      setIsLoading(false);
    };
    load();
  }, [newsletterId, router, supabase]);

  const computeRecipientCount = async () => {
    if (audienceType === 'manual') {
      const parsed = manualEmails
        .split(/[\n,; ]+/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const uniq = Array.from(new Set(parsed));
      setRecipientCount(uniq.length);
      return;
    }

    if (audienceType === 'source') {
      if (!source.trim()) {
        setRecipientCount(0);
        return;
      }
      const { count } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('source', source.trim());
      setRecipientCount(count ?? 0);
      return;
    }

    const { count } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true });
    setRecipientCount(count ?? 0);
  };

  useEffect(() => {
    setRecipientCount(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audienceType, source, manualEmails]);

  const handleSend = async () => {
    if (status !== 'published') {
      alert('Please publish the newsletter first (Edit → Publish).');
      return;
    }

    let audience: any = null;
    if (audienceType === 'all') {
      audience = { type: 'all' };
    } else if (audienceType === 'source') {
      const s = source.trim();
      if (!s) {
        alert('Source is required for source targeting.');
        return;
      }
      audience = { type: 'source', source: s };
    } else {
      const emails = manualEmails
        .split(/[\n,; ]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (emails.length === 0) {
        alert('Please enter at least one email.');
        return;
      }
      audience = { type: 'manual', emails };
    }

    if (!confirm(`Send “${subject}” now?`)) return;

    setIsSending(true);
    const res = await fetch('/api/admin/newsletter/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newsletterId, audience }),
    });
    const json = await res.json().catch(() => ({}));
    setIsSending(false);

    if (!res.ok) {
      alert(json.error || 'Failed to send newsletter');
      return;
    }

    router.push(`/admin/newsletter/history/${json.sendId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 bg-muted animate-pulse rounded" />
        <div className="h-5 w-96 bg-muted animate-pulse rounded" />
        <div className="h-48 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href={`/admin/newsletter/${newsletterId}/edit`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Send Newsletter</h1>
            <p className="text-muted-foreground mt-2">
              <span className="font-medium">Subject:</span> {subject}
            </p>
          </div>
        </div>
        <Button onClick={handleSend} disabled={isSending}>
          <Send className="h-4 w-4 mr-2" />
          {isSending ? 'Sending…' : 'Send now'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recipients</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                checked={audienceType === 'all'}
                onChange={() => setAudienceType('all')}
              />
              <span>Everyone subscribed</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                checked={audienceType === 'source'}
                onChange={() => setAudienceType('source')}
              />
              <span>By source</span>
            </label>
            {audienceType === 'source' && (
              <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. footer, blog_index" />
            )}
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                checked={audienceType === 'manual'}
                onChange={() => setAudienceType('manual')}
              />
              <span>Manual list</span>
            </label>
            {audienceType === 'manual' && (
              <Textarea
                value={manualEmails}
                onChange={(e) => setManualEmails(e.target.value)}
                placeholder="one@email.com\nother@email.com"
                rows={6}
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={computeRecipientCount}>
              Calculate recipient count
            </Button>
            {recipientCount !== null && (
              <span className="text-sm text-muted-foreground">{recipientCount} recipients</span>
            )}
          </div>

          {status !== 'published' && (
            <p className="text-sm text-destructive">
              This newsletter is still a draft. Publish it first before sending.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


