/**
 * Firebase Storage 프로필 이미지 관리
 * 프로필 이미지 업로드, 압축, 삭제 기능
 */

import { storage } from '@/lib/firebase'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import imageCompression from 'browser-image-compression'

/**
 * 프로필 이미지 압축 옵션
 * 최대 해상도: 512x512px, 품질: 80%
 */
const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.5, // 최대 파일 크기 500KB
  maxWidthOrHeight: 512, // 최대 해상도 512px
  useWebWorker: true,
  fileType: 'image/jpeg' as const,
  initialQuality: 0.8 // 품질 80%
}

/**
 * 업로드 진행률 콜백 타입
 */
export type ProgressCallback = (progress: number) => void

/**
 * 프로필 이미지 업로드 결과
 */
export interface UploadResult {
  success: boolean
  url?: string
  error?: string
  path?: string
}

/**
 * 프로필 이미지 삭제 결과
 */
export interface DeleteResult {
  success: boolean
  error?: string
}

/**
 * 파일 유효성 검증
 */
function validateImageFile(file: File): { valid: boolean; error?: string } {
  // 파일 크기 검증 (5MB 제한)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: '파일 크기는 5MB 이하로 업로드해주세요.' }
  }

  // 파일 타입 검증
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'JPG, PNG, WebP 파일만 업로드 가능합니다.' }
  }

  return { valid: true }
}

/**
 * Storage 경로 생성
 * users/{userId}/profile/{timestamp}.{ext}
 */
function generateProfileImagePath(userId: string, file: File): string {
  const timestamp = Date.now()
  const extension = file.name.split('.').pop() || 'jpg'
  return `users/${userId}/profile/${timestamp}.${extension}`
}

/**
 * 프로필 이미지 압축
 * browser-image-compression을 사용하여 512x512px, 80% 품질로 압축
 */
async function compressProfileImage(file: File): Promise<File> {
  try {
    const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS)
    return compressedFile
  } catch (error) {
    console.error('이미지 압축 실패:', error)
    // 압축 실패 시 원본 파일 반환
    return file
  }
}

/**
 * 프로필 이미지를 Firebase Storage에 업로드
 *
 * @param file - 업로드할 이미지 파일
 * @param userId - 사용자 ID
 * @param onProgress - 진행률 콜백 (0-100)
 * @returns 업로드 결과 (성공 시 다운로드 URL 포함)
 *
 * @example
 * ```ts
 * const result = await uploadProfileImage(
 *   file,
 *   'user123',
 *   (progress) => console.log(`업로드 진행률: ${progress}%`)
 * )
 *
 * if (result.success) {
 *   console.log('업로드 완료:', result.url)
 * }
 * ```
 */
export async function uploadProfileImage(
  file: File,
  userId: string,
  onProgress?: ProgressCallback
): Promise<UploadResult> {
  try {
    // 1. 파일 유효성 검증
    const validation = validateImageFile(file)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // 2. 이미지 압축 (512x512px, 80% 품질)
    const compressedFile = await compressProfileImage(file)

    // 3. Storage 경로 생성
    const storagePath = generateProfileImagePath(userId, compressedFile)
    const storageRef = ref(storage, storagePath)

    // 4. 업로드 (진행률 추적)
    const uploadTask = uploadBytesResumable(storageRef, compressedFile)

    return new Promise((resolve) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // 진행률 계산 및 콜백 호출
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          )
          onProgress?.(progress)
        },
        (error) => {
          // 업로드 실패
          console.error('프로필 이미지 업로드 실패:', error)

          let errorMessage = '이미지 업로드에 실패했습니다.'

          // Firebase Storage 에러 코드별 메시지
          if (error.code === 'storage/unauthorized') {
            errorMessage = '업로드 권한이 없습니다.'
          } else if (error.code === 'storage/canceled') {
            errorMessage = '업로드가 취소되었습니다.'
          } else if (error.code === 'storage/unknown') {
            errorMessage = '네트워크 오류가 발생했습니다.'
          }

          resolve({ success: false, error: errorMessage })
        },
        async () => {
          // 업로드 성공 - 다운로드 URL 가져오기
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            resolve({
              success: true,
              url: downloadURL,
              path: storagePath
            })
          } catch (error) {
            console.error('다운로드 URL 가져오기 실패:', error)
            resolve({
              success: false,
              error: '업로드는 완료되었으나 URL 생성에 실패했습니다.'
            })
          }
        }
      )
    })
  } catch (error) {
    console.error('프로필 이미지 업로드 오류:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.'
    }
  }
}

/**
 * 프로필 이미지를 Firebase Storage에서 삭제
 *
 * @param imageUrl - 삭제할 이미지의 다운로드 URL 또는 Storage 경로
 * @returns 삭제 결과
 *
 * @example
 * ```ts
 * // URL로 삭제
 * const result = await deleteProfileImage('https://storage.googleapis.com/...')
 *
 * // Storage 경로로 삭제
 * const result = await deleteProfileImage('users/user123/profile/1234567890.jpg')
 *
 * if (result.success) {
 *   console.log('삭제 완료')
 * }
 * ```
 */
export async function deleteProfileImage(imageUrl: string): Promise<DeleteResult> {
  try {
    // URL에서 Storage 경로 추출 (URL인 경우)
    let storagePath = imageUrl

    if (imageUrl.startsWith('http')) {
      // Firebase Storage URL 형식:
      // https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?...
      const urlObj = new URL(imageUrl)
      const pathMatch = urlObj.pathname.match(/\/o\/(.+)/)

      if (pathMatch) {
        // URL 디코딩
        storagePath = decodeURIComponent(pathMatch[1])
      } else {
        return {
          success: false,
          error: '잘못된 이미지 URL 형식입니다.'
        }
      }
    }

    // Storage 참조 생성 및 삭제
    const storageRef = ref(storage, storagePath)
    await deleteObject(storageRef)

    return { success: true }
  } catch (error: any) {
    console.error('프로필 이미지 삭제 실패:', error)

    let errorMessage = '이미지 삭제에 실패했습니다.'

    // Firebase Storage 에러 코드별 메시지
    if (error.code === 'storage/object-not-found') {
      errorMessage = '삭제할 이미지를 찾을 수 없습니다.'
    } else if (error.code === 'storage/unauthorized') {
      errorMessage = '삭제 권한이 없습니다.'
    }

    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * 기존 프로필 이미지를 삭제하고 새 이미지를 업로드
 * 중복 업로드 방지 및 Storage 정리를 위한 헬퍼 함수
 *
 * @param file - 업로드할 새 이미지 파일
 * @param userId - 사용자 ID
 * @param currentImageUrl - 현재 프로필 이미지 URL (있는 경우)
 * @param onProgress - 진행률 콜백
 * @returns 업로드 결과
 *
 * @example
 * ```ts
 * const result = await replaceProfileImage(
 *   newFile,
 *   'user123',
 *   'https://storage.googleapis.com/.../old-profile.jpg',
 *   (progress) => setUploadProgress(progress)
 * )
 * ```
 */
export async function replaceProfileImage(
  file: File,
  userId: string,
  currentImageUrl?: string | null,
  onProgress?: ProgressCallback
): Promise<UploadResult> {
  try {
    // 1. 기존 이미지가 있으면 삭제
    if (currentImageUrl) {
      const deleteResult = await deleteProfileImage(currentImageUrl)
      if (!deleteResult.success) {
        console.warn('기존 이미지 삭제 실패 (계속 진행):', deleteResult.error)
        // 삭제 실패해도 업로드는 진행
      }
    }

    // 2. 새 이미지 업로드
    const uploadResult = await uploadProfileImage(file, userId, onProgress)
    return uploadResult
  } catch (error) {
    console.error('프로필 이미지 교체 실패:', error)
    return {
      success: false,
      error: '프로필 이미지 교체에 실패했습니다.'
    }
  }
}
