#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const qa = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_QA,
  process.env.SUPABASE_SERVICE_ROLE_KEY_QA
);

console.log('📊 Checking QA Database...\n');

// Check rate_limits table
console.log('=== Rate Limits Table ===');
const { data: rateLimits, error: rlError } = await qa
  .from('rate_limits')
  .select('*')
  .order('last_attempt_at', { ascending: false });

if (rlError) {
  console.error('Error:', rlError);
} else if (rateLimits && rateLimits.length > 0) {
  console.log(`Found ${rateLimits.length} rate limit records:\n`);
  rateLimits.forEach(rl => {
    console.log(`  IP: ${rl.ip_address}`);
    console.log(`  Action: ${rl.action_type}`);
    console.log(`  Attempts: ${rl.attempt_count}`);
    console.log(`  First: ${rl.first_attempt_at}`);
    console.log(`  Last: ${rl.last_attempt_at}`);
    console.log('');
  });
} else {
  console.log('❌ No rate limit records found\n');
}

// Check recent messages
console.log('=== Recent Messages (last 15) ===');
const { data: messages, error: msgError } = await qa
  .from('messages')
  .select('id, name, email, ip_address, created_at')
  .order('created_at', { ascending: false })
  .limit(15);

if (msgError) {
  console.error('Error:', msgError);
} else if (messages && messages.length > 0) {
  console.log(`Found ${messages.length} messages:\n`);
  messages.forEach((msg, idx) => {
    console.log(`${idx + 1}. ${msg.created_at} | ${msg.name} | IP: ${msg.ip_address || 'NULL'}`);
  });
} else {
  console.log('❌ No messages found\n');
}

process.exit(0);
