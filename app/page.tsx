import Link from 'next/link';
import { ArrowRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createPublicClient } from '@/lib/supabase/public';
import { NewsletterCTA } from '@/components/newsletter/newsletter-cta';

export const revalidate = 3600;

const DATA_FETCH_TIMEOUT_MS = 3000;

export default async function Home() {
  let featuredProjects: any[] = [];
  let recentPosts: any[] = [];
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), DATA_FETCH_TIMEOUT_MS);

  try {
    const supabase = createPublicClient();

    const [projectsResult, postsResult] = await Promise.all([
      supabase
        .from('projects')
        .select('id, company, title, slug, description, tech_stack, featured_description, start_date')
        .eq('status', 'published')
        .eq('featured', true)
        .order('start_date', { ascending: false })
        .limit(4)
        .abortSignal(abortController.signal),
      supabase
        .from('blogs')
        .select('id, title, slug, excerpt, created_at')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(3)
        .abortSignal(abortController.signal),
    ]);

    if (projectsResult.error) {
      console.error('Error fetching featured projects:', projectsResult.error);
    } else {
      featuredProjects = projectsResult.data || [];
    }

    if (postsResult.error) {
      console.error('Error fetching recent posts:', postsResult.error);
    } else {
      recentPosts = postsResult.data || [];
    }
  } catch (error) {
    console.error('Error fetching homepage data:', error);
  } finally {
    clearTimeout(timeout);
  }

  return (
    <div className="min-h-screen">
      {/* Section 1: Hero */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="max-w-4xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-8">
            <span className="font-mono">I build and own backend systems at scale.</span>
          </h1>

          <ul className="space-y-3 text-base sm:text-lg text-muted-foreground mb-8">
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1.5 text-xs">&#9654;</span>
              <span>Replaced 6-figure/user vendor platform (FactSet RMS) with in-house trading system serving equity + fixed income desks</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1.5 text-xs">&#9654;</span>
              <span>Architected real-time decision workflow integrating 9 downstream systems including BlackRock Aladdin</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1.5 text-xs">&#9654;</span>
              <span>Led team of 5 engineers shipping ESG analytics platform from zero to production</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1.5 text-xs">&#9654;</span>
              <span>Built event-driven architectures processing millions of state transitions on Kafka</span>
            </li>
          </ul>

          <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base mb-3">
            <span className="font-mono text-muted-foreground">
              Java . Spring Boot . Kafka . Elasticsearch . Python . PostgreSQL . MongoDB . Docker
            </span>
          </div>

          <p className="text-sm text-muted-foreground mb-8">
            8+ years . Morgan Stanley . TIAA . TCS . 2x Tech Showcase Winner
          </p>

          <div className="flex flex-wrap gap-4 mb-8">
            <Button asChild size="lg">
              <Link href="/projects">
                View Systems I've Built <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/blog">
                Read My Writing <FileText className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <NewsletterCTA
            source="homepage_hero"
            title="Get my best engineering write-ups"
            description="Occasional emails on system design, performance, and real production lessons."
            className="max-w-xl"
          />
        </div>
      </section>

      {/* Section 2: Key Impact */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-primary">Key Impact</h2>
            <p className="text-lg text-muted-foreground">
              Quantified outcomes from production systems I've designed, built, and owned.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-primary hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-primary text-lg">Cost Elimination</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">Replaced FactSet RMS (6-figure/user/year licensing) with scalable in-house solution</p>
                <p className="text-sm text-muted-foreground">Built real-time trading platform from scratch, integrated 9 downstream systems. Saved significant recurring licensing costs while adding custom functionality.</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-primary hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-primary text-lg">System Integration at Scale</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">Architected real-time integration with 9 platforms including BlackRock Aladdin</p>
                <p className="text-sm text-muted-foreground">Designed event-driven protocols, Elasticsearch-powered search, monitoring dashboards. Zero-downtime system serving equity and fixed income trading desks.</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-primary hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-primary text-lg">Team Leadership</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">Led 5-engineer team building ESG analytics platform from concept to production</p>
                <p className="text-sm text-muted-foreground">Owned full stack: Verity RMS integration, automated PowerBI pipelines, Autosys scheduling. Won Tech Showcase 2 consecutive years.</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-primary hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-primary text-lg">Data Engineering</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">Migrated millions of XML records from RDBMS to MongoDB</p>
                <p className="text-sm text-muted-foreground">Built automated data pipelines with Python and Autosys. Designed Elasticsearch search across massive document repositories.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 3: Systems I've Built */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-primary">Systems I've Built</h2>
            <p className="text-lg text-muted-foreground">
              Production systems I've designed and owned end-to-end — from architecture decisions to deployment and scale.
            </p>
          </div>
          {featuredProjects && featuredProjects.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredProjects.map((project) => (
                  <Card key={project.id} className="hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                    <CardHeader>
                      {project.company && (
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded w-fit mb-2">
                          {project.company}
                        </span>
                      )}
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
                    View All Systems <ArrowRight className="ml-2 h-4 w-4" />
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

      {/* Section 4: System Design Thinking */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-primary">System Design Thinking</h2>
            <p className="text-lg text-muted-foreground">
              Architectural principles I apply when designing production systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-primary text-lg">Event-Driven Architecture</CardTitle>
                <CardDescription>
                  Production systems using Kafka for async state management.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm font-medium">How I apply it:</p>
                <p className="text-sm text-muted-foreground">Insurance product lifecycle with event-driven state machines. Decoupled services, guaranteed delivery, horizontal scalability.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-primary text-lg">System Integration</CardTitle>
                <CardDescription>
                  Connecting heterogeneous systems without tight coupling.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm font-medium">How I apply it:</p>
                <p className="text-sm text-muted-foreground">9-system integration including BlackRock Aladdin, LaunchDarkly, Verity RMS. Protocol design, retry strategies, circuit breakers, monitoring.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-primary text-lg">Data Architecture</CardTitle>
                <CardDescription>
                  Choosing the right storage for the access pattern.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm font-medium">How I apply it:</p>
                <p className="text-sm text-muted-foreground">Elasticsearch for search, MongoDB for documents, DB2 for transactions. Migration strategies for millions of records with zero downtime.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-primary text-lg">Scaling Strategies</CardTitle>
                <CardDescription>
                  Designing for 10x before you need it.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm font-medium">How I apply it:</p>
                <p className="text-sm text-muted-foreground">High-throughput APIs, connection pooling, caching layers. Horizontal scaling with containerized microservices on OpenShift.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 5: Writing */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-primary">Writing</h2>
            <p className="text-lg text-muted-foreground">
              I write about system design decisions, production debugging, and architectural trade-offs — the stuff that's hard to learn from docs alone.
            </p>
          </div>

          {recentPosts.length > 0 ? (
            <div className="space-y-4 mb-8">
              {recentPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="block group">
                  <Card className="hover:shadow-md hover:border-primary/30 transition-all duration-300">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium group-hover:text-primary transition-colors">{post.title}</h3>
                        {post.excerpt && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{post.excerpt}</p>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-4" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground mb-8">Posts coming soon.</p>
          )}

          <Button asChild variant="outline">
            <Link href="/blog">
              Read All Posts <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Section 6: Skills */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-primary">Technical Skills</h2>
            <p className="text-lg text-muted-foreground">
              Grouped by the kind of problems I solve, not just the tools I use.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-primary text-lg">Distributed Systems & Messaging</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['Kafka', 'Event-driven architecture', 'Microservices', 'System integration', 'Circuit breakers'].map((skill) => (
                    <span key={skill} className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full">{skill}</span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-primary text-lg">Backend Architecture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['Java', 'Spring Boot', 'Python', 'RESTful APIs', 'API design (Swagger/OpenAPI)'].map((skill) => (
                    <span key={skill} className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full">{skill}</span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-primary text-lg">Data & Storage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['Elasticsearch', 'PostgreSQL', 'MongoDB', 'DB2', 'MySQL', 'Data migration', 'ETL pipelines'].map((skill) => (
                    <span key={skill} className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full">{skill}</span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-primary text-lg">Infrastructure & Observability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['Docker', 'OpenShift', 'Jenkins', 'CI/CD', 'Monitoring', 'Feature toggles (LaunchDarkly)'].map((skill) => (
                    <span key={skill} className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full">{skill}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 7: CTA */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
          <CardContent className="p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Looking for a backend engineer who owns outcomes, not just tickets.
            </h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto">
              I'm targeting Staff/Senior Backend Engineer roles where I can design systems, lead technical decisions, and ship production infrastructure that scales. If you're building something that needs real engineering depth — distributed systems, high-throughput APIs, or complex integrations — let's talk.
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
