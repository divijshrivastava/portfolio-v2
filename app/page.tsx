import Link from 'next/link';
import { ArrowRight, Code, FileText, Briefcase, Layers, Zap, Database, Server, GitBranch, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HeroImage } from '@/components/hero-image';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 3600;

export default async function Home() {
  let featuredProjects: any[] = [];

  try {
    const supabase = await createClient();

    // Fetch featured projects
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'published')
      .eq('featured', true)
      .order('start_date', { ascending: false })
      .limit(4);

    if (error) {
      console.error('Error fetching featured projects:', error);
      // Continue with empty projects array instead of crashing
      featuredProjects = [];
    } else {
      featuredProjects = data || [];
    }
  } catch (error) {
    console.error('Error initializing Supabase client or fetching projects:', error);
    // Continue with empty projects array instead of crashing
    featuredProjects = [];
  }
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                Senior Full-Stack Engineer
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground">
                Building scalable web applications and distributed systems
              </p>
            </div>
            <p className="text-lg text-muted-foreground">
              Specializing in fintech and enterprise systems at Morgan Stanley, TIAA, and TCS. Built real-time trading platforms, ESG analytics tools, and scalable microservices handling millions of transactions. Award-winning engineer with proven leadership in high-impact projects.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base">
              <span className="text-muted-foreground">Tech Stack:</span>
              <span className="font-medium">Java • Spring Boot • Angular • Python • Elasticsearch • Kafka • DB2 • MongoDB</span>
            </div>
            <p className="text-sm text-muted-foreground">
              8+ years • Tech Showcase Winner • On the Spot Award • Morgan Stanley • TIAA • TCS
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

          <HeroImage />
        </div>
      </section>

      {/* What I Do Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-primary">What I Do</h2>
          <p className="text-lg text-muted-foreground">
            Full-stack engineer with expertise in fintech systems, from real-time trading platforms to ESG analytics, built for enterprise scale.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
            <CardHeader>
              <Layers className="h-10 w-10 mb-4 text-primary group-hover:text-secondary transition-colors duration-300" />
              <CardTitle className="text-primary">Frontend Development</CardTitle>
              <CardDescription>
                Build enterprise Angular applications for trading platforms, ESG analytics dashboards, and e-commerce insurance flows. Design responsive UX for portfolio managers and financial analysts with real-time data visualization.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
            <CardHeader>
              <Server className="h-10 w-10 mb-4 text-primary group-hover:text-secondary transition-colors duration-300" />
              <CardTitle className="text-primary">Backend APIs & Services</CardTitle>
              <CardDescription>
                Build RESTful APIs with Spring Boot and Python for trading platforms, document storage, and ESG analytics. Design Swagger documentation for multi-client API integrations. Handle high-throughput real-time workloads.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
            <CardHeader>
              <GitBranch className="h-10 w-10 mb-4 text-primary group-hover:text-secondary transition-colors duration-300" />
              <CardTitle className="text-primary">System Integration & Architecture</CardTitle>
              <CardDescription>
                Architect real-time trading systems integrating 9 downstream platforms including Aladdin. Build event-driven architectures with Kafka. Design middleware for LaunchDarkly, Verity RMS, and third-party tool integrations.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
            <CardHeader>
              <Zap className="h-10 w-10 mb-4 text-primary group-hover:text-secondary transition-colors duration-300" />
              <CardTitle className="text-primary">Data Engineering & Search</CardTitle>
              <CardDescription>
                Migrate millions of records across databases (RDBMS to MongoDB, MySQL to DB2). Implement Elasticsearch for high-performance search. Built automated data pipelines with Python and Autosys.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
            <CardHeader>
              <Database className="h-10 w-10 mb-4 text-primary group-hover:text-secondary transition-colors duration-300" />
              <CardTitle className="text-primary">DevOps & Infrastructure</CardTitle>
              <CardDescription>
                Deploy dockerized microservices on OpenShift. Build CI/CD pipelines with Jenkins and ElectricFlow. Develop middleware for feature toggles, observability, and security standardization.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-primary">Featured Projects</h2>
            <p className="text-lg text-muted-foreground">
              Production systems built at Morgan Stanley, TIAA, and TCS—from trading platforms to ESG analytics and enterprise storage solutions.
            </p>
          </div>
          {featuredProjects && featuredProjects.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredProjects.map((project) => (
                  <Card key={project.id} className="hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-primary">{project.title}</CardTitle>
                      <CardDescription>{project.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {project.tech_stack && project.tech_stack.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.tech_stack.map((tech: string, index: number) => (
                            <span key={index} className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                      {project.featured_description && (
                        <p className="text-sm text-muted-foreground">
                          {project.featured_description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center mt-8">
                <Button asChild variant="outline" size="lg">
                  <Link href="/projects">
                    View All Projects <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">
                  No featured projects yet. Mark projects as featured in the admin panel to display them here.
                </p>
              </CardContent>
            </Card>
          )}
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
              Open to senior engineering roles in fintech, system architecture consulting, or collaborating on challenging technical problems. Let's connect.
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
