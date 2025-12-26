import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/blogs/create/route'
import { createAdminClient } from '@/lib/supabase/admin'

// Mock the Supabase admin client
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

describe('POST /api/blogs/create', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a blog with valid data', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: '123',
          title: 'Test Blog',
          slug: 'test-blog',
          status: 'draft',
          content: '<p>Test content</p>',
        },
        error: null,
      }),
    }

    vi.mocked(createAdminClient).mockReturnValue(mockSupabase as any)

    const request = new NextRequest('http://localhost:3000/api/blogs/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Blog',
        slug: 'test-blog',
        content: '<p>Test content</p>',
        status: 'draft',
        read_time: 5,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.data).toHaveProperty('id')
    expect(data.data.title).toBe('Test Blog')
    expect(mockSupabase.from).toHaveBeenCalledWith('blogs')
    expect(mockSupabase.insert).toHaveBeenCalled()
  })

  it('should return 400 on Supabase error', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Duplicate slug', code: '23505' },
      }),
    }

    vi.mocked(createAdminClient).mockReturnValue(mockSupabase as any)

    const request = new NextRequest('http://localhost:3000/api/blogs/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test',
        slug: 'duplicate',
        content: '<p>Test</p>',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Duplicate slug')
  })

  it('should return 500 on unexpected error', async () => {
    vi.mocked(createAdminClient).mockImplementation(() => {
      throw new Error('Database connection failed')
    })

    const request = new NextRequest('http://localhost:3000/api/blogs/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test',
        slug: 'test',
        content: '<p>Test</p>',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toContain('Database connection failed')
  })
})
