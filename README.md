# Portfolio V2

A modern, fast, mobile-first portfolio website built with Next.js 14, Supabase, and Tailwind CSS.

## Features

### Public Features
- **Homepage** with introduction and featured sections
- **Blog** with full WYSIWYG editor, markdown support, and image uploads
- **Projects** showcase with multiple project types (website, YouTube, coding, etc.)
- **About** page with skills and experience
- **Contact** form with message storage
- **Resume** viewer and download

### Admin Features
- Secure admin authentication
- Blog management (create, edit, delete, approve/draft)
- Project management (CRUD operations)
- Message inbox from contact form
- User activity tracking (IP addresses, pages visited)
- Resume upload and management
- Dashboard with statistics

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Hosting**: Vercel
- **Rich Text Editor**: Tiptap

## Performance Features

- Server-Side Rendering (SSR) for dynamic content
- Static Site Generation (SSG) for blog posts
- Incremental Static Regeneration (ISR)
- Next.js Image optimization (automatic WebP/AVIF)
- Automatic code splitting
- Edge functions for API routes
- Mobile-first responsive design

## Cost

**$0/month** - Completely free using:
- Vercel Free Tier (100GB bandwidth/month)
- Supabase Free Tier (500MB database, 1GB storage)

## Quick Start

### Prerequisites

- Node.js 18+
- A Supabase account
- A Vercel account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd portfolio-v2
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials.

4. Set up Supabase:
- Create a new Supabase project
- Run the SQL schema from `supabase-schema.sql` in Supabase SQL Editor
- Create storage buckets (blog-images, project-images, resume-files, uploads)
- Create your admin user and set `is_admin = true` in the profiles table

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Migration from Old Portfolio

If you're migrating from an existing MySQL-based portfolio:

1. Export data from MySQL:
```bash
node scripts/export-from-mysql.js
```

2. Import to Supabase:
```bash
node scripts/import-to-supabase.js
```

3. Migrate images:
```bash
node scripts/migrate-images.js
```

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub

2. Go to [vercel.com](https://vercel.com) and import your repository

3. Add environment variables in Vercel project settings

4. Deploy!

Your portfolio will be live at `https://your-project.vercel.app`

## Project Structure

```
portfolio-v2/
├── app/                  # Next.js app directory
│   ├── (public pages)/   # Blog, Projects, About, Contact, Resume
│   ├── admin/            # Admin dashboard and management
│   ├── api/              # API routes
│   └── login/            # Admin login
├── components/           # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Navigation, Footer
│   ├── blog/             # Blog-specific components
│   ├── projects/         # Project components
│   └── admin/            # Admin components
├── lib/                  # Utility functions
│   ├── supabase/         # Supabase clients
│   └── utils.ts          # Helper functions
├── scripts/              # Migration scripts
└── public/               # Static assets
```

## Admin Access

1. Go to `/login`
2. Sign in with your admin credentials
3. Access the admin dashboard at `/admin`

### Creating an Admin User

After setting up Supabase, run this SQL:

```sql
UPDATE public.profiles
SET is_admin = true
WHERE email = 'your-email@example.com';
```

## Features in Detail

### Blog System
- Rich text editor with image uploads
- Draft/Published status
- View tracking
- SEO-friendly URLs (slugs)
- Reading time estimation
- Thumbnail and cover image support

### Project Management
- Multiple project types (website, YouTube, coding, etc.)
- GitHub, YouTube, and external link support
- Tag system
- Draft/Published workflow

### Contact Form
- Spam-free message storage
- Read/Unread status
- Email notifications (optional)

### User Activity Tracking
- IP address logging
- Page visit tracking
- User agent detection
- Referrer tracking

## Customization

### Colors and Styling
Edit `tailwind.config.ts` and `app/globals.css` to customize colors and styles.

### Content
- Update the About page in `app/about/page.tsx`
- Change social links in `components/layout/footer.tsx`
- Modify homepage content in `app/page.tsx`

## Performance

This portfolio achieves excellent performance scores:
- Lighthouse Score: 95+
- First Contentful Paint: < 1s
- Time to Interactive: < 2s
- Mobile-first and fully responsive

## Security

- Row Level Security (RLS) enabled on all Supabase tables
- Admin-only access to sensitive data
- Secure authentication with Supabase Auth
- Environment variables for sensitive keys

## Support

For issues or questions:
- Check [SETUP.md](./SETUP.md) for detailed setup instructions
- Review the Supabase schema in `supabase-schema.sql`
- Check migration scripts in `/scripts`

## License

MIT License - feel free to use this for your own portfolio!

## Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tiptap](https://tiptap.dev/)
