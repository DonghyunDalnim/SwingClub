'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/core/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/Card'
import { Badge } from '@/components/core/Badge'
import { ImageUpload } from './ImageUpload'
import { createPostAction, updatePostAction } from '@/lib/actions/posts'
import { POST_CATEGORIES } from '@/lib/types/community'
import type { Post, PostCategory, CreatePostData, UpdatePostData } from '@/lib/types/community'

interface PostFormProps {
  userId: string
  userName: string
  mode: 'create' | 'edit'
  initialData?: Post
}

export function PostForm({ userId, userName, mode, initialData }: PostFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Form state
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    category: initialData?.category || 'general' as PostCategory,
    tags: initialData?.tags || [],
    visibility: initialData?.visibility || 'public' as const,
    images: initialData?.attachments?.map(att => att.fileUrl) || []
  })

  const [error, setError] = useState<string>('')
  const [tagInput, setTagInput] = useState('')

  // 카테고리 선택
  const handleCategoryChange = (category: PostCategory) => {
    setFormData(prev => ({ ...prev, category }))
  }

  // 태그 추가
  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
      setTagInput('')
    }
  }

  // 태그 제거
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // 이미지 업로드 핸들러
  const handleImageUpload = (urls: string[]) => {
    setFormData(prev => ({ ...prev, images: urls }))
  }

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 기본 검증
    if (!formData.title.trim()) {
      setError('제목을 입력해주세요.')
      return
    }

    if (!formData.content.trim()) {
      setError('내용을 입력해주세요.')
      return
    }

    startTransition(async () => {
      try {
        if (mode === 'create') {
          const createData: CreatePostData = {
            title: formData.title.trim(),
            content: formData.content.trim(),
            category: formData.category,
            tags: formData.tags,
            visibility: formData.visibility,
            attachments: formData.images.map((url, index) => ({
              id: `img_${index}`,
              fileName: `image_${index}.jpg`,
              fileUrl: url,
              fileSize: 0, // 실제로는 업로드 시 설정됨
              mimeType: 'image/jpeg',
              uploadedAt: new Date() as any
            }))
          }

          const result = await createPostAction(createData)

          if (result.success && result.postId) {
            router.push(`/community/${result.postId}`)
          } else {
            setError(result.error || '게시글 작성에 실패했습니다.')
          }
        } else if (mode === 'edit' && initialData) {
          const updateData: UpdatePostData = {
            title: formData.title.trim(),
            content: formData.content.trim(),
            category: formData.category,
            tags: formData.tags,
            visibility: formData.visibility,
            attachments: formData.images.map((url, index) => ({
              id: `img_${index}`,
              fileName: `image_${index}.jpg`,
              fileUrl: url,
              fileSize: 0,
              mimeType: 'image/jpeg',
              uploadedAt: new Date() as any
            }))
          }

          const result = await updatePostAction(initialData.id, updateData)

          if (result.success) {
            router.push(`/community/${initialData.id}`)
          } else {
            setError(result.error || '게시글 수정에 실패했습니다.')
          }
        }
      } catch (error) {
        console.error('폼 제출 실패:', error)
        setError('오류가 발생했습니다. 다시 시도해주세요.')
      }
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === 'create' ? '게시글 작성' : '게시글 수정'}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 에러 메시지 */}
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* 카테고리 선택 */}
            <div>
              <label className="block text-sm font-medium mb-2">카테고리</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(POST_CATEGORIES).map(([key, label]) => (
                  <Badge
                    key={key}
                    variant={formData.category === key ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => handleCategoryChange(key as PostCategory)}
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 제목 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                제목 *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="제목을 입력하세요"
                maxLength={100}
                required
              />
            </div>

            {/* 내용 */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-2">
                내용 *
              </label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="내용을 입력하세요"
                rows={10}
                required
              />
            </div>

            {/* 태그 */}
            <div>
              <label className="block text-sm font-medium mb-2">태그</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="태그를 입력하고 엔터를 누르세요"
                  maxLength={20}
                />
                <Button type="button" onClick={addTag} disabled={!tagInput.trim()}>
                  추가
                </Button>
              </div>

              {/* 태그 목록 */}
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    #{tag} ×
                  </Badge>
                ))}
              </div>
            </div>

            {/* 이미지 업로드 */}
            <div>
              <label className="block text-sm font-medium mb-2">이미지</label>
              <ImageUpload
                onUpload={handleImageUpload}
                userId={userId}
                existingImages={formData.images}
                maxImages={5}
              />
            </div>

            {/* 버튼 */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isPending}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isPending || !formData.title.trim() || !formData.content.trim()}
              >
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {mode === 'create' ? '작성 중...' : '수정 중...'}
                  </>
                ) : (
                  mode === 'create' ? '게시글 작성' : '게시글 수정'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}