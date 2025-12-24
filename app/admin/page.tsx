import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Briefcase, Mail, Activity } from 'lucide-react';

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: blogsCount },
    { count: projectsCount },
    { count: messagesCount },
    { count: activityCount }
  ] = await Promise.all([
    supabase.from('blogs').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('messages').select('*', { count: 'exact', head: true }),
    supabase.from('user_activity').select('*', { count: 'exact', head: true }),
  ]);

  const { count: unreadMessages } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false);

  const stats = [
    { name: 'Total Blogs', value: blogsCount || 0, icon: FileText },
    { name: 'Total Projects', value: projectsCount || 0, icon: Briefcase },
    { name: 'Unread Messages', value: unreadMessages || 0, icon: Mail },
    { name: 'Total Visitors', value: activityCount || 0, icon: Activity },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.name}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome to Admin Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Use the sidebar to navigate between different sections of the admin panel.
            You can manage blogs, projects, view messages, track user activity, and upload your resume.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
