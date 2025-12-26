const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const professionalProjects = [
  {
    title: 'Decision Workflow Management System',
    slug: 'decision-workflow-management-system',
    description: 'Real-time trading platform managing equity and fixed income decision lifecycles. Replaced costly FactSet RMS (thousands USD per user license) with scalable in-house solution.',
    detailed_content: `Core Functionality:
• Migration from FactSet Research Management Solution (FRMS) - saving thousands of USD per user license while improving customization and integration capabilities
• Advanced search functionality using Elasticsearch to quickly find companies, securities, and bonds for decision-making
• Integration with 9 downstream trading systems including Aladdin, requiring real-time high-throughput architecture

Key Achievements:
• Owned full development lifecycle from UX design to production deployment
• Developed real-time data sharing protocols in collaboration with stakeholders
• Built comprehensive test suites and monitoring dashboards for each downstream integration
• Scaled application to handle high-throughput real-time trading decisions
• Eliminated expensive third-party licensing costs while improving system flexibility

Technical Highlights:
• Elasticsearch integration for fast, intelligent search across securities and bonds
• Real-time system design handling critical trading decisions
• Complete monitoring and reporting infrastructure for decision tracking across all downstream systems`,
    project_type: 'professional',
    company: 'Morgan Stanley',
    start_date: '2023-01-01',
    end_date: null, // Current/ongoing
    tech_stack: ['Java', 'Spring Boot', 'Angular', 'Elasticsearch', 'DB2'],
    status: 'published',
    image_url: null,
    project_url: null,
    github_url: null,
    youtube_url: null,
  },
  {
    title: 'Custom Portfolio - ESG Analytics',
    slug: 'custom-portfolio-esg-analytics',
    description: 'ESG portfolio management platform enabling portfolio managers to create customized portfolios with sustainability projections. Led team of 5 engineers from concept to production.',
    detailed_content: `Leadership & Scope:
• Led team of 5 engineers developing enterprise ESG analytics platform
• Delivered sustainability-focused investment decision tools for portfolio managers
• Won Tech Showcase award 2 consecutive years at department level

Core Features:
• Custom portfolio creation with ESG (Environmental, Social, Governance) projections
• Verity RMS integration for engagement tracking
• Automated PowerBI report generation for stakeholder presentations
• Real-time sustainability metrics and projections

Technical Implementation:
• Built Verity RMS integration using Python with RESTful APIs
• Implemented Autosys job scheduling for automated report generation
• Angular frontend for portfolio manager dashboards
• Spring Boot/Java backend with DB2 database
• PowerBI integration for executive reporting

Business Impact:
• Enabled data-driven ESG investment decisions
• Provided portfolio managers with sustainability insights for product selection
• Automated stakeholder reporting, saving significant manual effort
• Established expertise in niche fintech domain (ESG/Sustainability)`,
    project_type: 'professional',
    company: 'Morgan Stanley',
    start_date: '2021-01-01',
    end_date: '2023-01-01',
    tech_stack: ['Angular', 'Spring Boot', 'Java', 'Python', 'DB2', 'PowerBI', 'Autosys'],
    status: 'published',
    image_url: null,
    project_url: null,
    github_url: null,
    youtube_url: null,
  },
  {
    title: 'Insurance Product Lifecycle Platform',
    slug: 'insurance-product-lifecycle-platform',
    description: 'E-commerce-style insurance platform with cart management and checkout flow. Migrated millions of XML records from relational database to MongoDB.',
    detailed_content: `Core Platform Features:
• E-commerce-style product selection with add-ons and customization
• Shopping cart functionality for insurance products
• Complete checkout flow with document requirements
• Product lifecycle management from selection to purchase

Data Migration Achievement:
• Migrated millions of rows from relational database to MongoDB
• Automated XML data migration earning "On the Spot" award
• Built custom API for large-scale data transformation and migration
• Ensured zero data loss during migration process

Technical Architecture:
• Event-driven architecture using Kafka for product state management
• Kafka streams managing product lifecycle transitions
• Angular frontend for customer-facing experience
• Spring Boot microservices backend
• MongoDB for flexible document storage

DevOps & Infrastructure:
• CI/CD pipeline setup with Jenkins and ElectricFlow
• Deployed on OpenShift container platform
• Automated build and deployment processes
• Infrastructure management for production workloads

Recognition:
• "On the Spot" award for data migration automation excellence`,
    project_type: 'professional',
    company: 'TIAA',
    start_date: '2019-07-01',
    end_date: '2021-01-01',
    tech_stack: ['Spring Boot', 'Angular', 'Kafka', 'MongoDB', 'Jenkins', 'ElectricFlow', 'OpenShift'],
    status: 'published',
    image_url: null,
    project_url: null,
    github_url: null,
    youtube_url: null,
  },
  {
    title: 'DG Drive - Enterprise Document Storage',
    slug: 'dg-drive-enterprise-document-storage',
    description: 'Multi-tenant document storage platform for insurance clients. Led team building high-throughput solution with advanced search capabilities for large-scale document management.',
    detailed_content: `Project Scope:
• Built custom document storage solution for multiple insurance clients
• Led development team creating enterprise-grade storage platform
• Designed and implemented RESTful API architecture
• Handled large volumes of documents with high throughput requirements

Technical Implementation:
• Spring Boot backend with RESTful API design
• Angular frontend for document management UI
• Elasticsearch integration for fast, powerful document search across massive repositories
• MySQL database for metadata and client management
• Swagger documentation for API consumers

Client Integration:
• Designed comprehensive API architecture for third-party integration
• Created Swagger documentation for seamless client onboarding
• Developed REST services allowing clients to integrate storage into their systems
• Successfully onboarded multiple insurance enterprise clients
• Provided API endpoints for storage, client management, and document operations

Key Features:
• Multi-tenant architecture supporting multiple insurance clients
• High-throughput document upload and retrieval
• Advanced search using Elasticsearch for quick document discovery
• Scalable architecture handling growing document volumes
• Comprehensive API for programmatic access

Leadership:
• Led development team from design to production deployment
• Managed client relationships and integration support
• Pat on the Back award for fixing critical SEV 5 production bug`,
    project_type: 'professional',
    company: 'TCS',
    start_date: '2018-01-01',
    end_date: '2019-07-01',
    tech_stack: ['Spring Boot', 'Angular', 'Elasticsearch', 'MySQL', 'Swagger'],
    status: 'published',
    image_url: null,
    project_url: null,
    github_url: null,
    youtube_url: null,
  },
];

async function seedProjects() {
  console.log('🚀 Starting professional projects seed...\n');

  for (const project of professionalProjects) {
    console.log(`📝 Inserting: ${project.title}`);
    console.log(`   Company: ${project.company}`);
    console.log(`   Period: ${project.start_date} - ${project.end_date || 'Present'}`);

    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select();

    if (error) {
      console.error(`❌ Error inserting ${project.title}:`, error.message);

      // Check if it's a duplicate slug error
      if (error.code === '23505') {
        console.log(`   ℹ️  Project already exists, skipping...\n`);
      } else {
        console.error(`   Full error:`, error);
        console.log('');
      }
    } else {
      console.log(`✅ Successfully inserted: ${project.title}`);
      console.log(`   ID: ${data[0].id}\n`);
    }
  }

  console.log('🎉 Professional projects seed completed!\n');

  // Fetch and display summary
  const { data: allProjects, count } = await supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .eq('project_type', 'professional');

  console.log(`📊 Summary:`);
  console.log(`   Total professional projects in database: ${count}`);
  console.log(`\n✨ All done! Visit /admin/projects to view them.`);
}

// Run the seed function
seedProjects().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
