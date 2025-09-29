'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/core/Button'
import { Card } from '@/components/core/Card'
import { X, Upload, Image as ImageIcon } from 'lucide-react'
import { uploadImage, validateImageFile, resizeImage } from '@/lib/utils/imageUpload'

interface ImageUploadProps {
  onUpload: (urls: string[]) => void
  maxImages?: number
  userId: string
  existingImages?: string[]
}

export function ImageUpload({ onUpload, maxImages = 5, userId, existingImages = [] }: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(existingImages)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setError('')
    setUploading(true)

    try {
      // 최대 이미지 수 확인
      if (images.length + files.length > maxImages) {
        setError(`최대 ${maxImages}개의 이미지만 업로드할 수 있습니다.`)
        setUploading(false)
        return
      }

      const uploadedUrls: string[] = []

      for (const file of files) {
        // 파일 검증
        const validation = validateImageFile(file)
        if (!validation.valid) {
          setError(validation.error || '')
          continue
        }

        // 이미지 최적화
        const resizedFile = await resizeImage(file)

        // 업로드
        const result = await uploadImage(resizedFile, userId)
        if (result.success && result.url) {
          uploadedUrls.push(result.url)
        } else {
          setError(result.error || '업로드에 실패했습니다.')
        }
      }

      if (uploadedUrls.length > 0) {
        const newImages = [...images, ...uploadedUrls]
        setImages(newImages)
        onUpload(newImages)
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error)
      setError('이미지 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onUpload(newImages)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* 업로드 버튼 */}
      <div>
        <Button
          type="button"
          variant="outline"
          onClick={handleUploadClick}
          disabled={uploading || images.length >= maxImages}
          className="w-full"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2" />
              업로드 중...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              이미지 업로드 ({images.length}/{maxImages})
            </>
          )}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        <p className="text-sm text-gray-500 mt-1">
          JPG, PNG, WebP 파일 (최대 5MB)
        </p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {/* 업로드된 이미지 미리보기 */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((url, index) => (
            <Card key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={url}
                  alt={`업로드된 이미지 ${index + 1}번째`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`${index + 1}번째 이미지 삭제`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 빈 상태 */}
      {images.length === 0 && !uploading && (
        <Card className="border-dashed border-2 border-gray-300">
          <div className="p-8 text-center">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">이미지를 업로드해보세요</p>
          </div>
        </Card>
      )}
    </div>
  )
}