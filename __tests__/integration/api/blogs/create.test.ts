import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/blogs/create/route'
import { createAdminClient } from '@/lib/supabase/admin'
import { optimizeImageForOG, downloadImage } from '@/lib/utils/image-optimization'

// Mock the Supabase admin client
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

// Mock image optimization utilities
vi.mock('@/lib/utils/image-optimization', () => ({
  optimizeImageForOG: vi.fn(),
  downloadImage: vi.fn(),
}))

// Mock Supabase JS client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
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

  it('should skip image optimization for draft status', async () => {
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
        cover_image_url: 'https://example.com/image.jpg',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(downloadImage).not.toHaveBeenCalled()
    expect(optimizeImageForOG).not.toHaveBeenCalled()
  })

  it('should skip image optimization when no cover image', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: '123',
          title: 'Test Blog',
          slug: 'test-blog',
          status: 'published',
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
        status: 'published',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(downloadImage).not.toHaveBeenCalled()
    expect(optimizeImageForOG).not.toHaveBeenCalled()
  })

  it('should optimize image and include og_image_url when publishing with image', async () => {
    const mockStorage = {
      from: vi.fn().mockReturnThis(),
      upload: vi.fn().mockResolvedValue({ error: null }),
      getPublicUrl: vi.fn().mockReturnValue({
        data: { publicUrl: 'https://project.supabase.co/storage/v1/object/public/blog-images/test-og.webp' },
      }),
    }

    const mockServiceClient = {
      storage: mockStorage,
    }

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: '123',
          title: 'Test Blog',
          slug: 'test-blog',
          status: 'published',
          content: '<p>Test content</p>',
          og_image_url: 'https://project.supabase.co/storage/v1/object/public/blog-images/test-og.webp',
        },
        error: null,
      }),
    }

    vi.mocked(createAdminClient).mockReturnValue(mockSupabase as any)
    vi.mocked(downloadImage).mockResolvedValue(Buffer.from('image-data'))
    vi.mocked(optimizeImageForOG).mockResolvedValue(Buffer.from('optimized-image'))
    
    // Mock the dynamic import
    vi.doMock('@supabase/supabase-js', () => ({
      createClient: vi.fn(() => mockServiceClient),
    }))

    const request = new NextRequest('http://localhost:3000/api/blogs/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Blog',
        slug: 'test-blog',
        content: '<p>Test content</p>',
        status: 'published',
        cover_image_url: 'https://project.supabase.co/storage/v1/object/public/blog-images/test.jpg',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(downloadImage).toHaveBeenCalledWith('https://project.supabase.co/storage/v1/object/public/blog-images/test.jpg')
    expect(optimizeImageForOG).toHaveBeenCalledWith(Buffer.from('image-data'), 'webp')
    // Verify og_image_url was included in the insert
    const insertCall = vi.mocked(mockSupabase.insert).mock.calls[0]?.[0]
    expect(insertCall).toHaveProperty('og_image_url')
  })

  it('should handle image optimization errors gracefully', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: '123',
          title: 'Test Blog',
          slug: 'test-blog',
          status: 'published',
          content: '<p>Test content</p>',
        },
        error: null,
      }),
    }

    vi.mocked(createAdminClient).mockReturnValue(mockSupabase as any)
    vi.mocked(downloadImage).mockRejectedValue(new Error('Download failed'))

    const request = new NextRequest('http://localhost:3000/api/blogs/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Blog',
        slug: 'test-blog',
        content: '<p>Test content</p>',
        status: 'published',
        cover_image_url: 'https://project.supabase.co/storage/v1/object/public/blog-images/test.jpg',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    // Should still create blog even if optimization fails
    expect(response.status).toBe(201)
    expect(data.data).toHaveProperty('id')
  })

  it('should skip optimization when URL does not match Supabase storage pattern', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: '123',
          title: 'Test Blog',
          slug: 'test-blog',
          status: 'published',
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
        status: 'published',
        cover_image_url: 'https://external-site.com/image.jpg',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(downloadImage).not.toHaveBeenCalled()
    expect(optimizeImageForOG).not.toHaveBeenCalled()
  })
})
