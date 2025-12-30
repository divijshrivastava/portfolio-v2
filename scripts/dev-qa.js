// Quick script to start dev with QA database
// Usage: node scripts/dev-qa.js

const { spawn } = require('child_process');
require('dotenv').config({ path: '.env.local' });

const qaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_QA;
const qaAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_QA;
const qaServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY_QA;

if (!qaUrl || !qaAnonKey) {
  console.error('❌ QA environment variables not found in .env.local');
  console.error('Please ensure you have:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL_QA');
  console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY_QA');
  console.error('  SUPABASE_SERVICE_ROLE_KEY_QA');
  process.exit(1);
}

console.log('🔧 Starting dev server with QA database...');
console.log(`   URL: ${qaUrl.substring(0, 40)}...`);
console.log('');

// Set environment variables and start Next.js
process.env.NEXT_PUBLIC_SUPABASE_URL = qaUrl;
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = qaAnonKey;
process.env.SUPABASE_SERVICE_ROLE_KEY = qaServiceKey;

const dev = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
});

dev.on('close', (code) => {
  process.exit(code);
});
