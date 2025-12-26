-- Seed professional projects
-- Run this SQL in Supabase SQL Editor to insert professional projects
-- Note: First run add_featured_column.sql migration before running this seed file
-- This script uses ON CONFLICT to update existing projects instead of failing on duplicates

-- Decision Workflow Management System (Morgan Stanley, 2023-Present)
INSERT INTO projects (
  title,
  slug,
  description,
  detailed_content,
  project_type,
  company,
  start_date,
  end_date,
  tech_stack,
  status,
  featured,
  featured_description
) VALUES (
  'Decision Workflow Management System',
  'decision-workflow-management-system',
  'Real-time trading platform managing equity and fixed income decision lifecycles. Replaced costly FactSet RMS (thousands USD per user license) with scalable in-house solution.',
  'Core Functionality:
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
• Complete monitoring and reporting infrastructure for decision tracking across all downstream systems',
  'professional',
  'Morgan Stanley',
  '2023-01-01',
  NULL,
  ARRAY['Java', 'Spring Boot', 'Angular', 'Elasticsearch', 'DB2'],
  'published',
  true,
  'Integrated 9 downstream systems including Aladdin. Owned full development lifecycle: UX design, Elasticsearch search, real-time integration protocols, comprehensive test suites, and monitoring dashboards.'
)
ON CONFLICT (slug)
DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_content = EXCLUDED.detailed_content,
  project_type = EXCLUDED.project_type,
  company = EXCLUDED.company,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  tech_stack = EXCLUDED.tech_stack,
  status = EXCLUDED.status,
  featured = EXCLUDED.featured,
  featured_description = EXCLUDED.featured_description;

-- Custom Portfolio - ESG Analytics (Morgan Stanley, 2021-2023)
INSERT INTO projects (
  title,
  slug,
  description,
  detailed_content,
  project_type,
  company,
  start_date,
  end_date,
  tech_stack,
  status,
  featured,
  featured_description
) VALUES (
  'Custom Portfolio - ESG Analytics',
  'custom-portfolio-esg-analytics',
  'ESG portfolio management platform enabling portfolio managers to create customized portfolios with sustainability projections. Led team of 5 engineers from concept to production.',
  'Leadership & Scope:
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
• Established expertise in niche fintech domain (ESG/Sustainability)',
  'professional',
  'Morgan Stanley',
  '2021-01-01',
  '2023-01-01',
  ARRAY['Angular', 'Spring Boot', 'Java', 'Python', 'DB2', 'PowerBI', 'Autosys'],
  'published',
  true,
  'Built Verity RMS integration with RESTful APIs and Autosys scheduling for automated PowerBI reports. Enabled ESG engagement tracking for investment decisions. Won Tech Showcase 2 consecutive years.'
)
ON CONFLICT (slug)
DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_content = EXCLUDED.detailed_content,
  project_type = EXCLUDED.project_type,
  company = EXCLUDED.company,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  tech_stack = EXCLUDED.tech_stack,
  status = EXCLUDED.status,
  featured = EXCLUDED.featured,
  featured_description = EXCLUDED.featured_description;

-- Insurance Product Lifecycle Platform (TIAA, 2019-2021)
INSERT INTO projects (
  title,
  slug,
  description,
  detailed_content,
  project_type,
  company,
  start_date,
  end_date,
  tech_stack,
  status,
  featured,
  featured_description
) VALUES (
  'Insurance Product Lifecycle Platform',
  'insurance-product-lifecycle-platform',
  'E-commerce-style insurance platform with cart management and checkout flow. Migrated millions of XML records from relational database to MongoDB.',
  'Core Platform Features:
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
• "On the Spot" award for data migration automation excellence',
  'professional',
  'TIAA',
  '2019-07-01',
  '2021-01-01',
  ARRAY['Spring Boot', 'Angular', 'Kafka', 'MongoDB', 'Jenkins', 'ElectricFlow', 'OpenShift'],
  'published',
  true,
  'Event-driven architecture with Kafka managing product state transitions. Automated XML data migration earning "On the Spot" award. Deployed via Jenkins, ElectricFlow, and OpenShift.'
)
ON CONFLICT (slug)
DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_content = EXCLUDED.detailed_content,
  project_type = EXCLUDED.project_type,
  company = EXCLUDED.company,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  tech_stack = EXCLUDED.tech_stack,
  status = EXCLUDED.status,
  featured = EXCLUDED.featured,
  featured_description = EXCLUDED.featured_description;

-- DG Drive - Enterprise Document Storage (TCS, 2018-2019)
INSERT INTO projects (
  title,
  slug,
  description,
  detailed_content,
  project_type,
  company,
  start_date,
  end_date,
  tech_stack,
  status,
  featured,
  featured_description
) VALUES (
  'DG Drive - Enterprise Document Storage',
  'dg-drive-enterprise-document-storage',
  'Multi-tenant document storage platform for insurance clients. Led team building high-throughput solution with advanced search capabilities for large-scale document management.',
  'Project Scope:
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
• Pat on the Back award for fixing critical SEV 5 production bug',
  'professional',
  'TCS',
  '2018-01-01',
  '2019-07-01',
  ARRAY['Spring Boot', 'Angular', 'Elasticsearch', 'MySQL', 'Swagger'],
  'published',
  true,
  'Architected RESTful APIs with Swagger documentation for seamless client integration. Implemented Elasticsearch for fast document retrieval across massive repositories. Successfully onboarded multiple enterprise clients.'
)
ON CONFLICT (slug)
DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_content = EXCLUDED.detailed_content,
  project_type = EXCLUDED.project_type,
  company = EXCLUDED.company,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  tech_stack = EXCLUDED.tech_stack,
  status = EXCLUDED.status,
  featured = EXCLUDED.featured,
  featured_description = EXCLUDED.featured_description;
