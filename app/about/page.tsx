import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  const skillGroups = [
    {
      title: 'Distributed Systems & Messaging',
      skills: ['Kafka', 'Event-driven architecture', 'Microservices', 'System integration', 'Circuit breakers'],
    },
    {
      title: 'Backend Architecture',
      skills: ['Java', 'Spring Boot', 'Python', 'RESTful APIs', 'API design (Swagger/OpenAPI)'],
    },
    {
      title: 'Data & Storage',
      skills: ['Elasticsearch', 'PostgreSQL', 'MongoDB', 'DB2', 'MySQL', 'Data migration', 'ETL pipelines'],
    },
    {
      title: 'Infrastructure & Observability',
      skills: ['Docker', 'OpenShift', 'Jenkins', 'CI/CD', 'Monitoring', 'Feature toggles (LaunchDarkly)'],
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-primary">About Me</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Backend engineer who designs, builds, and owns production systems end-to-end.
        </p>

        <div className="space-y-12">
          {/* Bio */}
          <Card>
            <CardContent className="p-8">
              <div className="space-y-4 text-muted-foreground">
                <p>
                  I'm a senior backend engineer with 8+ years of experience building production systems in fintech and enterprise environments. At Morgan Stanley, TIAA, and TCS, I've designed and shipped trading platforms, ESG analytics systems, event-driven architectures, and complex multi-system integrations.
                </p>
                <p>
                  I think about engineering in terms of ownership and outcomes. I don't just write code — I design the system, choose the right data stores, define the integration contracts, build the monitoring, and own it in production. I've replaced 6-figure vendor platforms with in-house solutions, led engineering teams, and won back-to-back Tech Showcase awards for the systems I've built.
                </p>
                <p>
                  When I'm not building systems, I write about architecture decisions, production debugging, and the trade-offs that don't show up in tutorials.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Architecture Philosophy */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-primary">Architecture Philosophy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Design for the access pattern, not the tool</h3>
                  <p className="text-sm text-muted-foreground">
                    Storage decisions should follow how data is read and written, not which database is trending. I've used Elasticsearch for search, MongoDB for documents, and DB2 for transactional workloads — each chosen for the problem, not the resume.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Decouple early, integrate deliberately</h3>
                  <p className="text-sm text-muted-foreground">
                    Event-driven systems with Kafka give you flexibility, but integration boundaries need explicit contracts. I design protocols and retry strategies before writing the first consumer.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Own it in production</h3>
                  <p className="text-sm text-muted-foreground">
                    A system you can't monitor isn't done. I build observability into every service — dashboards, alerts, structured logging — because understanding what's happening in production is part of the architecture.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Scale horizontally, think vertically</h3>
                  <p className="text-sm text-muted-foreground">
                    Containers and orchestration make horizontal scaling straightforward. The hard part is designing services that can actually scale independently — proper data partitioning, stateless logic, and connection management.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* How I Think About Systems */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-primary">How I Think About Systems</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Every system I build starts with three questions: What's the hardest integration? What's the failure mode? What does 10x look like? These shape the architecture before any code gets written.
                </p>
                <p>
                  At Morgan Stanley, this meant designing a trading platform that could replace a multi-million-dollar vendor product while integrating with 9 downstream systems — each with its own protocol, latency requirements, and failure characteristics. At TIAA, it meant building event-driven state machines on Kafka that could handle the complexity of insurance product lifecycles without losing a single state transition.
                </p>
                <p>
                  I'm most effective when I can own a problem from system design through production deployment. I prefer environments where engineers are trusted to make architectural decisions and held accountable for the outcomes.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-primary">Skills & Expertise</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {skillGroups.map((group) => (
                <Card key={group.title} className="hover:border-primary/30 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg text-primary">{group.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {group.skills.map((skill) => (
                        <span key={skill} className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
