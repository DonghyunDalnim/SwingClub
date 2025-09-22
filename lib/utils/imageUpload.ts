/**
 * 이미지 업로드 유틸리티
 * 로컬 파일 시스템을 사용한 이미지 업로드 및 최적화
 */

// 이미지 파일 검증
export function validateImageFile(file: File): { valid: boolean; error?: string } {
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

// 이미지 파일명 생성 (API에서 처리하므로 사용하지 않음)
function generateImageFileName(originalName: string, userId: string): string {
  const timestamp = Date.now()
  const extension = originalName.split('.').pop()
  return `posts/${userId}/${timestamp}.${extension}`
}

// 이미지 업로드
export async function uploadImage(file: File, userId: string, category: string = 'posts'): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // 파일 검증
    const validation = validateImageFile(file)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // FormData 생성
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', userId)
    formData.append('category', category)

    // API 호출
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      return { success: false, error: result.error || '이미지 업로드에 실패했습니다.' }
    }

    return { success: true, url: result.url }
  } catch (error) {
    console.error('이미지 업로드 실패:', error)
    return { success: false, error: '이미지 업로드에 실패했습니다.' }
  }
}

// 이미지 삭제
export async function deleteImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    // API 호출로 이미지 삭제
    const response = await fetch(`/api/upload?url=${encodeURIComponent(imageUrl)}`, {
      method: 'DELETE'
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      return { success: false, error: result.error || '이미지 삭제에 실패했습니다.' }
    }

    return { success: true }
  } catch (error) {
    console.error('이미지 삭제 실패:', error)
    return { success: false, error: '이미지 삭제에 실패했습니다.' }
  }
}

// 다중 이미지 업로드
export async function uploadMultipleImages(files: File[], userId: string, category: string = 'posts'): Promise<{ success: boolean; urls?: string[]; error?: string }> {
  try {
    const uploadPromises = files.map(file => uploadImage(file, userId, category))
    const results = await Promise.all(uploadPromises)

    // 실패한 업로드가 있는지 확인
    const failedUploads = results.filter(result => !result.success)
    if (failedUploads.length > 0) {
      return { success: false, error: `${failedUploads.length}개 이미지 업로드에 실패했습니다.` }
    }

    // 성공한 URL들 추출
    const urls = results.map(result => result.url!).filter(Boolean)
    return { success: true, urls }
  } catch (error) {
    console.error('다중 이미지 업로드 실패:', error)
    return { success: false, error: '이미지 업로드에 실패했습니다.' }
  }
}

// 이미지 최적화 (클라이언트 사이드)
export function resizeImage(file: File, maxWidth: number = 1920, maxHeight: number = 1080, quality: number = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()

    img.onload = () => {
      // 비율 계산
      let { width, height } = img

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }

      // 캔버스 크기 설정
      canvas.width = width
      canvas.height = height

      // 이미지 그리기
      ctx.drawImage(img, 0, 0, width, height)

      // Blob으로 변환
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(resizedFile)
          } else {
            resolve(file)
          }
        },
        file.type,
        quality
      )
    }

    img.src = URL.createObjectURL(file)
  })
}