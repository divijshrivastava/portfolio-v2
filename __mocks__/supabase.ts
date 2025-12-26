import { vi } from 'vitest'

// Mock Supabase client for testing
export const createMockSupabaseClient = () => {
  const mockFrom = vi.fn().mockReturnThis()
  const mockSelect = vi.fn().mockReturnThis()
  const mockInsert = vi.fn().mockReturnThis()
  const mockUpdate = vi.fn().mockReturnThis()
  const mockDelete = vi.fn().mockReturnThis()
  const mockEq = vi.fn().mockReturnThis()
  const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null })
  const mockOrder = vi.fn().mockReturnThis()
  const mockLimit = vi.fn().mockReturnThis()

  return {
    from: mockFrom,
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    eq: mockEq,
    single: mockSingle,
    order: mockOrder,
    limit: mockLimit,
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  }
}

// Mock admin client
export const mockAdminClient = createMockSupabaseClient()

// Mock server client
export const mockServerClient = createMockSupabaseClient()

// Mock browser client
export const mockBrowserClient = createMockSupabaseClient()
