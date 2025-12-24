import Link from 'next/link';
import { ArrowRight, Code, FileText, Briefcase, Layers, Zap, Database, Server, GitBranch, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
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
              I architect and build high-performance web applications that solve complex business problems, with a focus on fintech and enterprise systems.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base">
              <span className="text-muted-foreground">Tech Stack:</span>
              <span className="font-medium">Java • Angular • Python • MySQL • Snowflake • MongoDB • Kafka</span>
            </div>
            <p className="text-sm text-muted-foreground">
              8+ years of experience building production systems
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

      {/* What I Do Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-primary">What I Do</h2>
          <p className="text-lg text-muted-foreground">
            I specialize in building end-to-end solutions that scale, from frontend architecture to backend infrastructure.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
            <CardHeader>
              <Layers className="h-10 w-10 mb-4 text-primary group-hover:text-secondary transition-colors duration-300" />
              <CardTitle className="text-primary">Frontend Architecture</CardTitle>
              <CardDescription>
                Design and implement scalable React/Angular applications with focus on performance, accessibility, and maintainability.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
            <CardHeader>
              <Server className="h-10 w-10 mb-4 text-primary group-hover:text-secondary transition-colors duration-300" />
              <CardTitle className="text-primary">Backend APIs & Services</CardTitle>
              <CardDescription>
                Build robust RESTful and event-driven APIs using Java, Python, and Node.js, handling high-throughput workloads.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
            <CardHeader>
              <GitBranch className="h-10 w-10 mb-4 text-primary group-hover:text-secondary transition-colors duration-300" />
              <CardTitle className="text-primary">System Design & Architecture</CardTitle>
              <CardDescription>
                Design distributed systems, microservices architectures, and data pipelines that handle millions of transactions.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
            <CardHeader>
              <Zap className="h-10 w-10 mb-4 text-primary group-hover:text-secondary transition-colors duration-300" />
              <CardTitle className="text-primary">Performance Optimization</CardTitle>
              <CardDescription>
                Identify bottlenecks, optimize database queries, implement caching strategies, and reduce latency across the stack.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
            <CardHeader>
              <Database className="h-10 w-10 mb-4 text-primary group-hover:text-secondary transition-colors duration-300" />
              <CardTitle className="text-primary">DevOps & Infrastructure</CardTitle>
              <CardDescription>
                Set up CI/CD pipelines, containerize applications, and manage cloud infrastructure for reliable deployments.
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
              A selection of projects showcasing system design, performance optimization, and full-stack development.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-primary">Payment Processing System</CardTitle>
                <CardDescription>
                  Built a high-throughput payment processing system that handles 10M+ transactions monthly with sub-100ms latency.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">Java</span>
                  <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">Spring Boot</span>
                  <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">Kafka</span>
                  <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">MySQL</span>
                  <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">Redis</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Reduced processing time by 60% and improved system reliability to 99.9% uptime.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-primary">Real-time Analytics Dashboard</CardTitle>
                <CardDescription>
                  Developed a real-time analytics platform for financial data using event streaming and data warehousing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">Angular</span>
                  <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">Python</span>
                  <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">Snowflake</span>
                  <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">Kafka</span>
                  <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">MongoDB</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enabled real-time decision-making for 500+ concurrent users with sub-second query performance.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-primary">Microservices Migration</CardTitle>
                <CardDescription>
                  Architected and executed migration of monolithic application to microservices, improving scalability and deployment velocity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">Java</span>
                  <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">Docker</span>
                  <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">Kubernetes</span>
                  <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">MySQL</span>
                  <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">Kafka</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Reduced deployment time by 80% and enabled independent scaling of services.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-primary">E-commerce Platform</CardTitle>
                <CardDescription>
                  Designed and built a full-stack e-commerce platform with inventory management, payment integration, and order processing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">React</span>
                  <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">Node.js</span>
                  <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">MongoDB</span>
                  <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">Stripe API</span>
                  <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">AWS</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Served 50K+ users with 99.5% uptime and processed $2M+ in transactions.
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg">
              <Link href="/projects">
                View All Projects <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
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
              Interested in collaborating on a project, discussing a role, or exploring technical consulting? I'd love to hear from you.
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
