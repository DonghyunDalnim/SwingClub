'use client'

import { useState, useRef } from 'react'
import { OptimizedImage } from '@/components/core/OptimizedImage'
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
    <div className="upload-container">
      {/* 업로드 버튼 */}
      <div>
        <button
          type="button"
          onClick={handleUploadClick}
          disabled={uploading || images.length >= maxImages}
          className="upload-button"
        >
          {uploading ? (
            <>
              <div className="spinner" />
              업로드 중...
            </>
          ) : (
            <>
              <Upload className="upload-icon" />
              이미지 업로드 ({images.length}/{maxImages})
            </>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden-input"
        />

        <p className="upload-hint">
          JPG, PNG, WebP 파일 (최대 5MB)
        </p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* 업로드된 이미지 미리보기 */}
      {images.length > 0 && (
        <div className="images-grid">
          {images.map((url, index) => (
            <div key={index} className="image-card">
              <div className="image-wrapper">
                <OptimizedImage
                  src={url}
                  alt={`업로드된 이미지 ${index + 1}`}
                  className="image"
                  priority={false}
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="remove-button"
                >
                  <X className="remove-icon" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 빈 상태 */}
      {images.length === 0 && !uploading && (
        <div className="empty-state">
          <div className="empty-content">
            <ImageIcon className="empty-icon" />
            <p className="empty-text">이미지를 업로드해보세요</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .upload-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .upload-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px 16px;
          background: rgba(102, 126, 234, 0.1);
          border: 1.5px solid rgba(102, 126, 234, 0.3);
          border-radius: 12px;
          color: #667eea;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .upload-button:hover:not(:disabled) {
          background: rgba(102, 126, 234, 0.2);
          transform: translateY(-1px);
        }

        .upload-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .upload-icon {
          width: 16px;
          height: 16px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(102, 126, 234, 0.3);
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .hidden-input {
          display: none;
        }

        .upload-hint {
          margin-top: 8px;
          font-size: 13px;
          color: var(--gray-500);
        }

        .error-message {
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1.5px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          color: #dc2626;
          font-size: 14px;
        }

        .images-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
        }

        .image-card {
          position: relative;
        }

        .image-wrapper {
          position: relative;
          aspect-ratio: 1;
          border-radius: 12px;
          overflow: hidden;
          background: rgba(200, 200, 200, 0.1);
        }

        .image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-button {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(239, 68, 68, 0.9);
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          opacity: 0;
          transition: all 0.2s;
        }

        .image-card:hover .remove-button {
          opacity: 1;
        }

        .remove-button:hover {
          background: #dc2626;
          transform: scale(1.1);
        }

        .remove-icon {
          width: 14px;
          height: 14px;
        }

        .empty-state {
          background: rgba(255, 255, 255, 0.9);
          border: 1.5px dashed rgba(200, 200, 200, 0.4);
          border-radius: 12px;
          padding: 40px 20px;
        }

        .empty-content {
          text-align: center;
        }

        .empty-icon {
          width: 48px;
          height: 48px;
          color: var(--gray-400);
          margin: 0 auto 16px;
        }

        .empty-text {
          color: var(--gray-500);
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .images-grid {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 8px;
          }

          .empty-state {
            padding: 32px 16px;
          }
        }
      `}</style>
    </div>
  )
}