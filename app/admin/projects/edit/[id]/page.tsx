'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Save, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [slugError, setSlugError] = useState('');

  useEffect(() => {
    Promise.resolve(params).then(resolvedParams => {
      setId(resolvedParams.id);
      loadProject(resolvedParams.id);
    });
  }, []);

  const loadProject = async (projectId: string) => {
    const supabase = createClient();
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error || !project) {
      alert('Project not found');
      router.push('/admin/projects');
      return;
    }

    setTitle(project.title);
    setSlug(project.slug || '');
    setDescription(project.description || '');
    setImageUrl(project.image_url || '');
    setProjectUrl(project.project_url || '');
    setGithubUrl(project.github_url || '');
    setYoutubeUrl(project.youtube_url || '');
    setStatus(project.status);
    setSlugError('');
    setIsLoading(false);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const checkSlugAvailability = async (slugToCheck: string): Promise<boolean> => {
    if (!slugToCheck || !id) return false;

    const supabase = createClient();
    const { data, error } = await supabase
      .from('projects')
      .select('id')
      .eq('slug', slugToCheck)
      .neq('id', id) // Exclude current project
      .single();

    // If no data found, slug is available
    return !data && error?.code === 'PGRST116';
  };

  const handleSlugChange = async (value: string) => {
    const newSlug = generateSlug(value);
    setSlug(newSlug);
    setSlugError('');

    if (newSlug && id) {
      const isAvailable = await checkSlugAvailability(newSlug);
      if (!isAvailable) {
        setSlugError('This slug is already in use. Please choose a different one.');
      }
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'project-images');

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Upload error:', error);
        alert(error.error || 'Failed to upload image');
        return '';
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
      return '';
    }
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await handleImageUpload(file);
      setImageUrl(url);
    }
  };

  const handleSubmit = async (newStatus: 'draft' | 'published') => {
    if (!id) return;

    if (!title || !description || !slug) {
      alert('Please fill in required fields (Title, Slug, and Description)');
      return;
    }

    if (slugError) {
      alert('Please fix the slug error before submitting.');
      return;
    }

    // Double-check slug availability before submitting
    const isAvailable = await checkSlugAvailability(slug);
    if (!isAvailable) {
      setSlugError('This slug is already in use. Please choose a different one.');
      return;
    }

    setIsSubmitting(true);

    const supabase = createClient();

    const { error } = await supabase
      .from('projects')
      .update({
        title,
        slug,
        description,
        image_url: imageUrl,
        project_url: projectUrl || null,
        github_url: githubUrl || null,
        youtube_url: youtubeUrl || null,
        status: newStatus,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating project:', error);

      // Handle duplicate slug error specifically
      if (error.code === '23505' && error.message.includes('slug')) {
        setSlugError('This slug is already in use. Please choose a different one.');
        alert('A project with this slug already exists. Please change the slug and try again.');
      } else {
        alert(`Error updating project: ${error.message}`);
      }

      setIsSubmitting(false);
      return;
    }

    router.push('/admin/projects');
    router.refresh();
  };

  const handleDelete = async () => {
    if (!id) return;

    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project');
      return;
    }

    router.push('/admin/projects');
    router.refresh();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
          <h2 className="text-3xl font-bold">Edit Project</h2>
        </div>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title <span className="text-destructive">*</span>
              </label>
              <Input
                id="title"
                placeholder="Enter project title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-medium">
                Slug (URL) <span className="text-destructive">*</span>
              </label>
              <Input
                id="slug"
                placeholder="project-url"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                required
                className={slugError ? 'border-destructive' : ''}
              />
              {slugError && (
                <p className="text-xs text-destructive">{slugError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Preview: /projects/{slug || 'your-slug-here'}
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description <span className="text-destructive">*</span>
              </label>
              <Textarea
                id="description"
                placeholder="Brief description of your project"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="image" className="text-sm font-medium">
                Project Image
              </label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageFileUpload}
              />
              {imageUrl && (
                <div className="mt-2">
                  <img
                    src={imageUrl}
                    alt="Project preview"
                    className="max-w-md rounded-lg border"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="projectUrl" className="text-sm font-medium">
                Project URL
              </label>
              <Input
                id="projectUrl"
                type="url"
                placeholder="https://example.com"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Link to the live project or demo
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="githubUrl" className="text-sm font-medium">
                GitHub URL
              </label>
              <Input
                id="githubUrl"
                type="url"
                placeholder="https://github.com/username/repo"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Link to the GitHub repository
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="youtubeUrl" className="text-sm font-medium">
                YouTube URL
              </label>
              <Input
                id="youtubeUrl"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Link to a demo video or presentation
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting || !title || !slug || !description}
          >
            <Save className="mr-2 h-4 w-4" />
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSubmit('published')}
            disabled={isSubmitting || !title || !slug || !description}
          >
            <Eye className="mr-2 h-4 w-4" />
            {status === 'published' ? 'Update' : 'Publish'}
          </Button>
        </div>
      </div>
    </div>
  );
}
