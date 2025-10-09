/**
 * Firebase Storage 프로필 이미지 관리 테스트
 */

import {
  uploadProfileImage,
  deleteProfileImage,
  replaceProfileImage
} from '@/lib/firebase/storage'

// Firebase Storage 모킹
jest.mock('@/lib/firebase', () => ({
  storage: {
    ref: jest.fn()
  }
}))

jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytesResumable: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: jest.fn()
}))

// browser-image-compression 모킹
jest.mock('browser-image-compression', () => {
  return jest.fn((file: File) => {
    // 압축된 파일을 시뮬레이션
    const compressedFile = new File([file], file.name, {
      type: 'image/jpeg',
      lastModified: Date.now()
    })
    // 압축 후 크기가 줄어들었다고 가정
    Object.defineProperty(compressedFile, 'size', {
      value: file.size * 0.5, // 50% 압축
      writable: false
    })
    return Promise.resolve(compressedFile)
  })
})

import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import imageCompression from 'browser-image-compression'

// Mock File 생성 헬퍼
function createMockFile({
  name = 'test.jpg',
  size = 1024 * 1024, // 1MB
  type = 'image/jpeg',
  content = 'mock file content'
}: {
  name?: string
  size?: number
  type?: string
  content?: string
} = {}): File {
  const file = new File([content], name, { type })

  Object.defineProperty(file, 'size', {
    value: size,
    writable: false
  })

  return file
}

// uploadBytesResumable 모킹 헬퍼
function mockUploadTask(
  shouldSucceed: boolean = true,
  progressSteps: number[] = [25, 50, 75, 100]
) {
  const task = {
    snapshot: {
      ref: { name: 'mock-ref' },
      bytesTransferred: 0,
      totalBytes: 1000
    },
    on: jest.fn((_event, progress, error, complete) => {
      // 진행률 콜백 즉시 실행 (setTimeout 제거)
      progressSteps.forEach((step) => {
        if (progress) {
          progress({
            bytesTransferred: (1000 * step) / 100,
            totalBytes: 1000
          })
        }
      })

      // 최종 결과 즉시 실행
      if (shouldSucceed) {
        if (complete) complete()
      } else {
        if (error) {
          error({ code: 'storage/unknown', message: 'Upload failed' })
        }
      }
    })
  }

  return task
}

describe('Firebase Storage - Profile Images', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // 기본 mock 설정
    ;(ref as jest.Mock).mockReturnValue({ name: 'mock-ref' })
    ;(getDownloadURL as jest.Mock).mockResolvedValue('https://storage.firebase.com/test-image.jpg')
    ;(deleteObject as jest.Mock).mockResolvedValue(undefined)
  })

  describe('uploadProfileImage', () => {
    const userId = 'test-user-123'

    describe('파일 유효성 검증', () => {
      it('유효한 JPEG 파일을 허용해야 함', async () => {
        const file = createMockFile({ type: 'image/jpeg', size: 2 * 1024 * 1024 })

        ;(uploadBytesResumable as jest.Mock).mockReturnValue(mockUploadTask(true))

        const result = await uploadProfileImage(file, userId)

        expect(result.success).toBe(true)
        expect(result.url).toBeDefined()
      })

      it('유효한 PNG 파일을 허용해야 함', async () => {
        const file = createMockFile({ type: 'image/png', size: 1 * 1024 * 1024 })

        ;(uploadBytesResumable as jest.Mock).mockReturnValue(mockUploadTask(true))

        const resultPromise = uploadProfileImage(file, userId)

        const result = await resultPromise

        expect(result.success).toBe(true)
      })

      it('유효한 WebP 파일을 허용해야 함', async () => {
        const file = createMockFile({ type: 'image/webp', size: 1 * 1024 * 1024 })

        ;(uploadBytesResumable as jest.Mock).mockReturnValue(mockUploadTask(true))

        const resultPromise = uploadProfileImage(file, userId)

        const result = await resultPromise

        expect(result.success).toBe(true)
      })

      it('5MB 초과 파일을 거부해야 함', async () => {
        const file = createMockFile({ size: 6 * 1024 * 1024 })

        const result = await uploadProfileImage(file, userId)

        expect(result.success).toBe(false)
        expect(result.error).toBe('파일 크기는 5MB 이하로 업로드해주세요.')
        expect(imageCompression).not.toHaveBeenCalled()
      })

      it('허용되지 않은 파일 타입을 거부해야 함', async () => {
        const file = createMockFile({ type: 'image/gif' })

        const result = await uploadProfileImage(file, userId)

        expect(result.success).toBe(false)
        expect(result.error).toBe('JPG, PNG, WebP 파일만 업로드 가능합니다.')
        expect(imageCompression).not.toHaveBeenCalled()
      })

      it('텍스트 파일을 거부해야 함', async () => {
        const file = createMockFile({ type: 'text/plain' })

        const result = await uploadProfileImage(file, userId)

        expect(result.success).toBe(false)
        expect(result.error).toBe('JPG, PNG, WebP 파일만 업로드 가능합니다.')
      })
    })

    describe('이미지 압축', () => {
      it('이미지를 압축해야 함', async () => {
        const file = createMockFile({ size: 3 * 1024 * 1024 })

        ;(uploadBytesResumable as jest.Mock).mockReturnValue(mockUploadTask(true))

        const resultPromise = uploadProfileImage(file, userId)

        await resultPromise

        expect(imageCompression).toHaveBeenCalledWith(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 512,
          useWebWorker: true,
          fileType: 'image/jpeg',
          initialQuality: 0.8
        })
      })

      it('압축 실패 시 원본 파일을 사용해야 함', async () => {
        const file = createMockFile()

        // 압축 실패 시뮬레이션
        ;(imageCompression as jest.Mock).mockRejectedValueOnce(new Error('Compression failed'))
        ;(uploadBytesResumable as jest.Mock).mockReturnValue(mockUploadTask(true))

        const resultPromise = uploadProfileImage(file, userId)

        const result = await resultPromise

        // 원본 파일로 업로드가 시도되어야 함
        expect(result.success).toBe(true)
        expect(uploadBytesResumable).toHaveBeenCalled()
      })
    })

    describe('Storage 경로 생성', () => {
      it('올바른 경로 형식을 사용해야 함', async () => {
        const file = createMockFile({ name: 'profile.jpg' })
        const mockTimestamp = 1640995200000
        jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp)

        ;(uploadBytesResumable as jest.Mock).mockReturnValue(mockUploadTask(true))

        const resultPromise = uploadProfileImage(file, userId)

        await resultPromise

        expect(ref).toHaveBeenCalledWith(
          expect.anything(),
          `users/${userId}/profile/${mockTimestamp}.jpg`
        )

        jest.restoreAllMocks()
      })

      it('다양한 확장자를 올바르게 처리해야 함', async () => {
        const testCases = [
          { name: 'image.png', expected: 'png' },
          { name: 'photo.webp', expected: 'webp' },
          { name: 'avatar.jpeg', expected: 'jpeg' }
        ]

        const mockTimestamp = 1640995200000
        jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp)

        for (const testCase of testCases) {
          jest.clearAllMocks()

          const file = createMockFile({ name: testCase.name })
          ;(uploadBytesResumable as jest.Mock).mockReturnValue(mockUploadTask(true))

          const resultPromise = uploadProfileImage(file, userId)

          await resultPromise

          expect(ref).toHaveBeenCalledWith(
            expect.anything(),
            `users/${userId}/profile/${mockTimestamp}.${testCase.expected}`
          )
        }

        jest.restoreAllMocks()
      })

      it('확장자가 없는 파일을 처리해야 함', async () => {
        const file = createMockFile({ name: 'no-extension' })
        const mockTimestamp = 1640995200000
        jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp)

        ;(uploadBytesResumable as jest.Mock).mockReturnValue(mockUploadTask(true))

        const resultPromise = uploadProfileImage(file, userId)

        await resultPromise

        // 파일명 전체가 확장자로 사용됨
        expect(ref).toHaveBeenCalledWith(
          expect.anything(),
          `users/${userId}/profile/${mockTimestamp}.no-extension`
        )
        // 파일명 전체가 확장자로 사용됨
        expect(ref).toHaveBeenCalledWith(
          expect.anything(),
          `users/${userId}/profile/${mockTimestamp}.no-extension`
        )
        // 파일명 전체가 확장자로 사용됨
        expect(ref).toHaveBeenCalledWith(
          expect.anything(),
          `users/${userId}/profile/${mockTimestamp}.no-extension`
        )
        // 파일명 전체가 확장자로 사용됨
        expect(ref).toHaveBeenCalledWith(
          expect.anything(),
          `users/${userId}/profile/${mockTimestamp}.no-extension`
        )
        // 파일명 전체가 확장자로 사용됨
        expect(ref).toHaveBeenCalledWith(
          expect.anything(),
          `users/${userId}/profile/${mockTimestamp}.no-extension`
        )

        jest.restoreAllMocks()
      })
    })

    describe('업로드 진행률 추적', () => {
      it('진행률 콜백이 호출되어야 함', async () => {
        const file = createMockFile()
        const onProgress = jest.fn()

        ;(uploadBytesResumable as jest.Mock).mockReturnValue(mockUploadTask(true, [25, 50, 75, 100]))

        const resultPromise = uploadProfileImage(file, userId, onProgress)

        await resultPromise

        expect(onProgress).toHaveBeenCalled()
        expect(onProgress).toHaveBeenCalledWith(25)
        expect(onProgress).toHaveBeenCalledWith(50)
        expect(onProgress).toHaveBeenCalledWith(75)
        expect(onProgress).toHaveBeenCalledWith(100)
      })

      it('진행률 콜백 없이도 동작해야 함', async () => {
        const file = createMockFile()

        ;(uploadBytesResumable as jest.Mock).mockReturnValue(mockUploadTask(true))

        const resultPromise = uploadProfileImage(file, userId)

        const result = await resultPromise

        expect(result.success).toBe(true)
      })

      it('진행률이 0-100% 범위여야 함', async () => {
        const file = createMockFile()
        const progressValues: number[] = []

        const onProgress = jest.fn((progress) => {
          progressValues.push(progress)
        })

        ;(uploadBytesResumable as jest.Mock).mockReturnValue(mockUploadTask(true))

        const resultPromise = uploadProfileImage(file, userId, onProgress)

        await resultPromise

        progressValues.forEach((value) => {
          expect(value).toBeGreaterThanOrEqual(0)
          expect(value).toBeLessThanOrEqual(100)
        })
      })
    })

    describe('업로드 성공', () => {
      it('다운로드 URL을 반환해야 함', async () => {
        const file = createMockFile()
        const expectedUrl = 'https://storage.firebase.com/users/test-user-123/profile/image.jpg'

        ;(uploadBytesResumable as jest.Mock).mockReturnValue(mockUploadTask(true))
        ;(getDownloadURL as jest.Mock).mockResolvedValue(expectedUrl)

        const resultPromise = uploadProfileImage(file, userId)

        const result = await resultPromise

        expect(result.success).toBe(true)
        expect(result.url).toBe(expectedUrl)
        expect(result.path).toContain(`users/${userId}/profile/`)
      })

      it('Storage 경로를 반환해야 함', async () => {
        const file = createMockFile()

        ;(uploadBytesResumable as jest.Mock).mockReturnValue(mockUploadTask(true))

        const resultPromise = uploadProfileImage(file, userId)

        const result = await resultPromise

        expect(result.success).toBe(true)
        expect(result.path).toMatch(/^users\/test-user-123\/profile\/\d+\.jpg$/)
      })
    })

    describe('업로드 실패 처리', () => {
      it('네트워크 오류를 처리해야 함', async () => {
        const file = createMockFile()

        ;(uploadBytesResumable as jest.Mock).mockReturnValue(mockUploadTask(false))

        const resultPromise = uploadProfileImage(file, userId)

        const result = await resultPromise

        expect(result.success).toBe(false)
        expect(result.error).toBe('네트워크 오류가 발생했습니다.')
      })

      it('권한 오류를 처리해야 함', async () => {
        const file = createMockFile()

        const unauthorizedTask = {
          snapshot: { ref: {}, bytesTransferred: 0, totalBytes: 1000 },
          on: jest.fn((_event, _progress, error) => {
            if (error) {
              error({ code: 'storage/unauthorized' })
            }
          })
        }

        ;(uploadBytesResumable as jest.Mock).mockReturnValue(unauthorizedTask)

        const result = await uploadProfileImage(file, userId)

        expect(result.success).toBe(false)
        expect(result.error).toBe('업로드 권한이 없습니다.')
      })

      it('취소된 업로드를 처리해야 함', async () => {
        const file = createMockFile()

        const canceledTask = {
          snapshot: { ref: {}, bytesTransferred: 0, totalBytes: 1000 },
          on: jest.fn((_event, _progress, error) => {
            if (error) {
              error({ code: 'storage/canceled' })
            }
          })
        }

        ;(uploadBytesResumable as jest.Mock).mockReturnValue(canceledTask)

        const result = await uploadProfileImage(file, userId)

        expect(result.success).toBe(false)
        expect(result.error).toBe('업로드가 취소되었습니다.')
      })

      it('getDownloadURL 실패를 처리해야 함', async () => {
        const file = createMockFile()

        ;(uploadBytesResumable as jest.Mock).mockReturnValue(mockUploadTask(true))
        ;(getDownloadURL as jest.Mock).mockRejectedValueOnce(new Error('URL generation failed'))

        const resultPromise = uploadProfileImage(file, userId)

        const result = await resultPromise

        expect(result.success).toBe(false)
        expect(result.error).toBe('업로드는 완료되었으나 URL 생성에 실패했습니다.')
      })
    })
  })

  describe('deleteProfileImage', () => {
    describe('Storage 경로로 삭제', () => {
      it('직접 경로로 이미지를 삭제해야 함', async () => {
        const storagePath = 'users/user123/profile/1640995200000.jpg'

        const result = await deleteProfileImage(storagePath)

        expect(result.success).toBe(true)
        expect(ref).toHaveBeenCalledWith(expect.anything(), storagePath)
        expect(deleteObject).toHaveBeenCalled()
      })

      it('다양한 경로 형식을 처리해야 함', async () => {
        const paths = [
          'users/user123/profile/image.jpg',
          'users/user456/profile/photo.png',
          'users/user789/profile/avatar.webp'
        ]

        for (const path of paths) {
          jest.clearAllMocks()

          const result = await deleteProfileImage(path)

          expect(result.success).toBe(true)
          expect(ref).toHaveBeenCalledWith(expect.anything(), path)
          expect(deleteObject).toHaveBeenCalled()
        }
      })
    })

    describe('Firebase Storage URL로 삭제', () => {
      it('Firebase Storage URL에서 경로를 추출해야 함', async () => {
        const firebaseUrl =
          'https://firebasestorage.googleapis.com/v0/b/my-bucket/o/users%2Fuser123%2Fprofile%2Fimage.jpg?alt=media&token=abc123'

        const result = await deleteProfileImage(firebaseUrl)

        expect(result.success).toBe(true)
        expect(ref).toHaveBeenCalledWith(expect.anything(), 'users/user123/profile/image.jpg')
        expect(deleteObject).toHaveBeenCalled()
      })

      it('URL 디코딩을 올바르게 수행해야 함', async () => {
        const firebaseUrl =
          'https://firebasestorage.googleapis.com/v0/b/bucket/o/users%2Ftest%2Fprofile%2F%E1%84%90%E1%85%A6%E1%84%89%E1%85%B3%E1%84%90%E1%85%B3.jpg'

        const result = await deleteProfileImage(firebaseUrl)

        expect(result.success).toBe(true)
        // URL 디코딩 검증
        const callArgs = (ref as jest.Mock).mock.calls[0]
        expect(callArgs[1]).toContain('users/test/profile/')
      })

      it('잘못된 URL 형식을 거부해야 함', async () => {
        const invalidUrl = 'https://example.com/image.jpg'

        const result = await deleteProfileImage(invalidUrl)

        expect(result.success).toBe(false)
        expect(result.error).toBe('잘못된 이미지 URL 형식입니다.')
        expect(deleteObject).not.toHaveBeenCalled()
      })
    })

    describe('삭제 실패 처리', () => {
      it('존재하지 않는 파일 에러를 처리해야 함', async () => {
        const error: any = new Error('Not found')
        error.code = 'storage/object-not-found'

        ;(deleteObject as jest.Mock).mockRejectedValueOnce(error)

        const result = await deleteProfileImage('users/user123/profile/nonexistent.jpg')

        expect(result.success).toBe(false)
        expect(result.error).toBe('삭제할 이미지를 찾을 수 없습니다.')
      })

      it('권한 오류를 처리해야 함', async () => {
        const error: any = new Error('Unauthorized')
        error.code = 'storage/unauthorized'

        ;(deleteObject as jest.Mock).mockRejectedValueOnce(error)

        const result = await deleteProfileImage('users/user123/profile/image.jpg')

        expect(result.success).toBe(false)
        expect(result.error).toBe('삭제 권한이 없습니다.')
      })

      it('일반 네트워크 오류를 처리해야 함', async () => {
        ;(deleteObject as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

        const result = await deleteProfileImage('users/user123/profile/image.jpg')

        expect(result.success).toBe(false)
        expect(result.error).toBe('이미지 삭제에 실패했습니다.')
      })
    })
  })

  describe('replaceProfileImage', () => {
    const userId = 'test-user-123'

    beforeEach(() => {
      ;(uploadBytesResumable as jest.Mock).mockReturnValue(mockUploadTask(true))
      ;(getDownloadURL as jest.Mock).mockResolvedValue('https://storage.firebase.com/new-image.jpg')
      ;(deleteObject as jest.Mock).mockResolvedValue(undefined)
    })

    describe('이미지 교체', () => {
      it('기존 이미지를 삭제하고 새 이미지를 업로드해야 함', async () => {
        const newFile = createMockFile({ name: 'new-profile.jpg' })
        const currentImageUrl = 'users/user123/profile/old-image.jpg'

        const resultPromise = replaceProfileImage(newFile, userId, currentImageUrl)

        const result = await resultPromise

        expect(result.success).toBe(true)
        expect(deleteObject).toHaveBeenCalled() // 기존 이미지 삭제
        expect(uploadBytesResumable).toHaveBeenCalled() // 새 이미지 업로드
        expect(result.url).toBe('https://storage.firebase.com/new-image.jpg')
      })

      it('기존 이미지가 없어도 업로드해야 함', async () => {
        const newFile = createMockFile()

        const resultPromise = replaceProfileImage(newFile, userId, null)

        const result = await resultPromise

        expect(result.success).toBe(true)
        expect(deleteObject).not.toHaveBeenCalled() // 삭제 안 함
        expect(uploadBytesResumable).toHaveBeenCalled() // 업로드만 수행
      })

      it('기존 이미지 URL이 undefined여도 업로드해야 함', async () => {
        const newFile = createMockFile()

        const resultPromise = replaceProfileImage(newFile, userId)

        const result = await resultPromise

        expect(result.success).toBe(true)
        expect(deleteObject).not.toHaveBeenCalled()
        expect(uploadBytesResumable).toHaveBeenCalled()
      })

      it('진행률 콜백을 전달해야 함', async () => {
        const newFile = createMockFile()
        const onProgress = jest.fn()

        const resultPromise = replaceProfileImage(newFile, userId, null, onProgress)

        await resultPromise

        expect(onProgress).toHaveBeenCalled()
      })
    })

    describe('부분 실패 처리', () => {
      it('기존 이미지 삭제 실패 시에도 업로드를 진행해야 함', async () => {
        const newFile = createMockFile()
        const currentImageUrl = 'users/user123/profile/old-image.jpg'

        // 삭제 실패 설정
        ;(deleteObject as jest.Mock).mockRejectedValueOnce(new Error('Delete failed'))

        const resultPromise = replaceProfileImage(newFile, userId, currentImageUrl)

        const result = await resultPromise

        // 삭제는 실패했지만 업로드는 성공해야 함
        expect(result.success).toBe(true)
        expect(result.url).toBeDefined()
        expect(deleteObject).toHaveBeenCalled()
        expect(uploadBytesResumable).toHaveBeenCalled()
      })

      it('업로드 실패 시 에러를 반환해야 함', async () => {
        const newFile = createMockFile({ size: 6 * 1024 * 1024 }) // 5MB 초과

        const result = await replaceProfileImage(newFile, userId, null)

        expect(result.success).toBe(false)
        expect(result.error).toBeDefined()
      })
    })

    describe('엣지 케이스', () => {
      it('빈 문자열 currentImageUrl을 처리해야 함', async () => {
        const newFile = createMockFile()

        const resultPromise = replaceProfileImage(newFile, userId, '')

        const result = await resultPromise

        expect(result.success).toBe(true)
        expect(deleteObject).not.toHaveBeenCalled() // 빈 문자열은 null과 같이 처리
      })

      it('매우 큰 파일을 거부해야 함', async () => {
        const largeFile = createMockFile({ size: 10 * 1024 * 1024 })

        const result = await replaceProfileImage(largeFile, userId, null)

        expect(result.success).toBe(false)
        expect(result.error).toBe('파일 크기는 5MB 이하로 업로드해주세요.')
      })
    })
  })

  describe('통합 테스트', () => {
    const userId = 'integration-test-user'

    beforeEach(() => {
      ;(uploadBytesResumable as jest.Mock).mockReturnValue(mockUploadTask(true))
      ;(getDownloadURL as jest.Mock).mockResolvedValue('https://storage.firebase.com/test.jpg')
      ;(deleteObject as jest.Mock).mockResolvedValue(undefined)
    })

    it('업로드 후 삭제가 정상 동작해야 함', async () => {
      // 1. 이미지 업로드
      const file = createMockFile()

      const uploadPromise = uploadProfileImage(file, userId)

      const uploadResult = await uploadPromise

      expect(uploadResult.success).toBe(true)
      expect(uploadResult.url).toBeDefined()

      // 2. 업로드된 이미지 삭제
      const deleteResult = await deleteProfileImage(uploadResult.path!)

      expect(deleteResult.success).toBe(true)
    })

    it('프로필 이미지 교체 플로우가 정상 동작해야 함', async () => {
      // 1. 첫 번째 이미지 업���드
      const firstFile = createMockFile({ name: 'first-profile.jpg' })

      const firstUploadPromise = uploadProfileImage(firstFile, userId)

      const firstUploadResult = await firstUploadPromise

      expect(firstUploadResult.success).toBe(true)

      // 2. 두 번째 이미지로 교체
      jest.clearAllMocks()
      ;(uploadBytesResumable as jest.Mock).mockReturnValue(mockUploadTask(true))
      ;(getDownloadURL as jest.Mock).mockResolvedValue('https://storage.firebase.com/second.jpg')

      const secondFile = createMockFile({ name: 'second-profile.jpg' })

      const replacePromise = replaceProfileImage(secondFile, userId, firstUploadResult.url)

      const replaceResult = await replacePromise

      expect(replaceResult.success).toBe(true)
      expect(replaceResult.url).toBe('https://storage.firebase.com/second.jpg')
      expect(deleteObject).toHaveBeenCalled() // 첫 번째 이미지 삭제 확인
    })
  })
})
