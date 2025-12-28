# Portfolio V2

A modern, production-ready portfolio website with automated CI/CD, dual-environment deployment (QA + Production), and comprehensive testing infrastructure.

**Live Sites:**
- Production: [divij.tech](https://divij.tech)
- QA Environment: [divij-qa.tech](https://divij-qa.tech)

## Features

### Public Features
- **Homepage** with introduction and featured sections
- **Blog** with full WYSIWYG editor, markdown support, and image uploads
- **Projects** showcase with multiple project types (website, YouTube, coding, etc.)
- **About** page with skills and experience
- **Contact** form with message storage
- **Resume** viewer and download

### Admin Features
- Secure admin authentication with Supabase Auth
- Blog management (create, edit, delete, approve/draft)
- Project management (CRUD operations)
- Message inbox from contact form
- User activity tracking (IP addresses, pages visited)
- Resume upload and management
- Dashboard with statistics

## Tech Stack

### Core Technologies
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Hosting**: Vercel
- **Rich Text Editor**: Tiptap

### DevOps & Testing
- **CI/CD**: GitHub Actions with automated workflows
- **Environments**: QA (divij-qa.tech) + Production (divij.tech)
- **Testing**: Vitest (unit), Playwright (e2e)
- **Code Quality**: ESLint, TypeScript strict mode
- **Security**: Trivy vulnerability scanning
- **Database Migrations**: Automated Supabase migrations with approval gates

## Architecture

### Dual Environment Setup

```
GitHub Push → CI Tests → QA Deployment → Manual Approval → Production Deployment
                ↓              ↓                              ↓
            (7 minutes)  (divij-qa.tech)              (divij.tech)
```

**QA Environment:**
- Automatic deployment on every push to `main`
- Separate Supabase database for testing
- Domain: divij-qa.tech
- Purpose: Test changes before production

**Production Environment:**
- Requires manual approval via GitHub Actions
- Production Supabase database
- Domain: divij.tech
- Purpose: Live user-facing site

### CI/CD Pipeline

**On every push/PR:**
1. Code quality checks (linting, formatting)
2. Type checking (TypeScript)
3. Unit tests (Vitest)
4. Build verification
5. E2E tests (Playwright)
6. Security scanning (Trivy)

**On merge to main:**
1. All CI tests must pass
2. Auto-deploy to QA environment
3. Wait for manual approval
4. Auto-deploy to Production after approval

### Database Migrations

Automated migration workflow:
1. Create migration file in `supabase/migrations/`
2. Push to GitHub
3. Migration automatically applied to QA database
4. Test on divij-qa.tech
5. Approve in GitHub Actions
6. Migration applied to Production database

## Performance Features

- Server-Side Rendering (SSR) for dynamic content
- Static Site Generation (SSG) for blog posts
- Incremental Static Regeneration (ISR)
- Next.js Image optimization (automatic WebP/AVIF)
- Automatic code splitting
- Edge Runtime middleware for auth
- Mobile-first responsive design
- Lighthouse Score: 95+

## Cost

**~$15/year** total:
- Vercel Free Tier: $0 (2 projects, 100GB bandwidth/month each)
- Supabase Free Tier: $0 (2 projects, 500MB database each, 1GB storage each)
- divij.tech domain: ~$15/year
- divij-qa.tech domain: ~$15/year (optional - using subdomain is free)

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- A Supabase account (free tier)
- A Vercel account (free tier)

### Local Development Setup

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/portfolio-v2.git
cd portfolio-v2
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Set up Supabase:**

Create a new Supabase project, then run the schema:
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

Or manually run the SQL in `supabase-schema.sql` via Supabase SQL Editor.

5. **Create storage buckets in Supabase:**
   - `blog-images` (public)
   - `project-images` (public)
   - `profile-images` (public)
   - `resumes` (public)

6. **Create your admin user:**

Sign up via the app, then run this SQL in Supabase:
```sql
UPDATE public.profiles
SET is_admin = true
WHERE email = 'your-email@example.com';
```

7. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Deployment

### Initial Production Setup

1. **Create Supabase Projects:**
   - Create QA Supabase project
   - Create Production Supabase project
   - Run schema on both
   - Create storage buckets on both

2. **Create Vercel Projects:**
   - Create QA Vercel project (connects to QA Supabase)
   - Create Production Vercel project (connects to Production Supabase)
   - Both projects watch the `main` branch

3. **Configure GitHub Secrets:**

Go to GitHub → Settings → Secrets and add:
```
SUPABASE_ACCESS_TOKEN
SUPABASE_QA_PROJECT_REF
SUPABASE_PROD_PROJECT_REF
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
VERCEL_PROJECT_ID_QA
```

4. **Configure GitHub Environment:**
   - Go to GitHub → Settings → Environments
   - Create "Production" environment
   - Add yourself as required reviewer
   - Disable admin bypass (for proper approval workflow)

5. **Deploy:**
```bash
git push origin main
```

This will:
- Run all CI tests (~7 minutes)
- Deploy to QA automatically
- Wait for your approval
- Deploy to Production after approval

### Deployment Workflow

**Normal feature development:**
1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and test locally
3. Create Pull Request
4. CI tests run automatically
5. Merge after CI passes and code review
6. QA deploys automatically → test on divij-qa.tech
7. Approve in GitHub Actions when ready
8. Production deploys automatically → live on divij.tech

**Emergency hotfix:**
1. Create hotfix branch
2. Fix and push
3. CI runs (~7 minutes)
4. Quick test on QA
5. Immediate approval for production

**Rollback:**
- Go to Vercel dashboard
- Find previous deployment
- Click "Promote to Production"
- Rollback complete in ~30 seconds

## Testing

### Run All Tests
```bash
npm test
```

### Unit Tests
```bash
npm run test:unit
```

### E2E Tests
```bash
# Install browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## Project Structure

```
portfolio-v2/
├── app/                      # Next.js app directory
│   ├── (public pages)/       # Blog, Projects, About, Contact, Resume
│   ├── admin/                # Admin dashboard and management
│   ├── api/                  # API routes
│   └── login/                # Admin login
├── components/               # React components
│   ├── ui/                   # shadcn/ui components
│   ├── layout/               # Navigation, Footer
│   ├── blog/                 # Blog-specific components
│   ├── projects/             # Project components
│   └── admin/                # Admin components
├── lib/                      # Utility functions
│   ├── supabase/             # Supabase clients (browser, server, admin)
│   └── utils.ts              # Helper functions
├── supabase/
│   └── migrations/           # Database migration files
├── .github/
│   └── workflows/            # CI/CD workflows
│       ├── ci.yml            # Test pipeline
│       ├── deploy-qa-prod.yml # Deployment pipeline
│       └── migrate-databases.yml # Database migrations
├── tests/
│   ├── unit/                 # Vitest unit tests
│   └── e2e/                  # Playwright E2E tests
└── public/                   # Static assets
```

## Admin Access

1. Go to `/login`
2. Sign in with your admin credentials
3. Access the admin dashboard at `/admin`

**Admin Features:**
- Dashboard with visitor stats and recent activity
- Blog management (create, edit, delete, draft/publish)
- Project management (CRUD operations)
- Message inbox from contact form
- Resume upload and management

## Database Migrations

Create a new migration:
```bash
# Create migration file
supabase migration new your_migration_name

# Edit the file in supabase/migrations/
# Add your SQL changes

# Test locally
supabase db push

# Commit and push to GitHub
git add .
git commit -m "feat: add your_migration_name"
git push origin main
```

The migration will:
1. Apply to QA database automatically
2. Wait for your approval in GitHub Actions
3. Apply to Production database after approval

## Security

- **Row Level Security (RLS)** enabled on all Supabase tables
- **Admin-only access** to sensitive data and management features
- **Secure authentication** with Supabase Auth (email + password)
- **Environment variables** for all sensitive keys
- **Automated security scanning** with Trivy in CI pipeline
- **Edge Runtime** for fast, secure middleware
- **CORS protection** on API routes

## Environment Variables

Required environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=generate-random-secret

# Optional: Email notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Monitoring & Debugging

- **Vercel Logs**: Real-time logs in Vercel dashboard
- **Supabase Logs**: Database query logs and errors
- **GitHub Actions**: CI/CD pipeline logs
- **Health Endpoint**: `/api/health` for uptime monitoring

## Customization

### Colors and Styling
Edit `tailwind.config.ts` and `app/globals.css` to customize colors and styles.

### Content
- Update the About page: `app/about/page.tsx`
- Change social links: `components/layout/footer.tsx`
- Modify homepage: `app/page.tsx`

### Blog Configuration
- Edit blog metadata in blog post frontmatter
- Customize editor in `components/admin/blog/BlogEditor.tsx`

## Troubleshooting

### Build Failures
- Check Vercel deployment logs
- Verify all environment variables are set
- Run `npm run build` locally to reproduce

### Database Connection Issues
- Verify Supabase credentials in `.env.local`
- Check Supabase project is active (not paused)
- Verify RLS policies are correct

### Admin Access Issues
- Verify `is_admin = true` in profiles table
- Check auth session is valid
- Clear browser cache and re-login

## Contributing

This is a personal portfolio project, but feel free to fork and customize for your own use!

## License

MIT License - feel free to use this for your own portfolio!

## Credits

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Tiptap](https://tiptap.dev/) - Headless rich text editor
- [Vercel](https://vercel.com/) - Deployment platform
- [Vitest](https://vitest.dev/) - Unit testing framework
- [Playwright](https://playwright.dev/) - E2E testing framework

---

**Made with ❤️ by Divij Shrivastava**
