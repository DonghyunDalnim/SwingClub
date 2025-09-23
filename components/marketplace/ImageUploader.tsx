'use client'

import { ImageUpload } from '@/components/community/ImageUpload'

interface ImageUploaderProps {
  onUpload: (urls: string[]) => void
  maxImages?: number
  userId: string
  existingImages?: string[]
}

export function ImageUploader({
  onUpload,
  maxImages = 10,
  userId,
  existingImages = []
}: ImageUploaderProps) {
  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600">
        상품 이미지를 업로드하세요. (최대 {maxImages}개)
      </div>

      <ImageUpload
        onUpload={onUpload}
        maxImages={maxImages}
        userId={userId}
        existingImages={existingImages}
      />

      <div className="text-xs text-gray-500">
        • 첫 번째 이미지가 대표 이미지로 설정됩니다
        • JPG, PNG 파일만 업로드 가능합니다
        • 파일 크기는 최대 5MB까지 가능합니다
      </div>
    </div>
  )
}