#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const prod = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_PROD,
  process.env.SUPABASE_SERVICE_ROLE_KEY_PROD
);

const { data, error } = await prod.from('projects').select('github_actions_test').limit(1);

if (error) {
  console.log('❌ Production migration verification failed:', error.message);
  process.exit(1);
} else {
  console.log('✅ Migration applied successfully to PRODUCTION!');
  console.log('✅ Column "github_actions_test" exists in projects table');
}
