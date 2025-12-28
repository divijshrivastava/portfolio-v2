# Database Migration Tools Comparison

## Overview

This document compares different database migration tools for managing schema changes in your QA → Production workflow.

---

## Option 1: Supabase CLI (Recommended) ⭐

**Best for:** Supabase projects, simple workflows, solo developers

### How It Works
- Migrations stored in `supabase/migrations/` folder
- Tracks applied migrations in `supabase_migrations.schema_migrations` table
- Generate migrations from database changes: `supabase db diff`
- Apply migrations: `supabase db push`

### Setup
```bash
# Install
brew install supabase/tap/supabase

# Initialize
supabase init

# Link to database
supabase link --project-ref YOUR_PROJECT_REF

# Generate migration from changes
supabase db diff -f migration_name --linked

# Apply to database
supabase db push --linked
```

### Example Migration File
```sql
-- supabase/migrations/20251228123456_add_blog_category.sql
ALTER TABLE public.blogs
ADD COLUMN category TEXT DEFAULT 'general';

CREATE INDEX blogs_category_idx ON public.blogs(category);
```

### Pros
- ✅ Native Supabase integration
- ✅ Simple SQL-based migrations
- ✅ Auto-generates migrations from schema diffs
- ✅ Git-based version control
- ✅ No additional dependencies
- ✅ Free and open source
- ✅ Easy to learn (just SQL)
- ✅ Automatic migration tracking

### Cons
- ❌ No built-in automatic rollback (must create reverse migration)
- ❌ Only works with PostgreSQL/Supabase
- ❌ Basic features compared to enterprise tools

### Cost: Free

---

## Option 2: Liquibase

**Best for:** Enterprise teams, multi-database support, complex workflows

### How It Works
- Changesets defined in XML/YAML/JSON/SQL
- Tracks changes in `DATABASECHANGELOG` table
- Supports preconditions, contexts, labels
- Built-in rollback support

### Setup
```bash
# Requires Java
java -version

# Install Liquibase
brew install liquibase

# Create liquibase.properties
cat > liquibase.properties <<EOF
url=jdbc:postgresql://db.xxxxx.supabase.co:5432/postgres
username=postgres
password=YOUR_PASSWORD
changeLogFile=changelog.yaml
EOF
```

### Example Changeset
```yaml
# changelog.yaml
databaseChangeLog:
  - changeSet:
      id: 001-add-blog-category
      author: divij
      changes:
        - addColumn:
            tableName: blogs
            columns:
              - column:
                  name: category
                  type: varchar(50)
                  defaultValue: general
        - createIndex:
            tableName: blogs
            indexName: blogs_category_idx
            columns:
              - column:
                  name: category
      rollback:
        - dropIndex:
            indexName: blogs_category_idx
        - dropColumn:
            tableName: blogs
            columnName: category
```

### Apply Migrations
```bash
# Apply changes
liquibase update

# Rollback last changeset
liquibase rollback-count 1

# Generate changelog from existing database
liquibase generate-changelog

# Preview SQL without applying
liquibase update-sql
```

### Pros
- ✅ Industry-standard tool
- ✅ Built-in rollback support
- ✅ Multi-database support (PostgreSQL, MySQL, Oracle, etc.)
- ✅ Advanced features (preconditions, contexts, labels)
- ✅ Can generate changesets from schema diffs
- ✅ Good for teams and enterprises
- ✅ Extensive documentation
- ✅ IDE support (IntelliJ, VS Code plugins)

### Cons
- ❌ Requires Java runtime
- ❌ Steeper learning curve (XML/YAML syntax)
- ❌ More complex setup
- ❌ Overhead for simple projects
- ❌ Need to manage liquibase.properties per environment

### Cost: Free (open source) or Enterprise ($$$)

---

## Option 3: Flyway

**Best for:** Java/Spring projects, simpler than Liquibase

### How It Works
- SQL-based migrations (simpler than Liquibase)
- Version-based naming: `V1__description.sql`, `V2__another_change.sql`
- Tracks in `flyway_schema_history` table
- Java-based tool

### Setup
```bash
# Install
brew install flyway

# Create flyway.conf
cat > flyway.conf <<EOF
flyway.url=jdbc:postgresql://db.xxxxx.supabase.co:5432/postgres
flyway.user=postgres
flyway.password=YOUR_PASSWORD
flyway.locations=filesystem:./migrations
EOF
```

### Example Migration
```sql
-- migrations/V1__add_blog_category.sql
ALTER TABLE public.blogs
ADD COLUMN category TEXT DEFAULT 'general';

CREATE INDEX blogs_category_idx ON public.blogs(category);
```

### Apply Migrations
```bash
flyway migrate
flyway info
flyway validate
```

### Pros
- ✅ Simpler than Liquibase (pure SQL)
- ✅ Version-based approach is intuitive
- ✅ Good documentation
- ✅ Multi-database support
- ✅ Popular in Java/Spring ecosystem

### Cons
- ❌ Requires Java runtime
- ❌ No automatic schema diff generation
- ❌ Rollback only in paid version
- ❌ Less flexible than Liquibase

### Cost: Free (Community) or $$$-$$$$ (Teams/Enterprise for rollback)

---

## Option 4: node-pg-migrate

**Best for:** Node.js projects, JavaScript/TypeScript developers

### How It Works
- JavaScript/TypeScript-based migrations
- NPM package for Node.js
- Programmatic migration creation

### Setup
```bash
npm install node-pg-migrate

# Create migration
npx node-pg-migrate create add-blog-category
```

### Example Migration
```javascript
// migrations/1703779200000_add-blog-category.js
exports.up = (pgm) => {
  pgm.addColumn('blogs', {
    category: {
      type: 'text',
      default: 'general',
    },
  });

  pgm.createIndex('blogs', 'category', {
    name: 'blogs_category_idx',
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('blogs', 'category');
  pgm.dropColumn('blogs', 'category');
};
```

### Apply Migrations
```bash
DATABASE_URL=postgresql://... npx node-pg-migrate up
```

### Pros
- ✅ Native Node.js/JavaScript
- ✅ No Java required
- ✅ TypeScript support
- ✅ Programmatic migrations
- ✅ Built-in rollback (up/down)

### Cons
- ❌ Requires writing JavaScript (not pure SQL)
- ❌ Smaller community than Liquibase/Flyway
- ❌ No automatic schema diff generation
- ❌ Only PostgreSQL

### Cost: Free

---

## Option 5: Prisma Migrate

**Best for:** Projects using Prisma ORM

### How It Works
- Schema defined in `schema.prisma` file
- Auto-generates migrations from schema changes
- TypeScript-first approach

### Setup
```bash
npm install prisma

# Initialize
npx prisma init

# Create migration
npx prisma migrate dev --name add-blog-category
```

### Example Schema
```prisma
// schema.prisma
model Blog {
  id          String   @id @default(uuid())
  title       String
  slug        String   @unique
  category    String   @default("general")  // New field
  created_at  DateTime @default(now())

  @@index([category])
}
```

### Apply Migrations
```bash
# Development (creates migration)
npx prisma migrate dev

# Production (applies migrations)
npx prisma migrate deploy
```

### Pros
- ✅ Auto-generates migrations from schema
- ✅ Type-safe database access
- ✅ Great developer experience
- ✅ Built-in Prisma Studio (DB GUI)
- ✅ Excellent for TypeScript projects

### Cons
- ❌ Requires using Prisma ORM (migration from existing code)
- ❌ Schema in Prisma format (not pure SQL)
- ❌ All-or-nothing (must use Prisma for DB access)
- ❌ Learning curve for Prisma

### Cost: Free

---

## Option 6: Custom Tracking Table (Lightweight)

**Best for:** Very simple projects, learning purposes

### How It Works
- Manually track migrations in a custom table
- Simple SQL scripts in version control
- No external tools

### Setup
```sql
-- Create tracking table
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  migration_name TEXT UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  applied_by TEXT,
  checksum TEXT,
  notes TEXT
);
```

### Example Workflow
```bash
# 1. Create migration file
# migrations/002_add_blog_category.sql

# 2. Apply manually via Supabase SQL Editor

# 3. Track it
INSERT INTO schema_migrations (migration_name, applied_by, notes)
VALUES ('002_add_blog_category.sql', 'divij', 'Added category to blogs');
```

### Pros
- ✅ No dependencies
- ✅ Full control
- ✅ Simple to understand
- ✅ Works with any database

### Cons
- ❌ Completely manual
- ❌ No automation
- ❌ Error-prone
- ❌ No rollback support
- ❌ Reinventing the wheel

### Cost: Free

---

## Comparison Table

| Feature | Supabase CLI | Liquibase | Flyway | node-pg-migrate | Prisma | Custom Table |
|---------|-------------|-----------|--------|-----------------|--------|--------------|
| **Language** | SQL | XML/YAML/SQL | SQL | JavaScript | Prisma Schema | SQL |
| **Runtime** | Go (CLI) | Java | Java | Node.js | Node.js | None |
| **Auto-diff** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Rollback** | Manual | ✅ Built-in | ❌ Free | ✅ | ✅ | ❌ |
| **Tracking** | ✅ | ✅ | ✅ | ✅ | ✅ | Manual |
| **Multi-DB** | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Learning Curve** | Low | Medium | Low | Medium | Medium | Low |
| **Setup Time** | 5 min | 30 min | 20 min | 15 min | 20 min | 5 min |
| **Best For** | Supabase | Enterprise | Java projects | Node.js | Prisma users | Learning |
| **Cost** | Free | Free/$$$ | Free/$$$ | Free | Free | Free |

---

## Recommendation for Your Project

### Use **Supabase CLI** because:

1. **Already using Supabase** - Native integration, no friction
2. **Simple workflow** - Just SQL, no XML/YAML
3. **Auto-diff support** - `supabase db diff` generates migrations automatically
4. **No additional runtime** - Just install CLI
5. **Git-based** - Version control built-in
6. **Free** - No cost
7. **Perfect for solo projects** - Not overkill

### When to consider Liquibase:

- Working on enterprise project with compliance requirements
- Need to support multiple database types (MySQL, Oracle, etc.)
- Large team needs advanced change management
- Require built-in rollback with audit trail
- Already using Java stack

### When to consider Prisma:

- Starting fresh project with TypeScript
- Want type-safe database access
- Willing to use Prisma ORM for all DB operations
- Value auto-generated migrations from schema

---

## Getting Started with Supabase CLI

```bash
# 1. Install
brew install supabase/tap/supabase

# 2. Initialize
cd /Users/divij/code/ai/divij-tech/portfolio-v2
supabase init

# 3. Link to QA
supabase link --project-ref YOUR_QA_PROJECT_REF

# 4. Make changes in QA Supabase, then generate migration
supabase db diff -f add_blog_category --linked

# 5. Review and commit
git add supabase/migrations/
git commit -m "Add blog category"

# 6. Apply to production
supabase link --project-ref YOUR_PROD_PROJECT_REF
supabase db push --linked
```

See `SUPABASE-MIGRATIONS.md` for complete guide.

---

## Resources

### Supabase CLI
- [Docs](https://supabase.com/docs/guides/cli)
- [Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)

### Liquibase
- [Website](https://www.liquibase.org/)
- [PostgreSQL Tutorial](https://docs.liquibase.com/start/tutorials/postgresql.html)

### Flyway
- [Website](https://flywaydb.org/)
- [Documentation](https://flywaydb.org/documentation/)

### node-pg-migrate
- [GitHub](https://github.com/salsita/node-pg-migrate)
- [Documentation](https://salsita.github.io/node-pg-migrate/)

### Prisma
- [Website](https://www.prisma.io/)
- [Migrate Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
