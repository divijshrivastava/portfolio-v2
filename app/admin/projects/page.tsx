import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Eye, ExternalLink, Github, Youtube } from 'lucide-react';
import { getProjectImageUrl } from '@/lib/utils/youtube';
import { MigrateProjectsButton } from '@/components/admin/migrate-projects-button';

export default async function ProjectsPage() {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  // Check if any projects are missing slugs
  const projectsNeedingMigration = projects?.filter(p => !p.slug).length || 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Manage Projects</h2>
        <div className="flex gap-2">
          {projectsNeedingMigration > 0 && (
            <MigrateProjectsButton count={projectsNeedingMigration} />
          )}
          <Button asChild>
            <Link href="/admin/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
        </div>
      </div>

      {projects && projects.length > 0 ? (
        <div className="space-y-4">
          {projects.map((project) => {
            const displayImage = getProjectImageUrl(project.image_url, project.youtube_url);
            return (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex gap-4">
                  {displayImage && (
                    <div className="relative w-24 h-24 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={displayImage}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="mb-2">{project.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          <span className={`px-2 py-1 rounded font-medium ${
                            project.status === 'published'
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'bg-secondary/10 text-secondary border border-secondary/20'
                          }`}>
                            {project.status}
                          </span>
                          <span>{new Date(project.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          {project.project_url && (
                            <a
                              href={project.project_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:text-primary flex items-center"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Live
                            </a>
                          )}
                          {project.github_url && (
                            <a
                              href={project.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:text-primary flex items-center"
                            >
                              <Github className="h-3 w-3 mr-1" />
                              GitHub
                            </a>
                          )}
                          {project.youtube_url && (
                            <a
                              href={project.youtube_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:text-primary flex items-center"
                            >
                              <Youtube className="h-3 w-3 mr-1" />
                              Video
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/projects`} target="_blank">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/projects/edit/${project.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <form action={`/api/projects/${project.id}/delete`} method="POST">
                          <Button type="submit" variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No projects yet.</p>
            <Button asChild>
              <Link href="/admin/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
