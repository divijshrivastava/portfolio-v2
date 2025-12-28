import { notFound } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { Calendar, ArrowLeft, ExternalLink, Github, Youtube, Briefcase, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getProjectImageUrl } from '@/lib/utils/youtube';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateStaticParams() {
  // For build time, return empty array to allow dynamic generation
  // In production, pages will be generated on-demand with ISR
  return [];
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  try {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: project, error } = await supabase
      .from('projects')
      .select('title, description, image_url, youtube_url')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !project) {
      console.error('Metadata fetch error:', error);
      return {
        title: 'Project Not Found',
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://divij.tech';
    const projectImage = getProjectImageUrl(project.image_url, project.youtube_url);

    console.log('[Metadata Debug]', {
      slug,
      image_url: project.image_url,
      youtube_url: project.youtube_url,
      projectImage,
      baseUrl
    });

    // Ensure image URL is absolute for social media crawlers
    let ogImage = `${baseUrl}/og-image.png`; // Default fallback (1200x630)
    if (projectImage) {
      // If URL is already absolute (starts with http:// or https://), use it
      // Otherwise, treat it as relative and prepend baseUrl
      ogImage = projectImage.startsWith('http') ? projectImage : `${baseUrl}${projectImage}`;
    }

    console.log('[Metadata Debug] Final OG Image:', ogImage);

    return {
      title: project.title,
      description: project.description || project.title,
      openGraph: {
        title: project.title,
        description: project.description || project.title,
        type: 'article',
        url: `${baseUrl}/projects/${slug}`,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: project.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: project.title,
        description: project.description || project.title,
        images: [ogImage],
      },
    };
  } catch (error) {
    console.error('Metadata generation error:', error);
    return {
      title: 'Project',
    };
  }
}

export default async function ProjectDetail({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
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
  const isProfessional = project.project_type === 'professional';

  // Format date range for professional projects
  const getDateRange = () => {
    if (!isProfessional || !project.start_date) return null;
    const startDate = new Date(project.start_date);
    const endDate = project.end_date ? new Date(project.end_date) : null;
    return `${startDate.getFullYear()} - ${endDate ? endDate.getFullYear() : 'Present'}`;
  };

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

          {/* Project Type Badge */}
          {isProfessional && (
            <div className="mb-4">
              <Badge variant="secondary" className="text-sm">
                <Briefcase className="mr-1 h-3 w-3" />
                Professional Work Experience
              </Badge>
            </div>
          )}

          <h1 className="text-4xl sm:text-5xl font-bold mb-6">{project.title}</h1>

          {/* Professional Project Metadata */}
          {isProfessional && (
            <div className="flex flex-wrap gap-4 text-muted-foreground mb-6">
              {project.company && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span className="font-semibold">{project.company}</span>
                </div>
              )}
              {getDateRange() && (
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <span>{getDateRange()}</span>
                </div>
              )}
            </div>
          )}

          {/* Tech Stack for Professional Projects */}
          {isProfessional && project.tech_stack && project.tech_stack.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {project.tech_stack.map((tech: string, index: number) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {tech}
                </Badge>
              ))}
            </div>
          )}

          {/* Side Project Metadata */}
          {!isProfessional && (
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
          )}

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

          {/* Short Description */}
          <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
            <p className="text-lg leading-relaxed text-muted-foreground">{project.description}</p>
          </div>

          {/* Detailed Content (primarily for professional projects) */}
          {project.detailed_content && (
            <div className="prose prose-lg dark:prose-invert max-w-none mb-8 border-t pt-8">
              <div className="whitespace-pre-wrap">{project.detailed_content}</div>
            </div>
          )}

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
