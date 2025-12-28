# Portfolio V2 🚀

A production-grade personal portfolio website with blog, projects showcase, and admin dashboard — built with modern full-stack architecture, automated CI/CD, and comprehensive testing infrastructure.

🌐 **Live**: https://divij.tech
🧪 **QA**: https://divij-qa.tech

⸻

## TL;DR

This is my personal portfolio website built as a real-world full-stack product with authentication, admin tooling, dual QA/Production environments, automated database migrations, CI/CD pipelines, and comprehensive testing. Not just a static site — a production-ready application with proper DevOps practices.

⸻

## 📸 Screenshots

### Homepage
![Homepage](.github/screenshots/homepage.png)

### Blog
![Blog](.github/screenshots/blog.png)

### Projects
![Projects](.github/screenshots/projects.png)

### Admin Panel

<details>
<summary>Click to view all admin panel screenshots</summary>

#### Dashboard
![Admin Dashboard](.github/screenshots/admin-dashboard.png)

#### Blog Management
![Admin Blogs](.github/screenshots/admin-blogs.png)

#### Project Management
![Admin Projects](.github/screenshots/admin-projects.png)

#### Messages Inbox
![Admin Messages](.github/screenshots/admin-messages.png)

#### User Activity Tracking
![Admin Activity](.github/screenshots/admin-activity.png)

#### Resume Management
![Admin Resume](.github/screenshots/admin-resume.png)

</details>

⸻

## ✨ Features

**Public Features**
- Responsive portfolio website
- Blog with rich text editor and markdown support
- Projects showcase with multiple types
- Contact form with message storage
- Resume viewer and download
- SEO-optimized pages

**Admin Features**
- Secure authentication with Supabase Auth
- Blog management (create, edit, delete, draft/publish)
- Project management (CRUD operations)
- Message inbox from contact form
- User activity tracking
- Resume upload and management
- Dashboard with statistics

⸻

## 🧱 Tech Stack

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components

**Backend & Services**
- Supabase (PostgreSQL, Auth, Storage)
- Server Actions / API Routes
- Row Level Security (RLS)

**Testing**
- Vitest (unit tests)
- Playwright (E2E tests)

**DevOps & Tooling**
- GitHub Actions (CI/CD)
- Vercel (dual projects for QA + Production)
- ESLint & TypeScript strict mode
- Trivy (security scanning)
- Automated database migrations

⸻

## 🏗 Architecture

**Dual Environment Setup**
```
GitHub Push → CI Tests → QA Deploy → Manual Approval → Production Deploy
                ↓            ↓                             ↓
           (7 minutes)  (divij-qa.tech)             (divij.tech)
```

- **QA Environment**: Auto-deploys on push to `main`, separate Supabase DB
- **Production Environment**: Requires manual approval, production Supabase DB
- **Database Migrations**: Auto-apply to QA → approve → auto-apply to Production

⸻

## 🔄 CI/CD Pipeline

**On every push/PR:**
- Linting and type-checking
- Unit tests (Vitest)
- Build verification
- E2E tests (Playwright)
- Security scanning (Trivy)

**On merge to main:**
- All CI tests must pass (~7 minutes)
- Auto-deploy to QA environment
- Wait for manual approval
- Auto-deploy to Production

**Database Migrations:**
- Create migration in `supabase/migrations/`
- Push to GitHub
- Auto-apply to QA database
- Test on divij-qa.tech
- Approve in GitHub Actions
- Auto-apply to Production database

⸻

## 🧪 Testing

**Run all tests**
```bash
npm test
```

**Unit tests**
```bash
npm run test:unit
```

**E2E tests**
```bash
npx playwright install
npm run test:e2e
```

**Type checking**
```bash
npm run type-check
```

⸻

## 🛠 Local Development

**Prerequisites**
- Node.js 18+
- Supabase account (free tier)
- Vercel account (for deployment)

**Setup**
```bash
# Clone and install
git clone https://github.com/yourusername/portfolio-v2.git
cd portfolio-v2
npm install

# Environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

**Environment Variables**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Database Setup**
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

**Create Admin User**
```sql
UPDATE public.profiles
SET is_admin = true
WHERE email = 'your-email@example.com';
```

⸻

## 🚀 Deployment

**Production Setup**
1. Create two Supabase projects (QA + Production)
2. Create two Vercel projects (QA + Production)
3. Configure GitHub Secrets and Environment
4. Push to `main` branch
5. Approve production deployment in GitHub Actions

**Rollback**
- Vercel dashboard → Previous deployment → "Promote to Production"
- Rollback complete in ~30 seconds

**Cost: ~$15/year**
- Vercel Free Tier: $0 (2 projects)
- Supabase Free Tier: $0 (2 projects)
- Domain (divij.tech): ~$15/year

⸻

## 📁 Project Structure

```
portfolio-v2/
├── app/                    # Next.js app directory
│   ├── (public pages)/     # Blog, Projects, About, Contact
│   ├── admin/              # Admin dashboard
│   ├── api/                # API routes
│   └── login/              # Auth
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   └── admin/              # Admin components
├── lib/
│   ├── supabase/           # Supabase clients
│   └── utils.ts            # Helpers
├── supabase/
│   └── migrations/         # Database migrations
├── .github/
│   └── workflows/          # CI/CD pipelines
└── tests/
    ├── unit/               # Vitest tests
    └── e2e/                # Playwright tests
```

⸻

## 🔒 Security

- Row Level Security (RLS) on all Supabase tables
- Admin-only access to sensitive data
- Environment variables for secrets
- Automated security scanning in CI
- Edge Runtime for fast, secure middleware

⸻

## 📊 Performance

- Server-Side Rendering (SSR)
- Static Site Generation (SSG)
- Incremental Static Regeneration (ISR)
- Next.js Image optimization
- Automatic code splitting
- Lighthouse Score: 95+

⸻

## 🗺 Roadmap

- [ ] Email notifications for contact form
- [ ] Analytics dashboard
- [ ] Dark mode
- [ ] Blog categories and tags
- [ ] Search functionality

⸻

## 👤 About

Built by **Divij Shrivastava** — a full-stack developer focused on building scalable, production-ready systems with clean architecture and strong engineering practices.

⸻

## 🤝 Contributing

This is a personal portfolio project, but feel free to fork it, explore the codebase, or open an issue if you spot improvements.

⸻

## 📄 License

MIT License - feel free to use this for your own portfolio!

⸻

## 🙏 Credits

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tiptap](https://tiptap.dev/) - Rich text editor
- [Vercel](https://vercel.com/) - Hosting
- [Vitest](https://vitest.dev/) - Unit testing
- [Playwright](https://playwright.dev/) - E2E testing
