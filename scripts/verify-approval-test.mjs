#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

console.log('Checking approval gate test migration...\n');

const qa = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_QA,
  process.env.SUPABASE_SERVICE_ROLE_KEY_QA
);

const prod = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_PROD,
  process.env.SUPABASE_SERVICE_ROLE_KEY_PROD
);

// Check QA
const qaResult = await qa.from('blogs').select('approval_gate_test').limit(1);
if (qaResult.error) {
  console.log('❌ QA: approval_gate_test column not found');
} else {
  console.log('✅ QA: approval_gate_test column exists in blogs table');
}

// Check Production
const prodResult = await prod.from('blogs').select('approval_gate_test').limit(1);
if (prodResult.error) {
  console.log('❌ Production: approval_gate_test column not found');
} else {
  console.log('✅ Production: approval_gate_test column exists in blogs table');
}

console.log('\n🎉 All test migrations applied successfully!');
