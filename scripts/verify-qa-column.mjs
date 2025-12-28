#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const qa = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_QA,
  process.env.SUPABASE_SERVICE_ROLE_KEY_QA
);

const { data, error } = await qa.from('projects').select('github_actions_test').limit(1);

if (error) {
  console.log('❌ Migration verification failed:', error.message);
  process.exit(1);
} else {
  console.log('✅ Migration applied successfully to QA!');
  console.log('✅ Column "github_actions_test" exists in projects table');
}
