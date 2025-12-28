import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    // Test if admin client can be created
    const adminClient = createAdminClient();

    // Try to query rate_limits table
    const { data, error } = await adminClient
      .from('rate_limits')
      .select('count')
      .limit(1);

    return NextResponse.json({
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 40) + '...',
      adminClientWorks: !error,
      rateLimitsTableAccessible: !error,
      error: error ? error.message : null,
      dataReceived: !!data,
    });
  } catch (err: any) {
    return NextResponse.json({
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      error: err.message,
      adminClientWorks: false,
    });
  }
}
