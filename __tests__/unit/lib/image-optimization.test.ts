import { describe, it, expect, beforeEach, vi } from 'vitest'
import { optimizeImageForOG, downloadImage } from '@/lib/utils/image-optimization'

// Mock sharp
const mockResize = vi.fn().mockReturnThis()
const mockWebp = vi.fn().mockReturnThis()
const mockPng = vi.fn().mockReturnThis()
const mockToBuffer = vi.fn().mockResolvedValue(Buffer.from('optimized-image'))

vi.mock('sharp', () => {
  return {
    default: vi.fn(() => ({
      resize: mockResize,
      webp: mockWebp,
      png: mockPng,
      toBuffer: mockToBuffer,
    })),
  }
})

// Mock fetch
global.fetch = vi.fn()

describe('image-optimization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('optimizeImageForOG', () => {
    it('should optimize image to 1200x630 WebP format by default', async () => {
      const inputBuffer = Buffer.from('test-image')
      mockToBuffer.mockResolvedValueOnce(Buffer.from('optimized-webp'))

      const result = await optimizeImageForOG(inputBuffer)

      expect(mockResize).toHaveBeenCalledWith(1200, 630, {
        fit: 'cover',
        position: 'center',
      })
      expect(mockWebp).toHaveBeenCalledWith({ quality: 85 })
      expect(result).toBeInstanceOf(Buffer)
    })

    it('should optimize image to PNG format when specified', async () => {
      const inputBuffer = Buffer.from('test-image')
      mockToBuffer.mockResolvedValueOnce(Buffer.from('optimized-png'))

      const result = await optimizeImageForOG(inputBuffer, 'png')

      expect(mockResize).toHaveBeenCalledWith(1200, 630, {
        fit: 'cover',
        position: 'center',
      })
      expect(mockPng).toHaveBeenCalledWith({ quality: 90 })
      expect(result).toBeInstanceOf(Buffer)
    })

    it('should use WebP format by default', async () => {
      const inputBuffer = Buffer.from('test-image')
      mockToBuffer.mockResolvedValueOnce(Buffer.from('optimized-webp'))

      const result = await optimizeImageForOG(inputBuffer, 'webp')

      expect(mockWebp).toHaveBeenCalledWith({ quality: 85 })
      expect(result).toBeInstanceOf(Buffer)
    })
  })

  describe('downloadImage', () => {
    it('should download image from URL and return buffer', async () => {
      const mockArrayBuffer = new ArrayBuffer(8)
      const mockResponse = {
        ok: true,
        arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer),
      }

      vi.mocked(fetch).mockResolvedValue(mockResponse as any)

      const result = await downloadImage('https://example.com/image.jpg')

      expect(fetch).toHaveBeenCalledWith('https://example.com/image.jpg')
      expect(result).toBeInstanceOf(Buffer)
    })

    it('should throw error when download fails', async () => {
      const mockResponse = {
        ok: false,
        statusText: 'Not Found',
      }

      vi.mocked(fetch).mockResolvedValue(mockResponse as any)

      await expect(downloadImage('https://example.com/missing.jpg')).rejects.toThrow(
        'Failed to download image: Not Found'
      )
    })

    it('should handle network errors', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

      await expect(downloadImage('https://example.com/image.jpg')).rejects.toThrow('Network error')
    })
  })
})

