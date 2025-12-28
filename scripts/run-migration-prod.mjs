#!/usr/bin/env node
/**
 * Run migration SQL on production database
 */

import { readFileSync } from 'fs';
import { config } from 'dotenv';

config({ path: '.env.local' });

const migrationFile = 'supabase/migrations/20251228064834_add_project_view_count.sql';
const sql = readFileSync(migrationFile, 'utf8');

console.log('🚀 Running migration on production');
console.log('File:', migrationFile);
console.log('');

// Use fetch to call Supabase's SQL editor API
const response = await fetch(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL_PROD}/rest/v1/rpc/exec`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY_PROD,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY_PROD}`
    },
    body: JSON.stringify({ query: sql })
  }
);

if (!response.ok) {
  console.error('❌ Failed to run migration');
  console.error('Status:', response.status);
  console.error('Response:', await response.text());
  process.exit(1);
}

console.log('✅ Migration applied!');
console.log('');
console.log('Verify: https://divij.tech/projects');
