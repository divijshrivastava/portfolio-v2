import { notFound } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { Calendar, ArrowLeft, ExternalLink, Github, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getProjectImageUrl } from '@/lib/utils/youtube';

export const revalidate = 3600;

export async function generateStaticParams() {
  // For build time, return empty array to allow dynamic generation
  // In production, pages will be generated on-demand with ISR
  return [];
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = await Promise.resolve(params);
  const supabase = await createClient();

  const { data: project } = await supabase
    .from('projects')
    .select('title, description')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }

  return {
    title: project.title,
    description: project.description || project.title,
  };
}

export default async function ProjectDetail({ params }: { params: { slug: string } }) {
  const { slug } = await Promise.resolve(params);
  const supabase = await createClient();

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!project) {
    notFound();
  }

  const displayImage = getProjectImageUrl(project.image_url, project.youtube_url);

  return (
    <div className="min-h-screen">
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <Button asChild variant="ghost" className="mb-8">
            <Link href="/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>

          <h1 className="text-4xl sm:text-5xl font-bold mb-6">{project.title}</h1>

          <div className="flex flex-wrap gap-4 text-muted-foreground mb-8">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(project.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          {displayImage && (
            <div className="relative w-full h-64 sm:h-96 mb-8 rounded-lg overflow-hidden">
              <Image
                src={displayImage}
                alt={project.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
            <p className="text-lg leading-relaxed">{project.description}</p>
          </div>

          <div className="flex flex-wrap gap-4 pt-6 border-t">
            {project.project_url && (
              <Button asChild size="lg">
                <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-5 w-5" />
                  View Live Project
                </a>
              </Button>
            )}
            {project.github_url && (
              <Button asChild variant="outline" size="lg">
                <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-5 w-5" />
                  View Code
                </a>
              </Button>
            )}
            {project.youtube_url && (
              <Button asChild variant="outline" size="lg">
                <a href={project.youtube_url} target="_blank" rel="noopener noreferrer">
                  <Youtube className="mr-2 h-5 w-5" />
                  Watch Video
                </a>
              </Button>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
