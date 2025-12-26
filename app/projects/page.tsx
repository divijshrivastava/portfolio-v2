import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Github, Youtube, Briefcase } from 'lucide-react';
import { getProjectImageUrl } from '@/lib/utils/youtube';

export const revalidate = 3600;

export default async function ProjectsPage() {
  const supabase = await createClient();

  // Fetch professional projects
  const { data: professionalProjects } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'published')
    .eq('project_type', 'professional')
    .order('start_date', { ascending: false });

  // Fetch side projects (including NULL project_type for backwards compatibility)
  const { data: sideProjects } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'published')
    .or('project_type.eq.side,project_type.is.null')
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-primary">Projects</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Production systems from 8+ years at Morgan Stanley, TIAA, and TCS, plus side projects exploring new technologies.
        </p>

        {/* Professional Work Experience Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold text-primary">Professional Work Experience</h2>
          </div>
          <p className="text-muted-foreground mb-8">
            Enterprise-scale systems built at top financial institutions, managing millions of transactions and serving thousands of users.
          </p>

          {professionalProjects && professionalProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {professionalProjects.map((project) => {
                const startDate = project.start_date ? new Date(project.start_date) : null;
                const endDate = project.end_date ? new Date(project.end_date) : null;
                const dateRange = startDate
                  ? `${startDate.getFullYear()} - ${endDate ? endDate.getFullYear() : 'Present'}`
                  : '';

                return (
                  <Link key={project.id} href={`/projects/${project.slug}`}>
                    <Card className="overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 group cursor-pointer h-full">
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          {project.company && (
                            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                              {project.company}
                            </span>
                          )}
                          {dateRange && (
                            <span className="text-xs text-muted-foreground">{dateRange}</span>
                          )}
                        </div>
                        <CardTitle className="text-xl text-primary group-hover:text-secondary transition-colors">
                          {project.title}
                        </CardTitle>
                        <CardDescription>{project.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {project.tech_stack && project.tech_stack.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.tech_stack.map((tech: string, index: number) => (
                              <span key={index} className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No professional projects yet. Add them from the admin panel.</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Side Projects Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Github className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold text-primary">Side Projects</h2>
          </div>
          <p className="text-muted-foreground mb-8">
            Personal projects exploring new technologies, frameworks, and ideas outside of work.
          </p>

          {sideProjects && sideProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sideProjects.map((project) => {
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
                <p className="text-muted-foreground">No side projects yet. Check back soon!</p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
