'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MailOpen, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading messages:', error);
    } else {
      setMessages(data || []);
    }
    setIsLoading(false);
  };

  const handleMarkAsRead = async (id: string, currentStatus: boolean) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('messages')
      .update({ is_read: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating message:', error);
      alert('Failed to update message status');
    } else {
      loadMessages();
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the message from ${name}?`)) {
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    } else {
      loadMessages();
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Messages</h2>
        <p className="text-muted-foreground mt-2">
          {unreadCount} unread message{unreadCount !== 1 ? 's' : ''} out of {messages.length} total
        </p>
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No messages yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card
              key={message.id}
              className={message.is_read ? '' : 'border-primary'}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {message.is_read ? (
                      <MailOpen className="h-5 w-5 text-muted-foreground mt-1" />
                    ) : (
                      <Mail className="h-5 w-5 text-primary mt-1" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{message.name}</CardTitle>
                        {!message.is_read && (
                          <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{message.email}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(message.created_at).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsRead(message.id, message.is_read)}
                    >
                      {message.is_read ? 'Mark Unread' : 'Mark Read'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(message.id, message.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{message.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
