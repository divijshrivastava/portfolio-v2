#!/usr/bin/env node
/**
 * Automated Data Sync: Production → QA
 * Syncs all table data from production to QA Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';

// Load environment variables
config({ path: '.env.local' });

// Production Supabase client
const prodSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_PROD || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY_PROD || ''
);

// QA Supabase client
const qaSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_QA || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY_QA || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const TABLES = ['profiles', 'projects', 'blogs', 'messages', 'resume'];

async function syncTable(tableName) {
  console.log(`\n📦 Syncing table: ${tableName}`);
  console.log('='.repeat(50));

  // Fetch all data from production
  console.log(`  📤 Fetching from production...`);
  const { data: prodData, error: fetchError } = await prodSupabase
    .from(tableName)
    .select('*');

  if (fetchError) {
    console.error(`  ❌ Error fetching from production:`, fetchError);
    return false;
  }

  console.log(`  ✅ Fetched ${prodData?.length || 0} rows from production`);

  // Clear QA table
  console.log(`  🗑️  Clearing QA table...`);
  const { error: deleteError } = await qaSupabase
    .from(tableName)
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (using impossible ID)

  if (deleteError) {
    console.error(`  ⚠️  Error clearing QA table:`, deleteError.message);
    // Continue anyway as table might be empty
  }

  if (!prodData || prodData.length === 0) {
    console.log(`  ℹ️  No data to sync for ${tableName}`);
    return true;
  }

  // Insert into QA
  console.log(`  📥 Inserting ${prodData.length} rows into QA...`);
  const { error: insertError } = await qaSupabase
    .from(tableName)
    .insert(prodData);

  if (insertError) {
    console.error(`  ❌ Error inserting to QA:`, insertError);
    return false;
  }

  console.log(`  ✅ Successfully synced ${prodData.length} rows`);
  return true;
}

async function main() {
  console.log('🔄 Automated Production → QA Data Sync');
  console.log('==========================================\n');

  // Verify credentials
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL_PROD) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL_PROD in .env.local');
    console.log('\nAdd to .env.local:');
    console.log('  NEXT_PUBLIC_SUPABASE_URL_PROD=https://xxx.supabase.co');
    console.log('  SUPABASE_SERVICE_ROLE_KEY_PROD=your_prod_service_key');
    console.log('  NEXT_PUBLIC_SUPABASE_URL_QA=https://yyy.supabase.co');
    console.log('  SUPABASE_SERVICE_ROLE_KEY_QA=your_qa_service_key');
    process.exit(1);
  }

  console.log('📋 Tables to sync:', TABLES.join(', '));
  console.log('');

  let allSuccess = true;

  for (const table of TABLES) {
    const success = await syncTable(table);
    if (!success) {
      allSuccess = false;
    }
  }

  console.log('\n' + '='.repeat(50));
  if (allSuccess) {
    console.log('✅ Data sync complete!');
    console.log('\n Next steps:');
    console.log('  1. Visit https://divij-qa.tech');
    console.log('  2. Verify all data is synced');
    console.log('  3. Test schema changes on QA');
  } else {
    console.log('⚠️  Data sync completed with errors');
    console.log('Please check the errors above and try again');
  }
}

main().catch(console.error);
