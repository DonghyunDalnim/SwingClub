'use client'

/**
 * ImageUpload Component
 * 프로필 이미지 업로드 및 미리보기 UI
 */

import { useState, useRef, ChangeEvent } from 'react'
import { Avatar } from '@/components/core'
import { theme } from '@/lib/theme'
import { Camera, X } from 'lucide-react'

interface ImageUploadProps {
  currentImage?: string | null
  onImageChange: (file: File | null, previewUrl: string | null) => void
  maxSizeMB?: number
}

export default function ImageUpload({
  currentImage,
  onImageChange,
  maxSizeMB = 5
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    setError(null)

    // 파일 크기 검증 (MB to bytes)
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setError(`이미지 크기는 ${maxSizeMB}MB 이하여야 합니다`)
      return
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다')
      return
    }

    // FileReader로 미리보기 생성
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setPreviewUrl(result)
      onImageChange(file, result)
    }
    reader.readAsDataURL(file)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    setError(null)
    onImageChange(null, null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Preview */}
      <div className="relative">
        <Avatar
          src={previewUrl || undefined}
          alt="프로필 이미지"
          size="xl"
          className="w-32 h-32"
        />

        {/* Camera Icon Overlay */}
        <button
          type="button"
          onClick={handleClick}
          className="absolute bottom-0 right-0 rounded-full p-2 shadow-lg transition-all hover:scale-110"
          style={{
            backgroundColor: theme.colors.primary.main,
            color: theme.colors.white
          }}
          aria-label="이미지 변경"
        >
          <Camera className="w-5 h-5" />
        </button>

        {/* Remove Button */}
        {previewUrl && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-0 right-0 rounded-full p-1.5 shadow-lg transition-all hover:scale-110"
            style={{
              backgroundColor: theme.colors.accent.red,
              color: theme.colors.white
            }}
            aria-label="이미지 제거"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          w-full max-w-md p-6 rounded-lg border-2 border-dashed cursor-pointer
          transition-all text-center
          ${isDragging ? 'border-primary-main bg-secondary-light' : 'border-neutral-light hover:border-primary-main'}
        `}
        style={{
          borderColor: isDragging ? theme.colors.primary.main : theme.colors.neutral.light,
          backgroundColor: isDragging ? theme.colors.secondary.light : 'transparent'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
          aria-label="프로필 이미지 업로드"
        />

        <div className="flex flex-col items-center gap-2">
          <Camera className="w-8 h-8" style={{ color: theme.colors.neutral.medium }} />
          <p className="text-sm font-medium" style={{ color: theme.colors.neutral.darkest }}>
            클릭하거나 이미지를 드래그하세요
          </p>
          <p className="text-xs" style={{ color: theme.colors.neutral.medium }}>
            최대 {maxSizeMB}MB, JPG, PNG, GIF
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="w-full max-w-md p-3 rounded-lg text-sm text-center"
          style={{
            backgroundColor: '#FEE2E2',
            color: theme.colors.accent.red
          }}
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  )
}
