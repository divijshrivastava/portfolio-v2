# Environment Configuration Guide

## Overview

This project uses a two-environment deployment strategy:
- **QA Environment**: For testing changes before production
- **Production Environment**: The live site used by real users

Both environments are completely isolated with separate databases, domains, and Vercel projects.

## Environments

### QA Environment

- **Domain**: https://divij-qa.tech
- **Vercel Project**: portfolio-v2-qa
- **Database**: QA Supabase project (portfolio-v2-qa)
- **Purpose**: Testing and validation before production
- **Auto-deploys**: Every push to `main` branch

### Production Environment

- **Domain**: https://divij.tech
- **Vercel Project**: portfolio-v2
- **Database**: Production Supabase project
- **Purpose**: Live site for users
- **Deploys**: After manual approval via GitHub Actions

### Development Environment

- **URL**: http://localhost:3000
- **Database**: Uses QA or Production Supabase (configured in `.env.local`)
- **Purpose**: Local development and testing

## Environment Variables

Each Vercel project has its own set of environment variables configured in the Vercel dashboard.

### Required Variables

All environments need these variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>

# App Configuration
NEXT_PUBLIC_APP_URL=<your-app-url>
NEXTAUTH_URL=<your-app-url>
NEXTAUTH_SECRET=<random-secret>
```

### QA Environment Variables (Vercel: portfolio-v2-qa)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<qa-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<qa-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<qa-service-role-key>
NEXT_PUBLIC_APP_URL=https://divij-qa.tech
NEXTAUTH_URL=https://divij-qa.tech
NEXTAUTH_SECRET=<qa-secret>
```

### Production Environment Variables (Vercel: portfolio-v2)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<prod-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<prod-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<prod-service-role-key>
NEXT_PUBLIC_APP_URL=https://divij.tech
NEXTAUTH_URL=https://divij.tech
NEXTAUTH_SECRET=<production-secret>
```

### Local Development (.env.local)

Create a `.env.local` file in the project root:

```bash
# Use QA Supabase for local development
NEXT_PUBLIC_SUPABASE_URL=https://<qa-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<qa-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<qa-service-role-key>

# Local app URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=local-development-secret-min-32-chars
```

**Important**: Never commit `.env.local` to git!

## Deployment Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and test locally
npm run dev

# Commit and push
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
```

### 2. Create Pull Request

1. Create PR: `feature/new-feature` → `main`
2. CI tests run automatically (~7 minutes)
3. Wait for tests to pass
4. Get code review approval (if working with a team)

### 3. Merge to Main

1. Merge PR after approval
2. **QA deployment happens automatically** (~1-2 minutes)
3. Visit https://divij-qa.tech to test

### 4. Test on QA

Visit https://divij-qa.tech and verify:

- [ ] Homepage loads correctly
- [ ] New feature works as expected
- [ ] No errors in browser console (F12)
- [ ] Mobile responsiveness
- [ ] Admin features work (if applicable)
- [ ] Database operations work correctly

### 5. Approve Production Deployment

Once QA testing is complete:

1. Go to [GitHub Actions](../../actions)
2. Find the latest "Deploy QA and Production" workflow run
3. Click "Review deployments"
4. Select "production" environment
5. Click "Approve and deploy"

### 6. Production Deployment

After approval:
- Vercel automatically deploys to https://divij.tech (~1-2 minutes)
- Verify production site works correctly

## Environment Detection

The application automatically detects which environment it's running in.

### Using Environment Detection in Code

```typescript
import { getEnvironment, isProduction, isQA, isDevelopment } from '@/lib/config/environment';

// Get current environment
const env = getEnvironment(); // 'qa' | 'production' | 'development'

// Boolean checks
if (isProduction()) {
  // Production-only code
}

if (isQA()) {
  // QA-only code
}

if (isDevelopment()) {
  // Development-only code
}

// Get full config
import { getConfig } from '@/lib/config/environment';
const config = getConfig();
console.log(config.environment); // 'qa', 'production', or 'development'
console.log(config.name); // 'QA', 'Production', or 'Development'
console.log(config.appUrl); // Current app URL
```

### Environment Badge (for Admin UI)

```typescript
import { getEnvironmentName, getEnvironmentColor } from '@/lib/config/environment';

// In your admin dashboard component
<div className={`px-2 py-1 rounded text-sm font-medium ${getEnvironmentColor()}`}>
  {getEnvironmentName()}
</div>
```

## Rollback Procedures

### Instant Rollback (Recommended for Emergencies)

If production has a critical issue:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Open **portfolio-v2** project (production)
3. Click **Deployments**
4. Find the last working deployment (marked with ✅)
5. Click the three dots (...) → **Promote to Production**
6. Site rolls back in ~30 seconds

### Code Rollback (via Git)

If you need to revert code changes:

```bash
# Find the bad commit
git log --oneline

# Revert it
git revert <commit-hash>

# Push to main
git push origin main

# This triggers QA deployment
# Test on QA, then approve for production
```

### Database Rollback (if needed)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your production project
3. Go to **Database** → **Backups**
4. Restore from a previous backup (7 days available on free tier)

**Important**: Coordinate database rollback with code rollback!

## Troubleshooting

### QA Deployment Failed

1. Check Vercel deployment logs:
   - Go to Vercel → portfolio-v2-qa → Deployments
   - Click on the failed deployment
   - Review build logs

2. Common issues:
   - Environment variables not set
   - Build errors (check TypeScript, linting)
   - Missing dependencies

### Production Deployment Not Happening

1. Check if you approved the deployment:
   - Go to GitHub Actions
   - Look for pending approval

2. Check Vercel deployment logs:
   - Go to Vercel → portfolio-v2 → Deployments

### Environment Variables Not Working

1. Verify variables in Vercel:
   - Go to Project Settings → Environment Variables
   - Ensure all required variables are set
   - Check for typos

2. Redeploy if you changed variables:
   - Go to Deployments
   - Click "..." on latest deployment
   - Click "Redeploy"

### Database Connection Issues

1. Check Supabase URL and keys:
   - Go to Supabase → Project Settings → API
   - Verify URL and keys match Vercel config

2. Check RLS policies:
   - Go to Supabase → Authentication → Policies
   - Ensure policies allow your operations

### Wrong Environment Detected

1. Check hostname:
   - QA: divij-qa.tech
   - Production: divij.tech
   - Development: localhost:3000

2. Check NEXT_PUBLIC_APP_URL:
   - Should match the domain
   - Set in Vercel environment variables

## Testing Checklist

### Before Approving Production

Test on https://divij-qa.tech:

**Functionality:**
- [ ] Homepage loads
- [ ] Blog listing works
- [ ] Individual blog posts load
- [ ] Blog view counter increments
- [ ] Contact form submits
- [ ] Admin login works
- [ ] Admin dashboard loads
- [ ] Image uploads work (if applicable)

**Technical:**
- [ ] No errors in browser console (F12)
- [ ] No errors in Vercel logs
- [ ] No errors in Supabase logs
- [ ] Mobile responsive (test on phone or dev tools)
- [ ] Fast page load times

**Database:**
- [ ] QA Supabase has new data (if applicable)
- [ ] Database queries work correctly
- [ ] RLS policies working (no unauthorized access)

**New Feature:**
- [ ] Feature works as expected
- [ ] Edge cases handled
- [ ] Error messages clear
- [ ] No regressions in existing features

## Best Practices

### Development

1. **Always use feature branches**
   - Never commit directly to `main`
   - Use descriptive branch names (e.g., `feature/add-dark-mode`)

2. **Test locally first**
   - Run `npm run dev` and test thoroughly
   - Fix any errors before pushing

3. **Use QA Supabase for local dev**
   - Don't connect to production database locally
   - Keep production data safe

### QA Testing

1. **Test thoroughly on QA**
   - Don't rush to production
   - QA is free to break, production is not

2. **Share QA URL for feedback**
   - https://divij-qa.tech can be shared with others
   - Get stakeholder approval on QA before production

3. **Multiple iterations are OK**
   - Fix bugs on QA as many times as needed
   - Each push to `main` updates QA automatically

### Production Deployment

1. **Only approve when confident**
   - All tests passed on QA
   - No errors in logs
   - Feature works perfectly

2. **Monitor after deployment**
   - Check https://divij.tech immediately after deployment
   - Watch Vercel logs for errors
   - Check Supabase metrics

3. **Have rollback plan ready**
   - Know how to instant rollback via Vercel
   - Keep previous deployment URL handy

## Environment Comparison

| Feature | Development | QA | Production |
|---------|-------------|-----|------------|
| Domain | localhost:3000 | divij-qa.tech | divij.tech |
| Database | QA Supabase | QA Supabase | Prod Supabase |
| Deployment | Manual (`npm run dev`) | Auto (on push to main) | Manual approval |
| Testing | ✅ | ✅ | ❌ Test on QA first |
| Breaking OK? | ✅ Yes | ✅ Yes | ❌ No |
| Real users | ❌ | ❌ | ✅ Yes |
| Monitoring | Console logs | Vercel logs | Vercel logs + Analytics |

## Security Notes

1. **Never commit secrets**
   - Don't commit `.env.local`
   - Don't commit Supabase keys
   - Use Vercel environment variables

2. **Separate credentials**
   - QA and Production have different Supabase projects
   - Different keys and secrets
   - No shared access

3. **Rotate secrets regularly**
   - Update NEXTAUTH_SECRET every 90 days
   - Generate new: `openssl rand -base64 32`

4. **Monitor access**
   - Check Supabase auth logs
   - Review Vercel access logs
   - Watch for suspicious activity

## Support

- **Documentation**: See [CICD-STRATEGY.md](./CICD-STRATEGY.md) for full CI/CD details
- **Deployment Guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions
- **Issues**: Create an issue in the GitHub repository
- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
