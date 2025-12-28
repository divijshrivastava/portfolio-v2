#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const qa = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_QA,
  process.env.SUPABASE_SERVICE_ROLE_KEY_QA
);

console.log('Checking QA admin status...\n');

// Get all profiles
const { data: profiles, error: profilesError } = await qa.from('profiles').select('*');

if (profilesError) {
  console.error('Error fetching profiles:', profilesError);
  process.exit(1);
}

console.log('Current QA Profiles:');
profiles.forEach(profile => {
  console.log(`  Email: ${profile.email}`);
  console.log(`  Admin: ${profile.is_admin ? '✅ YES' : '❌ NO'}`);
  console.log(`  ID: ${profile.id}`);
  console.log('');
});

// Find your profile
const yourEmail = 'divij.shrivastava@gmail.com';
const yourProfile = profiles.find(p => p.email === yourEmail);

if (!yourProfile) {
  console.log(`❌ Profile not found for ${yourEmail}`);
  console.log('Available emails:', profiles.map(p => p.email).join(', '));
  process.exit(1);
}

if (yourProfile.is_admin) {
  console.log(`✅ ${yourEmail} already has admin access!`);
  process.exit(0);
}

// Grant admin access
console.log(`Setting admin access for ${yourEmail}...\n`);

const { error: updateError } = await qa
  .from('profiles')
  .update({ is_admin: true })
  .eq('email', yourEmail);

if (updateError) {
  console.error('❌ Error granting admin access:', updateError);
  process.exit(1);
}

console.log('✅ Admin access granted!');
console.log('✅ You can now access the admin dashboard on divij-qa.tech');
