# How to Enable Production Approval Gate

## Current Behavior

Both database migrations and deployments go to production **automatically** without requiring approval because:
- You're a repository admin
- GitHub "Production" environment has `can_admins_bypass: true`
- Admin bypass allows you to skip the approval requirement

## Enable Manual Approval (2 Steps)

### Step 1: Disable Admin Bypass

Go to: https://github.com/divijshrivastava/portfolio-v2/settings/environments

1. Click **"Production"** environment
2. Scroll to **"Deployment protection rules"**
3. **Uncheck** "Allow administrators to bypass configured protection rules"
4. Click **"Save protection rules"**

### Step 2: Add a Second Reviewer (Required)

GitHub requires at least one reviewer who is **not** you. You have 3 options:

#### Option A: Add a Collaborator
1. Invite a trusted person to the repository
2. Add them as a required reviewer for "Production" environment

#### Option B: Create a Bot Account
1. Create a second GitHub account (e.g., `divij-bot`)
2. Add it as a collaborator
3. Add it as a required reviewer
4. You'll need to log in as the bot to approve

#### Option C: Use GitHub Apps
1. Install a GitHub App for approvals (e.g., Mergify, Pull Panda)
2. Configure it to handle approvals

---

## What Happens After Enabling

### Database Migrations

```bash
# Push migration
git add supabase/migrations/ && git commit && git push

# 1. QA applies automatically (~30 seconds)
# 2. GitHub Actions pauses ⏸️
# 3. Go to: https://github.com/divijshrivastava/portfolio-v2/actions
# 4. Click "Review deployments"
# 5. Approve "Production" environment
# 6. Production applies automatically (~30 seconds)
```

### Deployments

Same process - both QA and Production deployments will wait for approval.

---

## Recommendation

**Keep admin bypass enabled** (current setup) because:
- ✅ You're the only developer
- ✅ Self-approval is just extra clicking with no security benefit
- ✅ QA environment provides testing safety
- ✅ Faster workflow for solo development
- ✅ You can still manually test on QA before pushing to main

**Enable approval gates** only if:
- Multiple people work on the codebase
- Someone else reviews your changes
- You want an explicit "pause and think" step

---

## Current Workflow (No Approval)

```
Push to main
    ↓
CI Tests (~2 min)
    ↓
Database Migrations: QA (~30s) → Production (~30s)
    ↓
Deployments: QA (~2 min) → Production (~1.5 min)
    ↓
Total: ~6 minutes from push to production
```

## With Approval Enabled

```
Push to main
    ↓
CI Tests (~2 min)
    ↓
Database Migrations: QA (~30s) → ⏸️ WAIT FOR APPROVAL → Production (~30s)
    ↓
Deployments: QA (~2 min) → ⏸️ WAIT FOR APPROVAL → Production (~1.5 min)
    ↓
Total: ~6 minutes + your approval time
```

---

## Verify Current Settings

Check your environment configuration:

```bash
gh api repos/divijshrivastava/portfolio-v2/environments/Production | jq '{name: .name, can_admins_bypass: .can_admins_bypass}'
```

Should show:
```json
{
  "name": "Production",
  "can_admins_bypass": true  ← This is why approvals are bypassed
}
```

---

**Questions?** See `APPROVAL-GATE-EXPLANATION.md` for more details.
