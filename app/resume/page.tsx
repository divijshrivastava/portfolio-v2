import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

export const revalidate = 3600;

export default async function ResumePage() {
  const supabase = await createClient();

  const { data: resume } = await supabase
    .from('resume')
    .select('*')
    .eq('is_current', true)
    .single();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-primary">Resume</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Download my resume or view it online
        </p>

        {resume ? (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <FileText className="h-12 w-12 text-primary" />
                    <div>
                      <h2 className="text-xl font-semibold mb-1">{resume.file_name}</h2>
                      <p className="text-sm text-muted-foreground">
                        Last updated: {new Date(resume.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button asChild>
                    <a href={resume.file_url} download target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6">Experience & Education</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold">Professional Summary</h3>
                    <p className="text-muted-foreground mt-2">
                      Full-stack web developer with experience in building modern, scalable web applications
                      using cutting-edge technologies. Passionate about clean code, user experience, and
                      continuous learning.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">Technical Skills</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Java', 'Spring Boot',
                        'PostgreSQL', 'MySQL', 'MongoDB', 'Git', 'Docker', 'AWS'].map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Resume not available. Please check back later!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
