import { Card, CardContent } from '@/components/ui/card';
import { Code, Database, Globe, Server } from 'lucide-react';

export default function AboutPage() {
  const skills = [
    {
      icon: Globe,
      title: 'Frontend Development',
      description: 'React, Next.js, TypeScript, Tailwind CSS',
    },
    {
      icon: Server,
      title: 'Backend Development',
      description: 'Node.js, Java, Spring Boot, RESTful APIs',
    },
    {
      icon: Database,
      title: 'Databases',
      description: 'PostgreSQL, MySQL, MongoDB, Supabase',
    },
    {
      icon: Code,
      title: 'Tools & Technologies',
      description: 'Git, Docker, AWS, Vercel, CI/CD',
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-primary">About Me</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Full-stack developer passionate about creating amazing web experiences
        </p>

        <div className="space-y-8">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Hello!</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  With 8+ years of experience as a senior software engineer, I've built production systems across fintech, e-commerce, and enterprise domains. I take ownership of projects from conception to deployment, collaborating with cross-functional teams to deliver solutions that balance technical excellence with business impact.
                </p>
                <p>
                  My work spans full-stack web development, distributed systems, and data engineering, always with a focus on scalability, performance, and maintainability. I enjoy tackling challenging problems and creating efficient solutions that make a difference.
                </p>
                <p>
                  When I'm not coding, you can find me writing technical articles, contributing to
                  open source projects, or exploring new technologies and frameworks.
                </p>
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-2xl font-bold mb-6">Skills & Expertise</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {skills.map((skill, index) => {
                const Icon = skill.icon;
                return (
                  <Card key={index} className="hover:border-primary/30 transition-all duration-300 group">
                    <CardContent className="p-6">
                      <Icon className="h-10 w-10 text-primary group-hover:text-secondary transition-colors mb-4" />
                      <h3 className="text-lg font-semibold mb-2 text-primary">{skill.title}</h3>
                      <p className="text-muted-foreground">{skill.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
