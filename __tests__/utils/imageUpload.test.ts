import { validateImageFile, uploadImage, deleteImage, uploadMultipleImages, resizeImage } from '@/lib/utils/imageUpload'

// Mock global fetch
global.fetch = jest.fn()

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('imageUpload utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('validateImageFile', () => {
    it('should validate a correct image file', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }) // 1MB

      const result = validateImageFile(file)

      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject file larger than 5MB', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 }) // 6MB

      const result = validateImageFile(file)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('파일 크기는 5MB 이하로 업로드해주세요.')
    })

    it('should reject invalid file type', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      Object.defineProperty(file, 'size', { value: 1024 }) // 1KB

      const result = validateImageFile(file)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('JPG, PNG, WebP 파일만 업로드 가능합니다.')
    })

    it('should accept all valid image types', () => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

      validTypes.forEach(type => {
        const file = new File(['test'], `test.${type.split('/')[1]}`, { type })
        Object.defineProperty(file, 'size', { value: 1024 })

        const result = validateImageFile(file)
        expect(result.valid).toBe(true)
      })
    })
  })

  describe('uploadImage', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    Object.defineProperty(mockFile, 'size', { value: 1024 })
    const userId = 'test-user-123'

    it('should upload image successfully', async () => {
      const mockUrl = '/uploads/posts/test-user-123-1234567890-abc123.jpg'
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          success: true,
          url: mockUrl,
          fileName: 'test-user-123-1234567890-abc123.jpg'
        })
      }

      mockFetch.mockResolvedValue(mockResponse as any)

      const result = await uploadImage(mockFile, userId)

      expect(result.success).toBe(true)
      expect(result.url).toBe(mockUrl)
      expect(result.error).toBeUndefined()
      expect(mockFetch).toHaveBeenCalledWith('/api/upload', {
        method: 'POST',
        body: expect.any(FormData)
      })
    })

    it('should fail when file validation fails', async () => {
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })

      const result = await uploadImage(invalidFile, userId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('JPG, PNG, WebP 파일만 업로드 가능합니다.')
      expect(result.url).toBeUndefined()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should handle upload errors', async () => {
      const mockResponse = {
        ok: false,
        json: () => Promise.resolve({
          success: false,
          error: 'Upload failed'
        })
      }

      mockFetch.mockResolvedValue(mockResponse as any)

      const result = await uploadImage(mockFile, userId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Upload failed')
      expect(result.url).toBeUndefined()
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const result = await uploadImage(mockFile, userId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('이미지 업로드에 실패했습니다.')
    })
  })

  describe('deleteImage', () => {
    const imageUrl = '/uploads/posts/test-image.jpg'

    it('should delete image successfully', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          success: true,
          message: '파일이 성공적으로 삭제되었습니다.'
        })
      }

      mockFetch.mockResolvedValue(mockResponse as any)

      const result = await deleteImage(imageUrl)

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/upload?url=${encodeURIComponent(imageUrl)}`,
        { method: 'DELETE' }
      )
    })

    it('should handle delete errors', async () => {
      const mockResponse = {
        ok: false,
        json: () => Promise.resolve({
          success: false,
          error: 'File not found'
        })
      }

      mockFetch.mockResolvedValue(mockResponse as any)

      const result = await deleteImage(imageUrl)

      expect(result.success).toBe(false)
      expect(result.error).toBe('File not found')
    })
  })

  describe('uploadMultipleImages', () => {
    const mockFiles = [
      new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
      new File(['test2'], 'test2.png', { type: 'image/png' })
    ]
    mockFiles.forEach(file => {
      Object.defineProperty(file, 'size', { value: 1024 })
    })
    const userId = 'test-user-123'

    it('should upload multiple images successfully', async () => {
      const mockUrls = [
        '/uploads/posts/test-user-123-1234567890-abc123.jpg',
        '/uploads/posts/test-user-123-1234567890-def456.png'
      ]

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, url: mockUrls[0] })
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, url: mockUrls[1] })
        } as any)

      const result = await uploadMultipleImages(mockFiles, userId)

      expect(result.success).toBe(true)
      expect(result.urls).toEqual(mockUrls)
      expect(result.error).toBeUndefined()
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should handle partial upload failures', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, url: '/uploads/posts/image1.jpg' })
        } as any)
        .mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ success: false, error: 'Upload failed' })
        } as any)

      const result = await uploadMultipleImages(mockFiles, userId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('1개 이미지 업로드에 실패했습니다.')
      expect(result.urls).toBeUndefined()
    })

    it('should handle complete upload failure', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ success: false, error: 'Upload failed' })
        } as any)
        .mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ success: false, error: 'Upload failed' })
        } as any)

      const result = await uploadMultipleImages(mockFiles, userId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('2개 이미지 업로드에 실패했습니다.')
    })

    it('should handle validation failures in multiple files', async () => {
      const invalidFiles = [
        new File(['test1'], 'test1.txt', { type: 'text/plain' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' })
      ]
      Object.defineProperty(invalidFiles[1], 'size', { value: 1024 })

      const result = await uploadMultipleImages(invalidFiles, userId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('2개 이미지 업로드에 실패했습니다.')
    })
  })

  describe('resizeImage', () => {
    let mockCanvas: any
    let mockContext: any
    let mockImage: any

    beforeEach(() => {
      mockContext = {
        drawImage: jest.fn()
      }

      mockCanvas = {
        getContext: jest.fn().mockReturnValue(mockContext),
        toBlob: jest.fn(),
        width: 0,
        height: 0
      }

      mockImage = {
        onload: null as any,
        src: '',
        width: 0,
        height: 0
      }

      jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'canvas') return mockCanvas
        return document.createElement(tagName)
      })

      global.Image = jest.fn().mockImplementation(() => mockImage)
      global.URL.createObjectURL = jest.fn().mockReturnValue('blob:test-url')
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should resize image when width exceeds maxWidth', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const blob = new Blob(['resized'], { type: 'image/jpeg' })

      mockCanvas.toBlob.mockImplementation((callback: any) => {
        callback(blob)
      })

      const resizePromise = resizeImage(file, 1920, 1080, 0.8)

      // Simulate image load
      mockImage.width = 2560
      mockImage.height = 1440
      mockImage.onload()

      const result = await resizePromise

      expect(mockCanvas.width).toBe(1920)
      expect(mockCanvas.height).toBe(1080)
      expect(mockContext.drawImage).toHaveBeenCalledWith(mockImage, 0, 0, 1920, 1080)
      expect(result.name).toBe('test.jpg')
      expect(result.type).toBe('image/jpeg')
    })

    it('should resize image when height exceeds maxHeight', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const blob = new Blob(['resized'], { type: 'image/jpeg' })

      mockCanvas.toBlob.mockImplementation((callback: any) => {
        callback(blob)
      })

      const resizePromise = resizeImage(file, 1920, 1080, 0.8)

      // Simulate image load with height > width scenario
      mockImage.width = 720
      mockImage.height = 1280
      mockImage.onload()

      const result = await resizePromise

      expect(mockCanvas.width).toBe(607.5) // (720 * 1080 / 1280)
      expect(mockCanvas.height).toBe(1080)
      expect(mockContext.drawImage).toHaveBeenCalledWith(mockImage, 0, 0, 607.5, 1080)
    })

    it('should not resize image if dimensions are within limits', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const blob = new Blob(['resized'], { type: 'image/jpeg' })

      mockCanvas.toBlob.mockImplementation((callback: any) => {
        callback(blob)
      })

      const resizePromise = resizeImage(file, 1920, 1080, 0.8)

      // Simulate image load with small dimensions
      mockImage.width = 800
      mockImage.height = 600
      mockImage.onload()

      const result = await resizePromise

      expect(mockCanvas.width).toBe(800)
      expect(mockCanvas.height).toBe(600)
      expect(mockContext.drawImage).toHaveBeenCalledWith(mockImage, 0, 0, 800, 600)
    })

    it('should return original file if blob creation fails', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      mockCanvas.toBlob.mockImplementation((callback: any) => {
        callback(null)
      })

      const resizePromise = resizeImage(file, 1920, 1080, 0.8)

      mockImage.width = 800
      mockImage.height = 600
      mockImage.onload()

      const result = await resizePromise

      expect(result).toBe(file)
    })

    it('should use custom quality and dimensions', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const blob = new Blob(['resized'], { type: 'image/jpeg' })

      mockCanvas.toBlob.mockImplementation((callback: any, type: any, quality: any) => {
        expect(type).toBe('image/jpeg')
        expect(quality).toBe(0.9)
        callback(blob)
      })

      const resizePromise = resizeImage(file, 1024, 768, 0.9)

      mockImage.width = 2048
      mockImage.height = 1536
      mockImage.onload()

      await resizePromise

      expect(mockCanvas.width).toBe(1024)
      expect(mockCanvas.height).toBe(768)
    })
  })
})