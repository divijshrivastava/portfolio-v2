#!/usr/bin/env node
/**
 * Apply specific migration to production database
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';

// Load environment variables
config({ path: '.env.local' });

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Usage: node apply-migration-to-prod.mjs <migration-file>');
  process.exit(1);
}

const prodSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_PROD || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY_PROD || ''
);

const sql = readFileSync(migrationFile, 'utf8');

console.log('🚀 Applying migration to production...');
console.log('File:', migrationFile);
console.log('');

const { data, error } = await prodSupabase.rpc('exec_sql', { sql_query: sql });

if (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}

console.log('✅ Migration applied successfully!');
console.log('');
console.log('Verify on: https://divij.tech/projects');
