import Link from 'next/link';
import { ArrowRight, Code, FileText, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Hey There!
              <br />
              <span className="text-primary">
                I am Divij.
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground">
              I am a Web Developer and I just love to code.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/blog">
                  Read My Blog <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/projects">View Projects</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/5 flex items-center justify-center border-2 border-primary/20">
              <div className="text-6xl sm:text-8xl font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">DS</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
            <CardHeader>
              <FileText className="h-10 w-10 mb-4 text-primary group-hover:text-secondary transition-colors duration-300" />
              <CardTitle className="text-primary">Blog</CardTitle>
              <CardDescription>
                Technical articles and insights about web development, programming, and technology.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="link" className="px-0 group-hover:text-secondary">
                <Link href="/blog">
                  Read Articles <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
            <CardHeader>
              <Briefcase className="h-10 w-10 mb-4 text-primary group-hover:text-secondary transition-colors duration-300" />
              <CardTitle className="text-primary">Projects</CardTitle>
              <CardDescription>
                Showcase of my work including websites, apps, YouTube videos, and coding projects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="link" className="px-0 group-hover:text-secondary">
                <Link href="/projects">
                  View Projects <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
            <CardHeader>
              <Code className="h-10 w-10 mb-4 text-primary group-hover:text-secondary transition-colors duration-300" />
              <CardTitle className="text-primary">Open Source</CardTitle>
              <CardDescription>
                Contributing to open source projects and building tools for the developer community.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="link" className="px-0 group-hover:text-secondary">
                <a href="https://github.com/divijshrivastava" target="_blank" rel="noopener noreferrer">
                  GitHub Profile <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
          <CardContent className="p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Let's Work Together
            </h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Have a project in mind? Looking for a developer? Feel free to reach out!
            </p>
            <Button asChild size="lg">
              <Link href="/contact">
                Get In Touch <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
