import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Github, Youtube } from 'lucide-react';
import { getProjectImageUrl } from '@/lib/utils/youtube';

export const revalidate = 3600;

export default async function ProjectsPage() {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-primary">Projects</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Detailed case studies of systems I've architected and built, from initial problem definition to production deployment and impact.
        </p>

        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const displayImage = getProjectImageUrl(project.image_url, project.youtube_url);
              return (
              <Card key={project.id} className="overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
                {displayImage && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={displayImage}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-primary group-hover:text-secondary transition-colors">{project.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.slug ? (
                      <Button asChild size="sm">
                        <Link href={`/projects/${project.slug}`}>
                          View Details
                        </Link>
                      </Button>
                    ) : (
                      <Button size="sm" disabled>
                        View Details
                      </Button>
                    )}
                    {project.github_url && (
                      <Button asChild size="sm" variant="outline">
                        <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                          <Github className="mr-2 h-4 w-4" />
                          Code
                        </a>
                      </Button>
                    )}
                    {project.youtube_url && (
                      <Button asChild size="sm" variant="outline">
                        <a href={project.youtube_url} target="_blank" rel="noopener noreferrer">
                          <Youtube className="mr-2 h-4 w-4" />
                          Video
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No projects yet. Check back soon!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
