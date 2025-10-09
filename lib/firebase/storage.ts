/**
 * Firebase Storage 프로필 이미지 업로드 시스템
 * Temporary mock - Issue #80 구현 대기 중
 */

export interface UploadResult {
  success: boolean
  url?: string
  path?: string
  error?: string
}

export interface DeleteResult {
  success: boolean
  error?: string
}

export type ProgressCallback = (progress: number) => void

/**
 * 프로필 이미지 업로드 (Mock)
 */
export async function uploadProfileImage(
  file: File,
  userId: string,
  onProgress?: ProgressCallback
): Promise<UploadResult> {
  // Mock implementation - to be replaced with Issue #80 implementation
  console.warn('Using mock uploadProfileImage - Issue #80 not yet merged')

  return Promise.reject({
    success: false,
    error: 'Issue #80 구현이 필요합니다. 현재는 mock 함수입니다.'
  })
}

/**
 * 프로필 이미지 삭제 (Mock)
 */
export async function deleteProfileImage(imageUrl: string): Promise<DeleteResult> {
  // Mock implementation - to be replaced with Issue #80 implementation
  console.warn('Using mock deleteProfileImage - Issue #80 not yet merged')

  return Promise.resolve({
    success: true
  })
}
