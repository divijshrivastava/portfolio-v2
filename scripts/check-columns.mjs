#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const qa = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_QA,
  process.env.SUPABASE_SERVICE_ROLE_KEY_QA
);

const prod = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_PROD,
  process.env.SUPABASE_SERVICE_ROLE_KEY_PROD
);

console.log('Checking QA database...');
const qa1 = await qa.from('projects').select('github_actions_test').limit(1);
console.log('QA projects.github_actions_test:', qa1.error ? `❌ ${qa1.error.message}` : '✅ Column exists (should be removed!)');

const qa2 = await qa.from('blogs').select('approval_gate_test').limit(1);
console.log('QA blogs.approval_gate_test:', qa2.error ? `❌ ${qa2.error.message}` : '✅ Column exists (should be removed!)');

console.log('\nChecking Production database...');
const prod1 = await prod.from('projects').select('github_actions_test').limit(1);
console.log('Prod projects.github_actions_test:', prod1.error ? `❌ ${prod1.error.message}` : '✅ Column exists (should be removed!)');

const prod2 = await prod.from('blogs').select('approval_gate_test').limit(1);
console.log('Prod blogs.approval_gate_test:', prod2.error ? `❌ ${prod2.error.message}` : '✅ Column exists (should be removed!)');
