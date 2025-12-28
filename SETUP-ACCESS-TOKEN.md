# Add Supabase Access Token (Final Step)

## Status

✅ 4 out of 5 GitHub secrets configured:
- SUPABASE_QA_PROJECT_REF
- SUPABASE_PROD_PROJECT_REF
- SUPABASE_QA_DB_PASSWORD
- SUPABASE_PROD_DB_PASSWORD

❌ Missing: SUPABASE_ACCESS_TOKEN

## Quick Setup (2 minutes)

### Step 1: Generate Token

1. Go to: https://supabase.com/dashboard/account/tokens
2. Click "Generate New Token"
3. Name: `github-actions-migrations`
4. Copy the token (starts with `sbp_`)

### Step 2: Add to GitHub

Run this one-liner (replace YOUR_TOKEN with the actual token):

```bash
gh secret set SUPABASE_ACCESS_TOKEN --body "YOUR_TOKEN"
```

Or manually:
1. Go to: https://github.com/divijshrivastava/portfolio-v2/settings/secrets/actions
2. Click "New repository secret"
3. Name: `SUPABASE_ACCESS_TOKEN`
4. Secret: Paste your token
5. Click "Add secret"

### Step 3: Verify

```bash
gh secret list | grep SUPABASE
```

You should see all 5 secrets listed.

## Next Step

Once the token is added, test the automated workflow:

```bash
# Create a test migration
cat > supabase/migrations/$(date +%Y%m%d%H%M%S)_test_workflow.sql <<'EOF'
-- Test automated migrations workflow
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS workflow_test BOOLEAN DEFAULT true;
EOF

# Commit and push
git add supabase/migrations/
git commit -m "Test: automated migration workflow"
git push

# Then:
# 1. Go to GitHub → Actions
# 2. Watch "Database Migrations" workflow run
# 3. See it apply to QA automatically
# 4. Click "Review deployments" to approve production
```

## Troubleshooting

If you get "Secret not found" errors in GitHub Actions:
- Verify the secret name is exactly: `SUPABASE_ACCESS_TOKEN`
- Check the token hasn't expired
- Regenerate token if needed from Supabase dashboard
