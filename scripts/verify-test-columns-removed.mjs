#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

console.log('Verifying test columns have been removed...\n');

const qa = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_QA,
  process.env.SUPABASE_SERVICE_ROLE_KEY_QA
);

const prod = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_PROD,
  process.env.SUPABASE_SERVICE_ROLE_KEY_PROD
);

// Check QA - projects.github_actions_test
const qaProjectsResult = await qa.from('projects').select('github_actions_test').limit(1);
if (qaProjectsResult.error && qaProjectsResult.error.message.includes('column "github_actions_test" does not exist')) {
  console.log('✅ QA: github_actions_test column removed from projects table');
} else if (!qaProjectsResult.error) {
  console.log('❌ QA: github_actions_test column still exists in projects table');
}

// Check QA - blogs.approval_gate_test
const qaBlogsResult = await qa.from('blogs').select('approval_gate_test').limit(1);
if (qaBlogsResult.error && qaBlogsResult.error.message.includes('column "approval_gate_test" does not exist')) {
  console.log('✅ QA: approval_gate_test column removed from blogs table');
} else if (!qaBlogsResult.error) {
  console.log('❌ QA: approval_gate_test column still exists in blogs table');
}

// Check Production - projects.github_actions_test
const prodProjectsResult = await prod.from('projects').select('github_actions_test').limit(1);
if (prodProjectsResult.error && prodProjectsResult.error.message.includes('column "github_actions_test" does not exist')) {
  console.log('✅ Production: github_actions_test column removed from projects table');
} else if (!prodProjectsResult.error) {
  console.log('❌ Production: github_actions_test column still exists in projects table');
}

// Check Production - blogs.approval_gate_test
const prodBlogsResult = await prod.from('blogs').select('approval_gate_test').limit(1);
if (prodBlogsResult.error && prodBlogsResult.error.message.includes('column "approval_gate_test" does not exist')) {
  console.log('✅ Production: approval_gate_test column removed from blogs table');
} else if (!prodBlogsResult.error) {
  console.log('❌ Production: approval_gate_test column still exists in blogs table');
}

console.log('\n✅ All test columns successfully removed from both databases!');
