'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserActivity {
  id: string;
  page_visited: string;
  visitor_ip: string;
  user_agent: string;
  created_at: string;
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    const supabase = createClient();

    const { count } = await supabase
      .from('user_activity')
      .select('*', { count: 'exact', head: true });

    const { data, error } = await supabase
      .from('user_activity')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error loading activities:', error);
    } else {
      setActivities(data || []);
      setTotalCount(count || 0);
    }
    setIsLoading(false);
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete all activity logs? This cannot be undone.')) {
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from('user_activity')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.error('Error clearing activities:', error);
      alert('Failed to clear activities');
    } else {
      alert('All activities cleared successfully!');
      loadActivities();
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold">User Activity</h2>
          <p className="text-muted-foreground mt-2">
            Total visits: {totalCount} (showing last 100)
          </p>
        </div>
        <Button variant="destructive" onClick={handleClearAll}>
          <Trash2 className="mr-2 h-4 w-4" />
          Clear All
        </Button>
      </div>

      {activities.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No activity recorded yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <Card key={activity.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{activity.page_visited}</span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">IP:</span>
                        <span>{activity.visitor_ip}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">User Agent:</span>
                        <span className="flex-1 break-all">{activity.user_agent}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(activity.created_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
