import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  // Track page visits (exclude admin, api, and auth routes)
  const path = request.nextUrl.pathname
  const shouldTrack = !path.startsWith('/admin') &&
                      !path.startsWith('/api') &&
                      !path.startsWith('/login') &&
                      !path.startsWith('/_next') &&
                      path !== '/favicon.ico'

  if (shouldTrack) {
    // Fire and forget - don't wait for tracking to complete
    trackVisit(request, path).catch(err => {
      console.error('Failed to track visit:', err)
    })
  }

  return response
}

async function trackVisit(request: NextRequest, path: string) {
  try {
    console.log('[Activity] Tracking visit to:', path)

    // Use service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get visitor info
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const visitorIp = forwardedFor?.split(',')[0].trim() || realIp || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    console.log('[Activity] Visitor IP:', visitorIp, 'User Agent:', userAgent.substring(0, 50))

    // Insert activity record
    const { data, error } = await supabase.from('user_activity').insert({
      page_visited: path,
      visitor_ip: visitorIp,
      user_agent: userAgent,
    })

    if (error) {
      console.error('[Activity] Database insert error:', error)
    } else {
      console.log('[Activity] Successfully tracked visit to:', path)
    }
  } catch (error) {
    console.error('[Activity] Tracking error:', error)
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
